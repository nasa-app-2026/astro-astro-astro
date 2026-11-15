import { ChapterScene } from './ChapterScene';
import { chapters } from './catalog';
import {
  FLIGHT_ASTEROIDS,
  FLIGHT_WORLD,
  FLYBY_SCIENCE,
  FLYBY_SCIENCE_LABELS,
  type FlightPlan,
  type FlightControls,
  type FlybyScience,
  type FlybyState,
  collectFlybyScience,
  configureFlyby,
  initialFlybyState,
  launchFlyby,
  restartFlyby,
  stepFlyby,
} from './flyby.logic';

export {
  DEFAULT_FLIGHT_PLAN,
  FLIGHT_ASTEROIDS,
  FLIGHT_WORLD,
  FLYBY_SCIENCE,
  FLYBY_SCIENCE_LABELS,
  type FlightPlan,
  type FlightControls,
  type FlybyScience,
  type FlybyState,
} from './flyby.logic';
export { collectFlybyScience, configureFlyby, initialFlybyState, launchFlyby, restartFlyby, stepFlyby } from './flyby.logic';

const panelStyles = `
  .flyby-panel{pointer-events:auto;max-width:1000px;margin:18px auto 58px;padding:22px 26px 240px;border:1px solid #47728a;border-radius:16px;background:linear-gradient(145deg,#102a42f2,#09192bf5);box-shadow:0 18px 50px #0005;color:#edf8ff;font:16px Arial,sans-serif}
  .flyby-panel *{box-sizing:border-box}.flyby-panel .eyebrow{margin:0;color:#79e6dc;font-size:12px;font-weight:bold;letter-spacing:.18em}
  .flyby-panel h2{margin:8px 0 4px;color:#fff;font-size:clamp(24px,4vw,36px)}.flyby-panel h3{margin:16px 0 8px;color:#e8f5ff;font-size:16px}
  .flyby-panel .intro{margin:8px 0 18px;color:#c3d8e6;line-height:1.55}.flyby-panel .mission-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:14px;margin:16px 0}
  .flyby-panel .camera,.flyby-panel .telemetry{border:1px solid #31516a;border-radius:12px;background:#071827}
  .flyby-panel .camera{overflow:hidden}.flyby-panel .camera-title{display:flex;justify-content:space-between;padding:10px 12px;color:#8ce9db;font-size:11px;font-weight:bold;letter-spacing:.12em}
  .flyby-panel .camera svg{display:block;width:100%;height:auto}.flyby-panel .telemetry{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:10px;background:#0d2438}
  .flyby-panel .stat{padding:10px;border:1px solid #31516a;border-radius:8px;background:#15334d}.flyby-panel .stat span{display:block;color:#a8c6d9;font-size:10px;text-transform:uppercase;letter-spacing:.08em}.flyby-panel .stat strong{display:block;margin-top:6px;color:#fff;font-size:19px}
  .flyby-panel .progress{height:8px;margin:12px 0 18px;border-radius:8px;background:#27455b;overflow:hidden}.flyby-panel .progress span{display:block;height:100%;border-radius:8px;background:#79e6dc;transition:width .25s}
  .flyby-panel .message{min-height:44px;margin:14px 0;padding:12px 14px;border-left:3px solid #79e6dc;border-radius:5px;background:#102940;color:#e5f4ff;line-height:1.5}
  .flyby-panel .controls{display:flex;justify-content:center;flex-wrap:wrap;gap:10px;margin:12px 0}
  .flyby-panel .action-dock{position:fixed;left:50%;bottom:58px;z-index:20;width:min(1000px,calc(100vw - 24px));max-height:50vh;overflow:hidden;transform:translateX(-50%);padding:8px 14px;border:1px solid #47728a;border-radius:12px;background:#081827f5;box-shadow:0 8px 30px #0009}
  .flyby-panel .action-dock .controls{margin:6px 0}
  .flyby-panel .action-dock .plan{margin:4px 0}
  .flyby-panel #flyby-instruments{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
  .flyby-panel #flyby-instruments button{min-height:40px;padding:6px;font-size:12px}
  .flyby-panel button{min-height:44px;padding:10px 14px;border:1px solid #71cfc8;border-radius:8px;background:#124354;color:#fff;font-weight:bold}
  .flyby-panel button:hover:not(:disabled){background:#1b6572}.flyby-panel button:disabled{opacity:.45;cursor:default}
  .flyby-panel .science-list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:12px 0}
  .flyby-panel .science-card{display:flex;align-items:center;gap:8px;min-height:48px;padding:10px;border:1px solid #31516a;border-radius:8px;background:#15334d;color:#d9eaf4;font-size:13px}
  .flyby-panel kbd{display:inline-grid;place-items:center;min-width:24px;padding:3px 6px;border:1px solid #71cfc8;border-radius:4px;background:#0a1c2b;color:#8ce9db;font:700 12px Arial,sans-serif}
  .flyby-panel .science-card.done{border-color:#5faaa3;background:#123d46}
  .flyby-panel .note{margin:12px 0 0;color:#9eb8ca;font-size:12px;line-height:1.45}.flyby-panel .key-hint{text-align:center;color:#a8c6d9;font-size:12px}
  .flyby-panel .plan{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:14px 0;padding:14px;border:1px solid #31516a;border-radius:10px;background:#0d2438}
  .flyby-panel .plan label{display:grid;gap:7px;color:#d9eaf4;font-size:13px;font-weight:bold}
  .flyby-panel .plan output{color:#8ce9db}.flyby-panel input[type=range]{width:100%;accent-color:#79e6dc}
  .flyby-panel .dummy-note{margin:10px 0;padding:10px 12px;border:1px solid #876d4f;border-radius:8px;background:#352d24;color:#ffdfaa;font-size:13px}
  .flyby-panel #flyby-orbit-guide{fill:none;stroke:#f2c66d;stroke-width:1.5;stroke-dasharray:5 5;opacity:.7;animation:orbit-pulse 2s ease-in-out infinite}
  .flyby-panel #flyby-asteroids g{transform-box:fill-box;transform-origin:center;animation:asteroid-drift 5s ease-in-out infinite alternate}
  .flyby-panel #flyby-asteroids g:nth-child(even){animation-delay:-2s;animation-duration:7s}
  .flyby-panel #flyby-engine-flame{animation:engine-flicker .12s steps(2,end) infinite alternate}
  .flyby-panel #flyby-earth{animation:planet-glow 4s ease-in-out infinite}
  .flyby-panel.flyby-launching #flyby-ship{transform-box:fill-box;transform-origin:center;animation:flyby-liftoff 2s cubic-bezier(.2,.7,.3,1) both}
  .flyby-panel.flyby-launching #flyby-engine-flame{visibility:visible!important}
  .flyby-panel #flyby-moon{transform-box:fill-box;transform-origin:center;animation:moon-drift 7s ease-in-out infinite}
  .flyby-panel #flyby-path{animation:path-flow 1.2s linear infinite}
  .flyby-panel .camera-title span:last-child{animation:status-blink 2s ease-in-out infinite}
  .flyby-panel .science-card.done{animation:science-pop .35s ease-out}
  .flyby-panel .message{transition:background-color .25s,border-color .25s}
  @keyframes orbit-pulse{50%{opacity:.28;stroke-width:2.5}}
  @keyframes asteroid-drift{to{translate:0 -5px;rotate:8deg}}
  @keyframes engine-flicker{to{transform:scaleY(1.45);opacity:.7}}
  @keyframes planet-glow{50%{filter:drop-shadow(0 0 8px #4eafff99)}}
  @keyframes flyby-liftoff{0%{translate:-7px 24px;scale:.78}45%{translate:3px -12px;scale:1.08}100%{translate:0 0;scale:1}}
  @keyframes moon-drift{50%{translate:0 -2px}}
  @keyframes path-flow{to{stroke-dashoffset:-30}}
  @keyframes status-blink{50%{opacity:.55}}
  @keyframes science-pop{50%{transform:scale(1.035)}}
  @media(prefers-reduced-motion:reduce){.flyby-panel *, .flyby-panel *::before,.flyby-panel *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}}
  .flyby-panel [hidden]{display:none!important}.flyby-panel .hold-control{touch-action:none;user-select:none}
  @media(max-width:700px){.flyby-panel{margin:12px 14px 55px;padding:17px 17px 230px}.flyby-panel .action-dock{bottom:8px;width:calc(100vw - 16px);max-height:50vh;padding:6px}.flyby-panel .mission-grid,.flyby-panel .plan{grid-template-columns:1fr}.flyby-panel .science-list{grid-template-columns:repeat(2,minmax(0,1fr))}.flyby-panel #flyby-instruments{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;

const scienceActions: Array<{ science: FlybyScience; label: string; buttonLabel: string; key: string }> = [
  { science: FLYBY_SCIENCE.photos, label: 'Take crater photos', buttonLabel: 'Photos', key: 'P' },
  { science: FLYBY_SCIENCE.radiation, label: 'Measure radiation', buttonLabel: 'Radiation', key: 'R' },
  { science: FLYBY_SCIENCE.sunlight, label: 'Measure sunlight', buttonLabel: 'Sunlight', key: 'S' },
  { science: FLYBY_SCIENCE.gravity, label: 'Measure lunar gravity', buttonLabel: 'Gravity', key: 'G' },
];

const controlsTemplate: FlightControls = { left: false, right: false, up: false, down: false };

export class FlybyScene extends ChapterScene {
  private flightState: FlybyState = { ...initialFlybyState };
  private readonly heldControls: FlightControls = { ...controlsTemplate };
  private renderFlight: (() => void) | undefined;
  private rocketMarker: { setPosition(x: number, y: number): unknown; destroy(): void } | undefined;
  private readonly asteroidMarkers: Array<{ setPosition(x: number, y: number): unknown; destroy(): void }> = [];
  private lastFlightRender = 0;

  constructor() { super(chapters[0]); }

  protected createMission(): void {
    const chapterView = document.getElementById('chapter-view');
    if (!chapterView) return;

    this.flightState = { ...initialFlybyState, path: [] };
    Object.assign(this.heldControls, controlsTemplate);
    this.lastFlightRender = 0;

    const panel = document.createElement('section');
    panel.className = 'flyby-panel';
    panel.dataset.missionPanel = 'flyby';
    panel.setAttribute('aria-label', 'Moon flyby mission control');
    const styles = document.createElement('style');
    styles.textContent = panelStyles;
    panel.append(styles);

    const content = document.createElement('div');
    content.innerHTML = `
      <p class="eyebrow">CONTINUOUS GAME · STAGE 1 OF 2</p>
      <h2>Mission Control: Moon flyby</h2>
      <p class="intro">Launch from the pad, complete one full circuit along the gold orbit around the Moon, collect four science readings, then return safely to Earth. The controls stay pinned at the bottom, so you never need to scroll to steer or do a job.</p>
      <p class="note">Only fuel and power are limited. Take as much time as you need.</p>
      <div class="mission-grid">
        <div class="camera" aria-label="Live ship camera">
          <div class="camera-title"><span>LIVE FLIGHT CAMERA</span><span id="flyby-camera-state">● READY</span></div>
          <svg id="flyby-live-camera" viewBox="0 0 1000 200" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Rocket camera showing Earth, Moon, asteroids, and ship position">
            <defs><radialGradient id="flight-space"><stop stop-color="#173b56"/><stop offset="1" stop-color="#06121f"/></radialGradient></defs>
            <rect width="1000" height="200" fill="url(#flight-space)"/>
            <g fill="#e1f4ff" opacity=".8"><circle cx="24" cy="24" r="1"/><circle cx="128" cy="18" r="1.2"/><circle cx="220" cy="32" r=".9"/><circle cx="330" cy="18" r="1"/><circle cx="505" cy="174" r="1.1"/><circle cx="58" cy="105" r=".8"/><circle cx="420" cy="72" r="1.1"/><circle cx="740" cy="35" r="1.2"/><circle cx="925" cy="112" r="1.1"/></g>
            <path d="M102 142Q440 160 790 76" fill="none" stroke="#8fb5ca" stroke-width="1" stroke-dasharray="5 9" opacity=".28"/>
            <polyline id="flyby-path" points="" fill="none" stroke="#77e6d7" stroke-width="3" stroke-dasharray="8 7" opacity=".8"/>
            <ellipse id="flyby-orbit-guide" cx="780" cy="78" rx="42" ry="27"/>
            <text id="flyby-orbit-label" x="780" y="43" fill="#f2d18b" font-size="8" text-anchor="middle">REQUIRED LUNAR ORBIT · 0%</text>
            <g id="flyby-earth"><circle cx="0" cy="0" r="16" fill="#24689e" stroke="#8bd4f5" stroke-width="2"/><g transform="scale(.72)"><path d="M-20-7Q-12-24-2-17L4-12 0-5-7-7-11 0-19 2ZM2-3 10-10 20-6 17 2 11 4 9 13 3 19-1 10-7 5-5-1Z" fill="#73b98a"/><path d="M-24-12Q-10-28 9-22M-23 13Q-8 25 12 20" fill="none" stroke="#d4f4ff" stroke-width="2" opacity=".8"/></g><circle cx="0" cy="0" r="20" fill="none" stroke="#65c7e8" stroke-width="1" opacity=".65"/></g>
            <g id="flyby-moon"><circle cx="0" cy="0" r="8" fill="#a9bac9" stroke="#e1e9ee" stroke-width="1.5"/><circle cx="-3" cy="-2" r="2" fill="#75899a"/><circle cx="3" cy="3" r="2.5" fill="#7e92a2"/><circle cx="2" cy="-4" r="1" fill="#8195a3"/></g>
            <g id="flyby-asteroids"></g>
            <g id="flyby-ship"><path id="flyby-engine-flame" d="M-3 7 0 17 3 7Z" fill="#ff9a49" stroke="#ffe59a" stroke-width="1" visibility="hidden"/><path d="M0-11 7 7 0 4-7 7Z" fill="#d9e8ef" stroke="#fff4d5" stroke-width="1.2"/><path d="M-4 4 0 0 4 4M-2-4H2" fill="none" stroke="#587589" stroke-width="1"/><circle cy="-5" r="2" fill="#52d9f2"/><g fill="#ff8fc7"><circle cx="-3" cy="0" r="1.2"/><circle cx="3" cy="0" r="1.2"/><circle cy="3" r="1.2"/></g><text x="0" y="22" text-anchor="middle" fill="#ffe5ae" font-size="7">SURVEY ROCKET</text></g>
          </svg>
        </div>
        <div class="telemetry">
          <div class="stat"><span>Flight state</span><strong id="flyby-phase">On the launch pad</strong></div>
          <div class="stat"><span>Fuel</span><strong id="flyby-fuel">100%</strong></div>
          <div class="stat"><span>Stored power</span><strong id="flyby-battery">100%</strong></div>
          <div class="stat"><span>Position</span><strong id="flyby-position">100, 89</strong></div>
          <div class="stat"><span>Speed</span><strong id="flyby-speed">0.0 m/s</strong></div>
          <div class="stat"><span>Radiation</span><strong id="flyby-radiation">Not measured</strong></div>
        </div>
      </div>
      <div class="progress" role="progressbar" aria-label="Flyby mission progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="flyby-progress" style="width:0%"></span></div>
      <h3>Mission jobs · press P, R, S, or G</h3><div class="science-list" id="flyby-science"></div>
      <p class="message" id="flyby-message" aria-live="polite"></p>
      <div class="action-dock" id="flyby-action-dock" aria-label="Flight controls and mission actions">
        <div class="plan" id="flyby-plan">
          <label>Fuel <output id="fuel-output">100%</output>
            <input id="fuel-fill" type="range" min="0" max="100" step="10" value="100" aria-label="Rocket fuel load"/>
          </label>
          <label>Power <output id="battery-output">100%</output>
            <input id="battery-store" type="range" min="25" max="100" step="5" value="100" aria-label="Stored rocket energy"/>
          </label>
        </div>
        <div class="controls" id="flyby-launch"><button type="button" data-action="launch">Launch the survey rocket</button></div>
        <div id="flyby-flight" hidden>
          <div class="controls" role="group" aria-label="Hold to steer the spacecraft">
            <button type="button" class="hold-control" data-control="left" aria-label="Thrust left">◀ Left thruster</button>
            <button type="button" class="hold-control" data-control="up" aria-label="Thrust up">▲ Main thruster</button>
            <button type="button" class="hold-control" data-control="down" aria-label="Thrust down">▼ Reverse thruster</button>
            <button type="button" class="hold-control" data-control="right" aria-label="Thrust right">Right thruster ▶</button>
          </div>
          <p class="key-hint">Hold arrows to steer · X reverse · release to brake · P photos · R radiation · S sunlight · G gravity.</p>
          <div class="controls" id="flyby-instruments"></div>
        </div>
        <div class="controls" id="flyby-retry" hidden><button type="button" data-action="retry">Restart flight</button></div>
        <div class="controls" id="flyby-continue" hidden><button type="button" data-action="continue">Launch the rover mission</button></div>
      </div>
      <p class="note">Science references: Artemis I radiation measurements (~1 mSv/day near the Moon), sunlight at lunar distance (~1,361 W/m²), and lunar gravity (~1.62 m/s²). These are educational reference values, not live readings.</p>`;
    panel.append(content);

    this.rocketMarker = this.add.circle(100, 540, 10, 0xffcf71, 0.95).setDepth(8);
    this.asteroidMarkers.splice(0, this.asteroidMarkers.length);
    FLIGHT_ASTEROIDS.forEach((asteroid) => {
      this.asteroidMarkers.push(this.add.circle(
        asteroid.x / FLIGHT_WORLD.width * 1024,
        (FLIGHT_WORLD.height - asteroid.y) / FLIGHT_WORLD.height * 640,
        Math.max(5, asteroid.radius / FLIGHT_WORLD.width * 1024),
        0x827b73,
        0.9,
      ).setDepth(7));
    });

    const scienceList = content.querySelector<HTMLElement>('#flyby-science')!;
    scienceList.innerHTML = scienceActions.map(({ science, label, key }) => `<div class="science-card" data-science-card="${science}"><kbd>${key}</kbd>${label}</div>`).join('');
    const instruments = content.querySelector<HTMLElement>('#flyby-instruments')!;
    const powerCosts: Record<FlybyScience, number> = { photos: 15, radiation: 10, sunlight: 10, gravity: 8 };
    instruments.innerHTML = scienceActions.map(({ science, buttonLabel, key }) => `<button type="button" data-action="science" data-science="${science}" aria-label="${FLYBY_SCIENCE_LABELS[science]} (press ${key})" disabled><kbd>${key}</kbd> ${buttonLabel} · ${powerCosts[science]} P</button>`).join('');
    const planControls = {
      fuel: content.querySelector<HTMLInputElement>('#fuel-fill')!,
      battery: content.querySelector<HTMLInputElement>('#battery-store')!,
    };
    const updatePlanOutputs = (): void => {
      content.querySelector<HTMLOutputElement>('#fuel-output')!.value = `${planControls.fuel.value}%`;
      content.querySelector<HTMLOutputElement>('#battery-output')!.value = `${planControls.battery.value}%`;
    };
    planControls.fuel.addEventListener('input', updatePlanOutputs);
    planControls.battery.addEventListener('input', updatePlanOutputs);
    updatePlanOutputs();

    content.querySelector<SVGGElement>('#flyby-asteroids')!.innerHTML = FLIGHT_ASTEROIDS.map((_, index) =>
      `<g id="asteroid-${index}"><path d="M-12-5-6-12 3-11 12-4 10 7 3 12-8 9-13 2Z" fill="#827b73" stroke="#c0b9a7" stroke-width="1.8"/><path d="M-7-7-2-9 2-4-4-2ZM3 3 8 0 9 5 4 8Z" fill="#b9ada4" stroke="#68645f" stroke-width="1"/><circle cx="-8" cy="3" r="1.6" fill="#5b5855"/></g>`,
    ).join('');

    const updateDisplay = (): void => {
      const state = this.flightState;
      const speed = Math.hypot(state.vx, state.vy);
      const flightActive = ['launching', 'cruise', 'returning'].includes(state.phase);
      panel.classList.toggle('flyby-launching', state.phase === 'launching');
      content.classList.toggle('flyby-flight-active', flightActive);
      const mapPoint = (point: { x: number; y: number }): { x: number; y: number } => ({
        x: 18 + point.x / FLIGHT_WORLD.width * 964,
        y: 12 + (FLIGHT_WORLD.height - point.y) / FLIGHT_WORLD.height * 146,
      });
      const earth = mapPoint(FLIGHT_WORLD.earth);
      const moon = mapPoint(FLIGHT_WORLD.moon);
      const ship = mapPoint(state);
      const liveCamera = content.querySelector<SVGSVGElement>('#flyby-live-camera');
      liveCamera?.setAttribute('viewBox', '0 0 1000 200');
      const earthElement = content.querySelector<SVGGElement>('#flyby-earth');
      const moonElement = content.querySelector<SVGGElement>('#flyby-moon');
      const shipElement = content.querySelector<SVGGElement>('#flyby-ship');
      earthElement?.setAttribute('transform', `translate(${earth.x.toFixed(1)} ${earth.y.toFixed(1)})`);
      moonElement?.setAttribute('transform', `translate(${moon.x.toFixed(1)} ${moon.y.toFixed(1)})`);
      shipElement?.setAttribute('transform', `translate(${ship.x.toFixed(1)} ${ship.y.toFixed(1)}) rotate(${(90 - state.heading * 180 / Math.PI).toFixed(1)}) scale(1.5)`);
      const engineFlame = content.querySelector<SVGPathElement>('#flyby-engine-flame');
      engineFlame?.setAttribute('visibility', Object.values(this.heldControls).some(Boolean) ? 'visible' : 'hidden');
      FLIGHT_ASTEROIDS.forEach((asteroid, index) => {
        const point = mapPoint(asteroid);
        content.querySelector<SVGGElement>(`#asteroid-${index}`)?.setAttribute('transform', `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`);
      });
      const pathPoints = state.path.map((point) => {
        const mapped = mapPoint(point);
        return `${mapped.x.toFixed(1)},${mapped.y.toFixed(1)}`;
      }).join(' ');
      content.querySelector<SVGPolylineElement>('#flyby-path')?.setAttribute('points', pathPoints);

      content.querySelector<HTMLElement>('#flyby-phase')!.textContent = ({
        briefing: 'On the launch pad',
        launching: 'Climbing through atmosphere',
        cruise: 'Deep-space flight',
        returning: 'Return to Earth',
        complete: 'Landed safely',
        crashed: 'Flight ended',
      })[state.phase];
      const orbitPercent = Math.floor(state.orbitProgress / (Math.PI * 2) * 100);
      content.querySelector<SVGTextElement>('#flyby-orbit-label')!.textContent = 'REQUIRED LUNAR ORBIT · ' + orbitPercent + '%';
      content.querySelector<HTMLElement>('#flyby-fuel')!.textContent = `${state.fuel.toFixed(0)}%`;
      content.querySelector<HTMLElement>('#flyby-battery')!.textContent = `${state.battery.toFixed(0)}%`;
      content.querySelector<HTMLElement>('#flyby-position')!.textContent = `${state.x.toFixed(0)}, ${state.y.toFixed(0)}`;
      content.querySelector<HTMLElement>('#flyby-speed')!.textContent = `${speed.toFixed(1)} m/s`;
      content.querySelector<HTMLElement>('#flyby-radiation')!.textContent = state.doseMsv ? `${state.doseMsv} mSv/day` : 'Not measured';
      content.querySelector<HTMLElement>('#flyby-message')!.textContent = state.message;
      content.querySelector<HTMLElement>('#flyby-camera-state')!.textContent = state.phase === 'briefing' ? '● READY' : state.phase === 'complete' ? '● HOME SAFE' : '● LIVE';
      content.querySelector<HTMLElement>('#flyby-launch')!.hidden = state.phase !== 'briefing';
      content.querySelector<HTMLElement>('#flyby-plan')!.hidden = state.phase !== 'briefing';
      content.querySelector<HTMLElement>('#flyby-flight')!.hidden = !['launching', 'cruise', 'returning'].includes(state.phase);
      content.querySelector<HTMLElement>('#flyby-retry')!.hidden = state.phase !== 'crashed';
      content.querySelector<HTMLElement>('#flyby-continue')!.hidden = state.phase !== 'complete';

      const progress = state.phase === 'complete' ? 100 : Math.min(95, state.science.length * 16 + orbitPercent * 0.31 + (state.phase === 'returning' ? 8 : 0));
      content.querySelector<HTMLElement>('#flyby-progress')!.style.width = `${progress}%`;
      content.querySelector<HTMLElement>('[role="progressbar"]')!.setAttribute('aria-valuenow', `${progress}`);
      for (const { science } of scienceActions) {
        const available = !state.science.includes(science) && (
          science === FLYBY_SCIENCE.photos ? distanceToMoon(state) <= 245
            : science === FLYBY_SCIENCE.gravity ? distanceToMoon(state) <= 165
              : science === FLYBY_SCIENCE.sunlight ? state.y >= 150 && distanceToMoon(state) <= 280
                : state.y >= 150
        );
        const button = content.querySelector<HTMLButtonElement>(`button[data-science="${science}"]`);
        if (button) button.disabled = !available || state.battery < powerCosts[science];
        const card = content.querySelector<HTMLElement>(`[data-science-card="${science}"]`);
        card?.classList.toggle('done', state.science.includes(science));
      }

      this.rocketMarker?.setPosition(state.x / FLIGHT_WORLD.width * 1024, (FLIGHT_WORLD.height - state.y) / FLIGHT_WORLD.height * 640);
    };
    this.renderFlight = updateDisplay;

    const controls = panel.querySelectorAll<HTMLButtonElement>('[data-control]');
    controls.forEach((button) => {
      const control = button.dataset.control as keyof FlightControls;
      button.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        this.heldControls[control] = true;
      });
      const release = (): void => { this.heldControls[control] = false; };
      button.addEventListener('pointerup', release);
      button.addEventListener('pointerleave', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('click', () => {
        const pulse = { ...controlsTemplate, [control]: true };
        this.flightState = stepFlyby(this.flightState, pulse, 0.12);
        updateDisplay();
      });
    });

    panel.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest<HTMLButtonElement>('button[data-action]');
      if (!button) return;
      if (button.dataset.action === 'launch') {
        const plan: FlightPlan = {
          fuelLoad: Number(planControls.fuel.value),
          energyStore: Number(planControls.battery.value),
        };
        this.flightState = launchFlyby(configureFlyby(this.flightState, plan));
      }
      else if (button.dataset.action === 'science') this.flightState = collectFlybyScience(this.flightState, button.dataset.science as FlybyScience);
      else if (button.dataset.action === 'retry') this.flightState = restartFlyby();
      else if (button.dataset.action === 'continue' && this.flightState.phase === 'complete') {
        const label = document.getElementById('chapter-label');
        if (label) label.textContent = 'MISSION 02 / Robots go first';
        this.scene.start('robots');
        return;
      }
      updateDisplay();
    });

    const keyboard = this.input.keyboard;
    const keyControls: Record<string, keyof FlightControls> = {
      arrowleft: 'left', a: 'left',
      arrowright: 'right', d: 'right',
      arrowup: 'up', w: 'up',
      arrowdown: 'down', x: 'down',
    };
    const scienceKeys: Record<string, FlybyScience> = {
      p: FLYBY_SCIENCE.photos,
      r: FLYBY_SCIENCE.radiation,
      s: FLYBY_SCIENCE.sunlight,
      g: FLYBY_SCIENCE.gravity,
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.repeat) return;
      const key = event.key.toLowerCase();
      const science = scienceKeys[key];
      if (science && ['launching', 'cruise'].includes(this.flightState.phase)) {
        event.preventDefault();
        this.flightState = collectFlybyScience(this.flightState, science);
        updateDisplay();
        return;
      }
      const control = keyControls[key];
      if (!control) return;
      event.preventDefault();
      this.heldControls[control] = true;
    };
    const onKeyUp = (event: KeyboardEvent): void => {
      const control = keyControls[event.key.toLowerCase()];
      if (control) this.heldControls[control] = false;
    };
    const releaseControls = (): void => { Object.assign(this.heldControls, controlsTemplate); };
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
      this.renderFlight = undefined;
      this.rocketMarker?.destroy();
      this.rocketMarker = undefined;
      this.asteroidMarkers.forEach((marker) => marker.destroy());
      this.asteroidMarkers.splice(0, this.asteroidMarkers.length);
      panel.remove();
    };
    this.events.once('shutdown', cleanup);
    this.events.once('destroy', cleanup);
    updateDisplay();
  }

  update(time: number, delta: number): void {
    if (this.flightState.phase === 'briefing' || this.flightState.phase === 'complete' || this.flightState.phase === 'crashed') return;
    this.flightState = stepFlyby(this.flightState, this.heldControls, delta / 1000);
    if (time - this.lastFlightRender >= 80) {
      this.lastFlightRender = time;
      this.renderFlight?.();
    }
  }
}

function distanceToMoon(state: FlybyState): number {
  return Math.hypot(state.x - FLIGHT_WORLD.moon.x, state.y - FLIGHT_WORLD.moon.y);
}
