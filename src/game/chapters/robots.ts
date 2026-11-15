import { ChapterScene } from './ChapterScene';
import { chapters } from './catalog';
import {
  CARGO_ASTEROIDS,
  CARGO_WORLD,
  ROVER_SITES,
  type CargoControls,
  type RobotsState,
  type RoverControls,
  type RoverSite,
  chooseRoverSite,
  deployRover,
  initialRobotsState,
  landCargoRocket,
  launchRoverMission,
  restartRoverMission,
  sampleRoverWater,
  stepCargoFlight,
  stepRover,
  takeRoverPhoto,
} from './robots.logic';

export {
  CARGO_ASTEROIDS,
  CARGO_WORLD,
  ROVER_SITES,
  type CargoControls,
  type RobotsState,
  type RoverControls,
  type RoverSite,
} from './robots.logic';
export {
  chooseRoverSite,
  deployRover,
  initialRobotsState,
  landCargoRocket,
  launchRoverMission,
  restartRoverMission,
  sampleRoverWater,
  stepCargoFlight,
  stepRover,
  takeRoverPhoto,
} from './robots.logic';

const panelStyles = `
  .rover-panel{pointer-events:auto;max-width:1000px;margin:18px auto 58px;padding:22px 26px;border:1px solid #47728a;border-radius:16px;background:linear-gradient(145deg,#102a42f2,#09192bf5);box-shadow:0 18px 50px #0005;color:#edf8ff;font:16px Arial,sans-serif}
  .rover-panel *{box-sizing:border-box}.rover-panel .eyebrow{margin:0;color:#79e6dc;font-size:12px;font-weight:bold;letter-spacing:.18em}
  .rover-panel h2{margin:8px 0 4px;color:#fff;font-size:clamp(24px,4vw,36px)}.rover-panel h3{margin:16px 0 8px;color:#e8f5ff;font-size:16px}
  .rover-panel .intro{margin:8px 0 18px;color:#c3d8e6;line-height:1.55}.rover-panel .mission-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:14px;margin:16px 0}
  .rover-panel .camera,.rover-panel .map,.rover-panel .telemetry,.rover-panel .cargo-view{border:1px solid #31516a;border-radius:12px;background:#071827}
  .rover-panel .view-title{display:flex;justify-content:space-between;padding:10px 12px;color:#8ce9db;font-size:11px;font-weight:bold;letter-spacing:.12em}
  .rover-panel svg{display:block;width:100%;height:auto}.rover-panel .views{display:grid;gap:10px}
  .rover-panel .telemetry{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:10px;background:#0d2438}
  .rover-panel .stat{padding:10px;border:1px solid #31516a;border-radius:8px;background:#15334d}.rover-panel .stat span{display:block;color:#a8c6d9;font-size:10px;text-transform:uppercase;letter-spacing:.08em}.rover-panel .stat strong{display:block;margin-top:6px;color:#fff;font-size:19px}
  .rover-panel .progress{height:8px;margin:12px 0 18px;border-radius:8px;background:#27455b;overflow:hidden}.rover-panel .progress span{display:block;height:100%;border-radius:8px;background:#79e6dc;transition:width .25s}
  .rover-panel .message{min-height:44px;margin:14px 0;padding:12px 14px;border-left:3px solid #79e6dc;border-radius:5px;background:#102940;color:#e5f4ff;line-height:1.5}
  .rover-panel .controls{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin:12px 0}.rover-panel .hold-control{touch-action:none;user-select:none}
  .rover-panel button{min-height:44px;padding:10px 14px;border:1px solid #71cfc8;border-radius:8px;background:#124354;color:#fff;font-weight:bold}
  .rover-panel button:hover:not(:disabled){background:#1b6572}.rover-panel button:disabled{opacity:.45;cursor:default}
  .rover-panel .jobs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0}
  .rover-panel .job{padding:10px;border:1px solid #31516a;border-radius:8px;background:#15334d;color:#d9eaf4;font-size:13px}.rover-panel .job.done{border-color:#5faaa3;background:#123d46}
  .rover-panel .note{margin:12px 0 0;color:#9eb8ca;font-size:12px;line-height:1.45}.rover-panel .key-hint{text-align:center;color:#a8c6d9;font-size:12px}
  .rover-panel [hidden]{display:none!important}.rover-panel .hold-control{touch-action:none;user-select:none}
  @media(max-width:700px){.rover-panel{margin:12px 14px 55px;padding:17px}.rover-panel .mission-grid{grid-template-columns:1fr}.rover-panel .jobs{grid-template-columns:1fr}}
`;

const cargoControlsTemplate: CargoControls = { left: false, right: false, up: false, down: false };
const roverControlsTemplate: RoverControls = { left: false, right: false, forward: false, reverse: false };
const cargoPhases = ['transfer', 'approach'] as const;
const roverPhases = ['driving', 'complete'] as const;

export class RobotsScene extends ChapterScene {
  private roverState: RobotsState = { ...initialRobotsState };
  private readonly cargoControls: CargoControls = { ...cargoControlsTemplate };
  private readonly roverControls: RoverControls = { ...roverControlsTemplate };
  private renderMission: (() => void) | undefined;
  private lastMissionRender = 0;

  constructor() { super(chapters[1]); }

  protected createMission(): void {
    const chapterView = document.getElementById('chapter-view');
    if (!chapterView) return;

    this.roverState = restartRoverMission();
    Object.assign(this.cargoControls, cargoControlsTemplate);
    Object.assign(this.roverControls, roverControlsTemplate);
    this.lastMissionRender = 0;
    const label = document.getElementById('chapter-label');
    if (label) label.textContent = 'MISSION 02 / Robots go first';

    const panel = document.createElement('section');
    panel.className = 'rover-panel';
    panel.dataset.missionPanel = 'robots';
    panel.setAttribute('aria-label', 'Lunar rover mission control');
    const styles = document.createElement('style');
    styles.textContent = panelStyles;
    panel.append(styles);

    const content = document.createElement('div');
    content.innerHTML = `
      <p class="eyebrow">CONTINUOUS GAME · STAGE 2 OF 2</p>
      <h2>Fly the rover rocket to the Moon</h2>
      <p class="intro">Choose a landing target, launch the uncrewed cargo rocket from Earth, and pilot it to the Moon. Brake for a safe landing, deploy the rover, then drive to map the terrain, photograph the surface, and look for water ice.</p>
      <div class="cargo-view" id="cargo-flight-view" aria-label="Live cargo rocket flight camera" hidden>
        <div class="view-title"><span>LIVE CARGO ROCKET FLIGHT · EARTH IS LARGER THAN THE MOON</span><span id="cargo-camera-state">● READY</span></div>
        <svg viewBox="0 0 1000 600" role="img" aria-label="Live view of the cargo rocket traveling from Earth to the Moon">
          <defs><radialGradient id="cargo-space"><stop stop-color="#173b56"/><stop offset="1" stop-color="#06121f"/></radialGradient></defs>
          <rect width="1000" height="600" fill="url(#cargo-space)"/>
          <g fill="#e1f4ff" opacity=".8"><circle cx="170" cy="210" r="2"/><circle cx="300" cy="90" r="2"/><circle cx="470" cy="500" r="2"/><circle cx="590" cy="100" r="2"/><circle cx="930" cy="120" r="2"/><circle cx="925" cy="500" r="2"/></g>
          <polyline id="cargo-flight-path" points="" fill="none" stroke="#77e6d7" stroke-width="3" stroke-dasharray="8 7" opacity=".8"/>
          <g id="cargo-earth"><circle r="64" fill="#24689e" stroke="#8bd4f5" stroke-width="4"/><path d="M-46-17Q-28-58-5-42L13-30 3-13-15-17-25 3-46 5ZM4-7 24-27 49-16 42 5 27 9 22 32 7 47-3 25-18 12-13-3Z" fill="#73b98a"/><path d="M-55-29Q-22-66 23-53M-52 30Q-18 57 31 48" fill="none" stroke="#d4f4ff" stroke-width="4" opacity=".8"/></g>
          <g id="cargo-moon"><circle r="22" fill="#a9bac9" stroke="#e1e9ee" stroke-width="2"/><circle cx="-7" cy="-5" r="5" fill="#75899a"/><circle cx="9" cy="8" r="6" fill="#7e92a2"/></g>
          <g id="cargo-site" fill="none" stroke="#ffcf71" stroke-width="3"><circle r="14"/><path d="M-24 0H24M0-24V24"/></g>
          <g id="cargo-asteroids" fill="#827b73" stroke="#c0b9a7" stroke-width="2"></g>
          <g id="cargo-ship"><path d="M0-17 12 13 0 7-12 13Z" fill="#d9e8ef" stroke="#fff4d5" stroke-width="2"/><path d="M-7 8 0 1 7 8M-4-7H4" fill="none" stroke="#587589" stroke-width="2"/><circle cy="-8" r="4" fill="#52d9f2"/><circle cx="-5" cy="1" r="2" fill="#ff8fc7"/><circle cx="5" cy="1" r="2" fill="#ff8fc7"/><circle cy="6" r="2" fill="#ff8fc7"/></g>
          <text x="100" y="145" fill="#dcefff" font-size="16" text-anchor="middle">EARTH · LAUNCH BASE</text>
          <text x="790" y="292" fill="#dcefff" font-size="16" text-anchor="middle">MOON</text>
          <text id="cargo-coordinate" x="18" y="578" fill="#9efaf0" font-size="14"></text>
        </svg>
        <div class="telemetry">
          <div class="stat"><span>Rocket flight state</span><strong id="cargo-phase">Transfer</strong></div>
          <div class="stat"><span>Propellant</span><strong id="cargo-fuel">100%</strong></div>
          <div class="stat"><span>Earth signal</span><strong id="cargo-signal">100%</strong></div>
          <div class="stat"><span>Position</span><strong id="cargo-position">100, 119</strong></div>
          <div class="stat"><span>Speed</span><strong id="cargo-speed">0.0 m/s</strong></div>
          <div class="stat"><span>Selected landing site</span><strong id="cargo-target">Not selected</strong></div>
        </div>
      </div>
      <div class="mission-grid" id="rover-surface-view" hidden>
        <div class="views">
          <div class="camera" aria-label="Live rover camera">
            <div class="view-title"><span>LIVE ROVER CAMERA</span><span id="rover-camera-state">● STANDBY</span></div>
            <svg viewBox="0 0 360 200" role="img" aria-label="Live camera view of the lunar surface">
              <defs><linearGradient id="lunar-sky" x2="0" y2="1"><stop stop-color="#081827"/><stop offset=".58" stop-color="#293c4a"/><stop offset=".59" stop-color="#716a65"/><stop offset="1" stop-color="#282f35"/></linearGradient></defs>
              <rect width="360" height="200" fill="url(#lunar-sky)"/>
              <circle cx="306" cy="38" r="20" fill="#d6d3c9" opacity=".8"/>
              <path id="rover-horizon" d="" fill="#8d8073"/>
              <g id="rover-rocks" fill="#554e4b"><ellipse cx="46" cy="145" rx="14" ry="8"/><ellipse cx="125" cy="161" rx="21" ry="11"/><ellipse cx="250" cy="148" rx="17" ry="9"/><ellipse cx="330" cy="165" rx="22" ry="12"/></g>
              <text id="rover-camera-coordinate" x="12" y="18" fill="#9efaf0" font-size="11"></text>
              <text x="12" y="188" fill="#d2e7ed" font-size="10">LIVE FEED · IMAGE CAPTURE READY</text>
            </svg>
          </div>
          <div class="map" aria-label="Rover navigation map">
            <div class="view-title"><span>SURFACE MAP</span><span id="rover-map-count">0 TILES</span></div>
            <svg viewBox="0 0 360 160" role="img" aria-label="Map showing the rover route and crater target">
              <rect width="360" height="160" fill="#102535"/>
              <g stroke="#3b596c" stroke-width="1"><path d="M20 20H340M20 50H340M20 80H340M20 110H340M20 140H340M20 20V140M84 20V140M148 20V140M212 20V140M276 20V140M340 20V140"/></g>
              <circle cx="250" cy="50" r="20" fill="#453e57" stroke="#cfb4ff" stroke-width="2"/>
              <text x="250" y="53" fill="#f3eaff" font-size="8" text-anchor="middle">ICE</text>
              <polyline id="rover-path" points="" fill="none" stroke="#74ead6" stroke-width="2" stroke-dasharray="3 3"/>
              <g id="rover-map-ship"><path d="M0-8 6 6 0 3-6 6Z" fill="#ffcf71" stroke="#fff4d5" stroke-width="1.5"/></g>
            </svg>
          </div>
        </div>
        <div class="telemetry">
          <div class="stat"><span>Rover state</span><strong id="rover-phase">On launch pad</strong></div>
          <div class="stat"><span>Battery</span><strong id="rover-battery">100%</strong></div>
          <div class="stat"><span>Earth signal</span><strong id="rover-signal">70%</strong></div>
          <div class="stat"><span>Position</span><strong id="rover-position">8.0, 20.0</strong></div>
          <div class="stat"><span>Speed</span><strong id="rover-speed">0.0 m/s</strong></div>
          <div class="stat"><span>Autonomy</span><strong id="rover-autonomy">60%</strong></div>
        </div>
      </div>
      <div id="rover-jobs" hidden>
        <div class="progress" role="progressbar" aria-label="Rover mission progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="rover-progress" style="width:0%"></span></div>
        <div class="jobs">
          <div class="job" id="rover-photo-job">📷 Photos <span id="rover-photo-count">0/3</span></div>
          <div class="job" id="rover-map-job">🗺️ Map <span id="rover-map-job-count">0/5</span></div>
          <div class="job" id="rover-water-job">🧪 Soil <span id="rover-water-status">not sampled</span></div>
        </div>
      </div>
      <p class="message" id="rover-message" aria-live="polite"></p>
      <div class="action-dock" id="rover-action-dock" aria-label="Rover mission controls">
        <div class="controls" id="rover-site"><button type="button" data-action="site" data-site="${ROVER_SITES.sunnyRidge}">Select sunny ridge</button><button type="button" data-action="site" data-site="${ROVER_SITES.shadowedCrater}">Select shadowed crater</button></div>
        <div class="controls" id="rover-launch" hidden><button type="button" data-action="launch">Launch the rover rocket</button></div>
        <div class="controls" id="cargo-controls" hidden>
          <button type="button" class="hold-control" data-cargo-control="left" aria-label="Thrust cargo rocket left">◀ Left thruster</button>
          <button type="button" class="hold-control" data-cargo-control="up" aria-label="Thrust cargo rocket up">▲ Main thruster</button>
          <button type="button" class="hold-control" data-cargo-control="down" aria-label="Reverse cargo rocket thrust">▼ Reverse thruster</button>
          <button type="button" class="hold-control" data-cargo-control="right" aria-label="Thrust cargo rocket right">Right thruster ▶</button>
        </div>
        <p class="key-hint" id="cargo-hint" hidden>Hold arrow keys or a thruster button to pilot. Let go to auto-brake, or use reverse thrust to slow down faster.</p>
        <div class="controls" id="cargo-land" hidden><button type="button" data-action="land">Attempt soft landing at selected site</button></div>
        <div class="controls" id="rover-deploy" hidden><button type="button" data-action="deploy">Deploy rover from the lander</button></div>
        <div id="rover-driving" hidden>
          <div class="controls" role="group" aria-label="Hold to steer the rover">
            <button type="button" class="hold-control" data-rover-control="left" aria-label="Steer rover left">◀ Steer left</button>
            <button type="button" class="hold-control" data-rover-control="forward" aria-label="Accelerate rover">▲ Accelerate</button>
            <button type="button" class="hold-control" data-rover-control="reverse" aria-label="Reverse rover">▼ Reverse</button>
            <button type="button" class="hold-control" data-rover-control="right" aria-label="Steer rover right">Steer right ▶</button>
          </div>
          <p class="key-hint">Hold arrows to drive. Let go to auto-brake; press P to take a picture.</p>
          <div class="controls"><button type="button" data-action="photo">Take picture · camera shutter</button><button type="button" data-action="water">Collect crater soil sample</button></div>
        </div>
        <div class="controls" id="rover-replay" hidden><button type="button" data-action="replay">Replay rover mission</button></div>
      </div>
      <p class="note">This uncrewed rocket carries the rover to the lunar surface. Moon terrain can block radio; the rover's camera and map continue working during a blackout.</p>`;
    panel.append(content);

    const flightAsteroids = content.querySelector<SVGGElement>('#cargo-asteroids')!;
    flightAsteroids.innerHTML = CARGO_ASTEROIDS.map((asteroid) =>
      `<circle cx="${asteroid.x}" cy="${asteroid.y}" r="${asteroid.radius}" />`,
    ).join('');
    const updateDisplay = (): void => {
      const state = this.roverState;
      const speed = Math.hypot(state.vx, state.vy);
      const flightActive = cargoPhases.includes(state.phase as typeof cargoPhases[number]);
      const roverActive = roverPhases.includes(state.phase as typeof roverPhases[number]);
      const flightView = content.querySelector<HTMLElement>('#cargo-flight-view')!;
      flightView.hidden = !flightActive;
      content.querySelector<HTMLElement>('#rover-surface-view')!.hidden = !roverActive;
      content.querySelector<HTMLElement>('#rover-jobs')!.hidden = !roverActive;
      content.querySelector<HTMLElement>('#rover-site')!.hidden = state.phase !== 'site-choice';
      content.querySelector<HTMLElement>('#rover-launch')!.hidden = state.phase !== 'briefing';
      content.querySelector<HTMLElement>('#cargo-controls')!.hidden = !flightActive;
      content.querySelector<HTMLElement>('#cargo-hint')!.hidden = !flightActive;
      content.querySelector<HTMLElement>('#cargo-land')!.hidden = state.phase !== 'approach';
      content.querySelector<HTMLElement>('#rover-deploy')!.hidden = state.phase !== 'landing';
      content.querySelector<HTMLElement>('#rover-driving')!.hidden = state.phase !== 'driving';
      content.querySelector<HTMLElement>('#rover-replay')!.hidden = state.phase !== 'complete' && state.phase !== 'crashed';
      content.querySelector<HTMLElement>('#rover-message')!.textContent = state.message;
      content.querySelector<HTMLElement>('#cargo-camera-state')!.textContent = state.signal < 100 ? '● EARTH LINK WEAK' : '● LIVE';

      const cargoEarth = content.querySelector<SVGGElement>('#cargo-earth')!;
      const cargoMoon = content.querySelector<SVGGElement>('#cargo-moon')!;
      const cargoShip = content.querySelector<SVGGElement>('#cargo-ship')!;
      const cargoSite = content.querySelector<SVGGElement>('#cargo-site')!;
      cargoEarth.setAttribute('transform', `translate(${CARGO_WORLD.earth.x} ${CARGO_WORLD.earth.y})`);
      cargoMoon.setAttribute('transform', `translate(${CARGO_WORLD.moon.x} ${CARGO_WORLD.moon.y})`);
      const target = state.site ? CARGO_WORLD.sites[state.site] : CARGO_WORLD.moon;
      cargoSite.setAttribute('transform', `translate(${target.x} ${target.y})`);
      cargoSite.setAttribute('visibility', state.site ? 'visible' : 'hidden');
      cargoShip.setAttribute('transform', `translate(${state.x.toFixed(1)} ${state.y.toFixed(1)}) rotate(${(90 - state.heading * 180 / Math.PI).toFixed(1)})`);
      content.querySelector<SVGPolylineElement>('#cargo-flight-path')!.setAttribute('points', state.path.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' '));
      content.querySelector<SVGTextElement>('#cargo-coordinate')!.textContent = `CARGO ROCKET ${state.x.toFixed(0)}, ${state.y.toFixed(0)} · ${state.fuel.toFixed(0)}% PROPELLANT`;
      content.querySelector<HTMLElement>('#cargo-phase')!.textContent = state.phase === 'approach' ? 'Lunar approach' : state.phase === 'crashed' ? 'Flight ended' : 'Transfer';
      content.querySelector<HTMLElement>('#cargo-fuel')!.textContent = `${state.fuel.toFixed(0)}%`;
      content.querySelector<HTMLElement>('#cargo-signal')!.textContent = `${state.signal}%`;
      content.querySelector<HTMLElement>('#cargo-position')!.textContent = `${state.x.toFixed(0)}, ${state.y.toFixed(0)}`;
      content.querySelector<HTMLElement>('#cargo-speed')!.textContent = `${speed.toFixed(1)} m/s`;
      content.querySelector<HTMLElement>('#cargo-target')!.textContent = state.site === ROVER_SITES.sunnyRidge ? 'Sunny ridge' : state.site === ROVER_SITES.shadowedCrater ? 'Shadowed crater' : 'Not selected';

      const mapPoint = (point: { x: number; y: number }): { x: number; y: number } => ({
        x: 20 + point.x * 3.2,
        y: 140 - point.y * 1.2,
      });
      const ship = mapPoint(state);
      content.querySelector<SVGPolylineElement>('#rover-path')?.setAttribute('points', state.path.map((point) => {
        const mapped = mapPoint(point);
        return `${mapped.x.toFixed(1)},${mapped.y.toFixed(1)}`;
      }).join(' '));
      content.querySelector<SVGGElement>('#rover-map-ship')?.setAttribute('transform', `translate(${ship.x.toFixed(1)} ${ship.y.toFixed(1)}) rotate(${(90 - state.heading * 180 / Math.PI).toFixed(1)})`);
      const horizonOffset = Math.sin(state.x / 12) * 12 + Math.cos(state.y / 17) * 7;
      content.querySelector<SVGPathElement>('#rover-horizon')?.setAttribute('d', `M0 ${116 + horizonOffset}Q70 ${88 - horizonOffset} 130 ${119 + horizonOffset}T250 ${108 - horizonOffset}T360 ${114 + horizonOffset}V200H0Z`);
      content.querySelector<SVGElement>('#rover-rocks')?.setAttribute('transform', `translate(${(state.x * -2.4) % 40} ${(state.y * 1.2) % 12})`);
      const cameraCoordinate = content.querySelector<SVGTextElement>('#rover-camera-coordinate');
      if (cameraCoordinate) cameraCoordinate.textContent = `CAMERA ${state.x.toFixed(1)}, ${state.y.toFixed(1)}`;
      content.querySelector<HTMLElement>('#rover-map-count')!.textContent = `${state.mappedTiles.length} TILES`;
      content.querySelector<HTMLElement>('#rover-phase')!.textContent = state.phase === 'complete' ? 'Survey complete' : 'Driving';
      content.querySelector<HTMLElement>('#rover-battery')!.textContent = `${state.battery.toFixed(0)}%`;
      content.querySelector<HTMLElement>('#rover-signal')!.textContent = `${state.signal}%`;
      content.querySelector<HTMLElement>('#rover-position')!.textContent = `${state.x.toFixed(1)}, ${state.y.toFixed(1)}`;
      content.querySelector<HTMLElement>('#rover-speed')!.textContent = `${speed.toFixed(1)} m/s`;
      content.querySelector<HTMLElement>('#rover-autonomy')!.textContent = `${state.autonomy}%`;
      content.querySelector<HTMLElement>('#rover-camera-state')!.textContent = state.phase === 'driving' ? '● RECORDING' : '● SURVEY COMPLETE';
      content.querySelector<HTMLElement>('#rover-photo-count')!.textContent = `${state.photos.length}/3`;
      content.querySelector<HTMLElement>('#rover-map-job-count')!.textContent = `${state.mappedTiles.length}/5`;
      content.querySelector<HTMLElement>('#rover-water-status')!.textContent = state.waterSampled ? 'sampled' : 'not sampled';
      content.querySelector<HTMLElement>('#rover-photo-job')!.classList.toggle('done', state.photos.length >= 3);
      content.querySelector<HTMLElement>('#rover-map-job')!.classList.toggle('done', state.mappedTiles.length >= 5);
      content.querySelector<HTMLElement>('#rover-water-job')!.classList.toggle('done', state.waterSampled);
      const progress = state.phase === 'complete' ? 100 : Math.min(95, state.photos.length * 18 + Math.min(state.mappedTiles.length, 5) * 7 + (state.waterSampled ? 20 : 0));
      content.querySelector<HTMLElement>('#rover-progress')!.style.width = `${progress}%`;
      content.querySelector<HTMLElement>('[role="progressbar"]')!.setAttribute('aria-valuenow', `${progress}`);
    };
    this.renderMission = updateDisplay;

    const bindControls = <T extends CargoControls | RoverControls>(
      selector: string,
      controlState: T,
      template: T,
      mapping: Record<string, keyof T>,
      pulse: (controls: T) => void,
    ): void => {
      const mutableControls = controlState as Record<keyof T, boolean>;
      panel.querySelectorAll<HTMLButtonElement>(selector).forEach((button) => {
        const control = mapping[button.dataset.cargoControl ?? button.dataset.roverControl ?? ''];
        if (!control) return;
        button.addEventListener('pointerdown', (event) => {
          event.preventDefault();
          mutableControls[control] = true;
        });
        const release = (): void => { mutableControls[control] = false; };
        button.addEventListener('pointerup', release);
        button.addEventListener('pointerleave', release);
        button.addEventListener('pointercancel', release);
        button.addEventListener('click', () => {
          const quick = { ...template, [control]: true } as T;
          pulse(quick);
          updateDisplay();
        });
      });
    };
    bindControls<CargoControls>('[data-cargo-control]', this.cargoControls, cargoControlsTemplate, {
      left: 'left', right: 'right', up: 'up', down: 'down',
    }, (controls) => { this.roverState = stepCargoFlight(this.roverState, controls, 0.12); });
    bindControls<RoverControls>('[data-rover-control]', this.roverControls, roverControlsTemplate, {
      left: 'left', right: 'right', forward: 'forward', reverse: 'reverse',
    }, (controls) => { this.roverState = stepRover(this.roverState, controls, 0.12); });

    panel.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest<HTMLButtonElement>('button[data-action]');
      if (!button) return;
      if (button.dataset.action === 'site') this.roverState = chooseRoverSite(this.roverState, button.dataset.site as RoverSite);
      else if (button.dataset.action === 'launch') this.roverState = launchRoverMission(this.roverState);
      else if (button.dataset.action === 'land') this.roverState = landCargoRocket(this.roverState);
      else if (button.dataset.action === 'deploy') this.roverState = deployRover(this.roverState);
      else if (button.dataset.action === 'photo') this.roverState = takeRoverPhoto(this.roverState);
      else if (button.dataset.action === 'water') this.roverState = sampleRoverWater(this.roverState);
      else if (button.dataset.action === 'replay') this.roverState = restartRoverMission();
      updateDisplay();
    });

    const keyboard = this.input.keyboard;
    const cargoKeyControls: Record<string, keyof CargoControls> = {
      arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right',
      arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down',
    };
    const roverKeyControls: Record<string, keyof RoverControls> = {
      arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right',
      arrowup: 'forward', w: 'forward', arrowdown: 'reverse', s: 'reverse',
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      const key = event.key.toLowerCase();
      if (cargoPhases.includes(this.roverState.phase as typeof cargoPhases[number])) {
        const control = cargoKeyControls[key];
        if (!control) return;
        event.preventDefault();
        this.cargoControls[control] = true;
      } else if (this.roverState.phase === 'driving') {
        const control = roverKeyControls[key];
        if (!control) return;
        event.preventDefault();
        this.roverControls[control] = true;
      }
    };
    const onKeyUp = (event: KeyboardEvent): void => {
      const key = event.key.toLowerCase();
      const cargoControl = cargoKeyControls[key];
      const roverControl = roverKeyControls[key];
      if (cargoControl) this.cargoControls[cargoControl] = false;
      if (roverControl) this.roverControls[roverControl] = false;
      if (key === 'p' && this.roverState.phase === 'driving') {
        this.roverState = takeRoverPhoto(this.roverState);
        updateDisplay();
      }
    };
    const releaseControls = (): void => {
      Object.assign(this.cargoControls, cargoControlsTemplate);
      Object.assign(this.roverControls, roverControlsTemplate);
    };
    const onVisibilityChange = (): void => {
      if (document.hidden) releaseControls();
    };
    keyboard?.on('keydown', onKeyDown);
    keyboard?.on('keyup', onKeyUp);
    window.addEventListener('blur', releaseControls);
    document.addEventListener('visibilitychange', onVisibilityChange);

    chapterView.append(panel);
    const cleanup = (): void => {
      keyboard?.off('keydown', onKeyDown);
      keyboard?.off('keyup', onKeyUp);
      window.removeEventListener('blur', releaseControls);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      releaseControls();
      this.renderMission = undefined;
      panel.remove();
    };
    this.events.once('shutdown', cleanup);
    this.events.once('destroy', cleanup);
    updateDisplay();
  }

  update(time: number, delta: number): void {
    if (cargoPhases.includes(this.roverState.phase as typeof cargoPhases[number])) {
      this.roverState = stepCargoFlight(this.roverState, this.cargoControls, delta / 1000);
    } else if (this.roverState.phase === 'driving') {
      this.roverState = stepRover(this.roverState, this.roverControls, delta / 1000);
    } else return;
    if (time - this.lastMissionRender >= 80) {
      this.lastMissionRender = time;
      this.renderMission?.();
    }
  }
}
