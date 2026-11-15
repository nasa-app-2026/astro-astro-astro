import { ChapterScene } from './ChapterScene';
import { chapters } from './catalog';
import {
  CARGO_ASTEROIDS,
  CARGO_WORLD,
  ROVER_PARKING_AREA,
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
  ROVER_PARKING_AREA,
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
  .rover-panel{pointer-events:auto;max-width:1200px;margin:18px auto 58px;padding:22px 26px;border:1px solid #47728a;border-radius:16px;background:linear-gradient(145deg,#102a42f2,#09192bf5);box-shadow:0 18px 50px #0005;color:#edf8ff;font:16px Arial,sans-serif}
  .rover-panel *{box-sizing:border-box}.rover-panel .eyebrow{margin:0;color:#79e6dc;font-size:12px;font-weight:bold;letter-spacing:.18em}
  .rover-panel h2{margin:8px 0 4px;color:#fff;font-size:clamp(24px,4vw,36px)}.rover-panel h3{margin:16px 0 8px;color:#e8f5ff;font-size:16px}
  .rover-panel .intro{margin:8px 0 18px;color:#c3d8e6;line-height:1.55}.rover-panel .mission-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:14px;margin:16px 0}
  .rover-panel .camera,.rover-panel .map,.rover-panel .telemetry,.rover-panel .cargo-view{border:1px solid #31516a;border-radius:12px;background:#071827}
  .rover-panel .view-title{display:flex;justify-content:space-between;padding:10px 12px;color:#8ce9db;font-size:11px;font-weight:bold;letter-spacing:.12em}
  .rover-panel svg{display:block;width:100%;height:auto}.rover-panel .views{display:grid;gap:10px}
  .rover-panel #cargo-flight-view{position:relative;display:block;min-height:0}
  .rover-panel #cargo-flight-view svg{height:100%;min-height:0}
  .rover-panel #cargo-flight-view .view-title{position:absolute;z-index:2;top:6px;right:8px;left:auto;width:max-content;max-width:calc(100% - 16px);background:#071827c9}
  .rover-panel #cargo-flight-view .telemetry{position:absolute;z-index:2;right:8px;bottom:8px;left:8px;grid-template-columns:repeat(6,minmax(0,1fr));gap:3px;padding:3px;background:#071827cf;pointer-events:none}
  .rover-panel #cargo-flight-view .stat{min-width:0;padding:2px 3px}
  .rover-panel #cargo-flight-view .stat span{font-size:7px;white-space:nowrap}
  .rover-panel #cargo-flight-view .stat strong{margin-top:1px;font-size:9px;white-space:nowrap}
  .rover-panel #rover-surface-view{position:relative;display:block;min-height:0}
  .rover-panel #rover-surface-view .camera{position:relative;display:block;width:100%;height:100%;min-width:0;min-height:0}
  .rover-panel #rover-surface-view .view-title{position:absolute;z-index:2;top:6px;left:8px;width:max-content;max-width:calc(100% - 16px);background:#071827c9}
  .rover-panel #rover-surface-view .camera svg{height:100%;min-height:0}
  .rover-panel #rover-surface-view .telemetry{position:absolute;z-index:2;right:8px;bottom:8px;left:8px;grid-template-columns:repeat(6,minmax(0,1fr));gap:3px;padding:3px;background:#071827cf;pointer-events:none}
  .rover-panel #rover-surface-view .stat{min-width:0;padding:2px 3px}
  .rover-panel #rover-surface-view .stat span{font-size:7px;white-space:nowrap}
  .rover-panel #rover-surface-view .stat strong{margin-top:1px;font-size:9px;white-space:nowrap}
  .rover-panel .rover-driving-active{position:relative;grid-template-rows:minmax(0,1fr) auto}
  .rover-panel .rover-driving-active>.eyebrow,
  .rover-panel .rover-driving-active>h2,
  .rover-panel .rover-driving-active>.intro,
  .rover-panel .rover-driving-active>.message{display:none}
  .rover-panel .rover-driving-active #rover-jobs{position:absolute;z-index:3;top:34px;right:8px;width:min(48%,420px);margin:0}
  .rover-panel .rover-driving-active #rover-jobs .progress{height:4px;margin:3px 0}
  .rover-panel .rover-driving-active #rover-jobs .jobs{grid-template-columns:repeat(2,minmax(0,1fr));gap:3px;margin:3px 0}
  .rover-panel .rover-driving-active #rover-jobs .job{min-height:0;padding:4px;font-size:9px;background:#102940e8}
  .rover-panel #rover-surface-view[data-site="sunnyRidge"] #sunny-ridge-terrain{opacity:1}
  .rover-panel #rover-surface-view[data-site="sunnyRidge"] #sunny-ridge-light{opacity:.42}
  .rover-panel #rover-surface-view[data-site="shadowedCrater"] #shadow-crater-terrain{opacity:1}
  .rover-panel #rover-surface-view[data-site="shadowedCrater"] #shadow-crater-light{opacity:.8}
  .rover-panel #sunny-ridge-terrain,.rover-panel #shadow-crater-terrain,
  .rover-panel #sunny-ridge-light,.rover-panel #shadow-crater-light{transition:opacity .35s ease}
  .rover-panel .cargo-flight-active>.eyebrow,
  .rover-panel .cargo-flight-active>h2,
  .rover-panel .cargo-flight-active>.intro,
  .rover-panel .cargo-flight-active>.message{display:none}
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
      <h2>Drive the rover on the Moon</h2>
      <p class="intro">Choose a landing target and guide the cargo rocket to the Moon. After a soft landing, take control of the rover on the lunar surface. Steer around rocks, map the terrain, take pictures, and search the crater soil for water ice.</p>
      <div class="cargo-view" id="cargo-flight-view" aria-label="Live cargo rocket flight camera" hidden>
        <div class="view-title"><span>LIVE CARGO ROCKET FLIGHT · EARTH IS LARGER THAN THE MOON</span><span id="cargo-camera-state">● READY</span></div>
        <svg id="cargo-flight-camera" viewBox="0 0 1000 420" role="img" aria-label="Live view of the cargo rocket traveling from Earth to the Moon">
          <defs><radialGradient id="cargo-space"><stop stop-color="#173b56"/><stop offset="1" stop-color="#06121f"/></radialGradient></defs>
          <rect width="1000" height="600" fill="url(#cargo-space)"/>
          <g id="cargo-starfield" fill="#e1f4ff" opacity=".8">
            <circle cx="42" cy="52" r="1.5"/><circle cx="170" cy="210" r="2"/><circle cx="300" cy="90" r="2"/><circle cx="470" cy="500" r="2"/><circle cx="590" cy="100" r="2"/><circle cx="930" cy="120" r="2"/><circle cx="925" cy="500" r="2"/>
            <circle cx="245" cy="264" r="1.2"/><circle cx="382" cy="177" r="1.3"/><circle cx="523" cy="340" r="1.6"/><circle cx="675" cy="225" r="1.1"/><circle cx="750" cy="68" r="1.5"/><circle cx="854" cy="289" r="1.2"/>
            <circle cx="85" cy="416" r="1.4"/><circle cx="210" cy="535" r="1.2"/><circle cx="355" cy="440" r="1.6"/><circle cx="640" cy="540" r="1.3"/><circle cx="812" cy="450" r="1.5"/>
            <path d="M120 275v8m-4-4h8M700 350v7m-3.5-3.5h7M880 220v8m-4-4h8" stroke="#e1f4ff" stroke-width="1" opacity=".7"/>
          </g>
          <path d="M164 121Q455 205 770 310" fill="none" stroke="#9cbdd0" stroke-width="1" stroke-dasharray="3 9" opacity=".28"/>
          <polyline id="cargo-flight-path" points="" fill="none" stroke="#77e6d7" stroke-width="3" stroke-dasharray="8 7" opacity=".8"/>
          <g id="cargo-earth"><circle r="64" fill="#24689e" stroke="#8bd4f5" stroke-width="4"/><path d="M-46-17Q-28-58-5-42L13-30 3-13-15-17-25 3-46 5ZM4-7 24-27 49-16 42 5 27 9 22 32 7 47-3 25-18 12-13-3Z" fill="#73b98a"/><path d="M-55-29Q-22-66 23-53M-52 30Q-18 57 31 48" fill="none" stroke="#d4f4ff" stroke-width="4" opacity=".8"/></g>
          <g id="cargo-moon"><circle r="22" fill="#a9bac9" stroke="#e1e9ee" stroke-width="2"/><circle cx="-7" cy="-5" r="5" fill="#75899a"/><circle cx="9" cy="8" r="6" fill="#7e92a2"/></g>
          <g id="cargo-site" fill="none" stroke="#ffcf71" stroke-width="3"><circle r="14"/><path d="M-24 0H24M0-24V24"/></g>
          <g id="cargo-asteroids"></g>
          <g id="cargo-ship">
            <path id="cargo-engine-flame" d="M-5 10 0 24 5 10Z" fill="#ff9a49" stroke="#ffe59a" stroke-width="1" visibility="hidden"/>
            <path d="M0-18 7-7 12 13 0 7-12 13-7-7Z" fill="#d9e8ef" stroke="#fff4d5" stroke-width="2"/>
            <path d="M-7 8 0 1 7 8M-4-7H4M-5 13 0 5 5 13" fill="none" stroke="#587589" stroke-width="2"/>
            <path d="M-11 0-17 7  -10 8M11 0 17 7 10 8" fill="#91a9b5" stroke="#fff4d5" stroke-width="1.2"/>
            <circle cy="-9" r="4" fill="#52d9f2" stroke="#c5ffff" stroke-width="1"/><circle cx="-5" cy="1" r="2" fill="#ff8fc7"/><circle cx="5" cy="1" r="2" fill="#ff8fc7"/><circle cy="6" r="2" fill="#ff8fc7"/>
          </g>
          <text x="100" y="145" fill="#dcefff" font-size="16" text-anchor="middle">EARTH · LAUNCH BASE</text>
          <text x="790" y="292" fill="#dcefff" font-size="16" text-anchor="middle">MOON</text>
          <text id="cargo-coordinate" x="18" y="35" fill="#9efaf0" font-size="14"></text>
        </svg>
        <div class="telemetry">
          <div class="stat"><span>Rocket flight state</span><strong id="cargo-phase">Transfer</strong></div>
          <div class="stat"><span>Propellant</span><strong id="cargo-fuel">100%</strong></div>
          <div class="stat"><span>Earth signal</span><strong id="cargo-signal">100%</strong></div>
          <div class="stat"><span>Position</span><strong id="cargo-position">100, 139</strong></div>
          <div class="stat"><span>Speed</span><strong id="cargo-speed">0.0 m/s</strong></div>
          <div class="stat"><span>Selected landing site</span><strong id="cargo-target">Not selected</strong></div>
        </div>
      </div>
      <div class="mission-grid" id="rover-surface-view" hidden>
        <div class="camera" aria-label="Overhead live view of the Moon and rover">
          <div class="view-title"><span>MOON FROM ABOVE · ROVER POSITION &amp; PATH</span><span id="rover-camera-state">● STANDBY</span></div>
          <svg id="rover-map-camera" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Top-down view of the Moon with the rover driving across its surface">
            <defs>
              <radialGradient id="moon-disc" cx=".35" cy=".28" r=".85"><stop stop-color="#d8d1c3"/><stop offset=".65" stop-color="#a49e91"/><stop offset="1" stop-color="#555762"/></radialGradient>
              <radialGradient id="moon-crater"><stop stop-color="#272b34"/><stop offset=".55" stop-color="#56545a"/><stop offset=".8" stop-color="#b5ac9f"/><stop offset="1" stop-color="#7b7772"/></radialGradient>
              <linearGradient id="sunlit-regolith" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f0dfbd"/><stop offset=".58" stop-color="#c5b99f"/><stop offset="1" stop-color="#938a7b"/></linearGradient>
              <radialGradient id="shadow-regolith"><stop stop-color="#171b27"/><stop offset=".55" stop-color="#343542"/><stop offset=".85" stop-color="#55535a"/><stop offset="1" stop-color="#999083"/></radialGradient>
              <clipPath id="moon-disc-clip"><rect width="600" height="340"/></clipPath>
            </defs>
            <rect width="600" height="340" fill="#625d58"/>
            <g clip-path="url(#moon-disc-clip)">
              <rect width="600" height="340" fill="url(#moon-disc)"/>
              <path d="M0 49Q86 2 173 45T345 36T522 31L600 69V0H0Z" fill="#ded6c6" opacity=".25"/>
              <path d="M0 271Q86 218 184 265T377 255T600 266V340H0Z" fill="#59565a" opacity=".35"/>
              <g fill="none" stroke="#e1d8c8" opacity=".23">
                <path d="M0 90Q110 54 218 95T425 81T600 91"/>
                <path d="M0 123Q110 87 218 128T425 114T600 124"/>
                <path d="M0 202Q110 166 218 207T425 193T600 203"/>
                <path d="M0 235Q110 199 218 240T425 226T600 236"/>
              </g>
              <g fill="url(#moon-crater)" stroke="#d2c8b7" stroke-width="2">
                <circle cx="218" cy="120" r="29"/><circle cx="375" cy="119" r="22"/><circle cx="272" cy="226" r="33"/>
                <circle cx="438" cy="229" r="43"/><circle cx="132" cy="211" r="21"/><circle cx="318" cy="75" r="14"/>
                <circle cx="52" cy="157" r="25"/><circle cx="548" cy="116" r="30"/><circle cx="512" cy="302" r="19"/>
                <circle cx="340" cy="303" r="17"/><circle cx="88" cy="68" r="16"/>
              </g>
              <g fill="none" stroke="#ddd3c1" opacity=".48">
                <circle cx="218" cy="120" r="20"/><circle cx="375" cy="119" r="15"/><circle cx="272" cy="226" r="24"/>
                <circle cx="438" cy="229" r="32"/><circle cx="132" cy="211" r="14"/><circle cx="52" cy="157" r="17"/>
                <circle cx="548" cy="116" r="21"/><circle cx="512" cy="302" r="12"/><circle cx="340" cy="303" r="11"/>
              </g>
              <g id="sunny-ridge-terrain" opacity=".78">
                <path d="M151 94Q174 72 196 80Q217 55 241 76Q259 79 276 101L270 121Q235 113 211 126Q180 116 151 124Z" fill="url(#sunlit-regolith)" stroke="#ead9b9" stroke-width="2"/>
                <path d="M158 101Q188 83 211 92T264 99M165 111Q198 97 221 106T265 109M183 82Q210 68 235 84" fill="none" stroke="#fff0ce" stroke-width="2" opacity=".8"/>
                <path d="M164 118Q194 111 221 118M226 88Q246 84 260 94" fill="none" stroke="#8e826f" stroke-width="1" opacity=".6"/>
                <g fill="#8b8172"><ellipse cx="176" cy="103" rx="2.5" ry="1.4"/><ellipse cx="248" cy="113" rx="2" ry="1.2"/><ellipse cx="230" cy="78" rx="1.7" ry="1"/></g>
              </g>
              <g id="shadow-crater-terrain" opacity=".72">
                <path d="M388 203Q405 190 420 196Q442 175 461 193Q486 194 497 219L490 252Q467 273 438 267Q407 270 389 246Z" fill="url(#shadow-regolith)" stroke="#b6ad9e" stroke-width="2"/>
                <ellipse cx="443" cy="228" rx="32" ry="20" fill="#171a24" stroke="#8f887f" stroke-width="4"/>
                <ellipse cx="443" cy="227" rx="21" ry="11" fill="#11151e" stroke="#55545a" stroke-width="2"/>
                <path d="M405 212 420 204 427 211 419 220ZM466 203 479 214 472 222 461 216ZM416 245 428 237 436 244 429 253ZM461 242 474 235 481 244 471 251Z" fill="#77736f" stroke="#c1b6a4" stroke-width="1.5"/>
                <path d="M402 228 414 224M477 229 487 225M433 198 439 190M451 259 456 251" stroke="#dad0bf" stroke-width="1.5" opacity=".7"/>
                <g fill="#4a4850" stroke="#a69c8d" stroke-width="1"><circle cx="394" cy="257" r="3"/><circle cx="484" cy="190" r="2.5"/><circle cx="499" cy="251" r="3.5"/><circle cx="404" cy="184" r="2"/></g>
              </g>
              <ellipse id="sunny-ridge-light" cx="214" cy="94" rx="92" ry="52" fill="#fff1ce" opacity="0"/>
              <ellipse id="shadow-crater-light" cx="443" cy="228" rx="78" ry="60" fill="#0b101d" opacity="0"/>
              <path d="M406 206Q438 185 470 208L479 249Q443 270 407 246Z" fill="#31313b" opacity=".72"/>
              <text x="441" y="234" fill="#fff1d0" font-size="10" text-anchor="middle">ICE CRATER</text>
              <path d="M168 86Q214 63 260 86" fill="none" stroke="#fff0c8" stroke-width="4" opacity=".7"/>
              <text x="214" y="72" fill="#fff1d0" font-size="9" text-anchor="middle">SUNLIT RIDGE</text>
              <g fill="#59544e" opacity=".8"><circle cx="165" cy="169" r="3"/><circle cx="246" cy="178" r="2"/><circle cx="424" cy="159" r="3"/><circle cx="306" cy="266" r="2"/><circle cx="401" cy="89" r="2"/><circle cx="570" cy="189" r="3"/><circle cx="32" cy="298" r="2"/></g>
            </g>
            <g id="rover-parking-pad" aria-label="Rover parking pad beside the lander">
              <ellipse cx="${20 + ROVER_PARKING_AREA.x * 5.6}" cy="${65 + ROVER_PARKING_AREA.y * 2.1}" rx="15" ry="7" fill="#243d3c" stroke="#ffe18b" stroke-width="2" stroke-dasharray="4 2"/>
              <path d="M${20 + ROVER_PARKING_AREA.x * 5.6 - 7} ${65 + ROVER_PARKING_AREA.y * 2.1}h14" stroke="#ffe18b" stroke-width="1.5"/>
              <text id="rover-parking-label" x="${20 + ROVER_PARKING_AREA.x * 5.6}" y="${65 + ROVER_PARKING_AREA.y * 2.1 + 18}" fill="#fff1c1" font-size="8" text-anchor="middle">PARK HERE</text>
            </g>
            <polyline id="rover-path" points="" fill="none" stroke="#38f4d0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
            <g id="rover-lander-marker" transform="translate(64.8 107)">
              <ellipse cy="7" rx="15" ry="5" fill="#282b31" opacity=".45"/>
              <path d="M-9-5 0-10 9-5 8 4-8 4Z" fill="#d2c8b7" stroke="#fff0d3" stroke-width="1.5"/>
              <path d="M-5-4 0-7 5-4 4 1-4 1Z" fill="#d9a74f"/>
              <path d="M-10 3-14 9M10 3 14 9M-14 9H14M-9-6-12-10M9-6 12-10" fill="none" stroke="#ddd3c1" stroke-width="1.5"/>
              <circle cy="-11" r="2" fill="#7cf5ed"/>
            </g>
            <text x="64" y="126" fill="#fff0d3" font-size="7">LANDER</text>
            <g id="rover-map-ship" transform="translate(300 170)" stroke-linejoin="round">
              <g fill="#20282d" stroke="#d8d0c0" stroke-width="1.2">
                <rect x="-18" y="-17" width="6" height="9" rx="3"/><rect x="12" y="-17" width="6" height="9" rx="3"/>
                <rect x="-18" y="-4" width="6" height="9" rx="3"/><rect x="12" y="-4" width="6" height="9" rx="3"/>
                <rect x="-18" y="9" width="6" height="9" rx="3"/><rect x="12" y="9" width="6" height="9" rx="3"/>
              </g>
              <g stroke="#77817e" stroke-width=".8"><path d="M-15-16V-9M-15-3V4M-15 10V17M15-16V-9M15-3V4M15 10V17"/></g>
              <path d="M-12-15-8-19 8-19 12-15 11 12 6 18-6 18-11 12Z" fill="#d7cdb5" stroke="#fff0d3" stroke-width="1.6"/>
              <path d="M-7-13 0-17 7-13 7 2-7 2Z" fill="#287d93" stroke="#a7fff5" stroke-width="1.3"/>
              <path d="M-5-12 0-15 5-12M-5-7 5-7M-5-2 5-2" fill="none" stroke="#d8ffff" stroke-width=".8"/>
              <circle cx="-8" cy="7" r="2" fill="#ffd46a"/><circle cx="8" cy="7" r="2" fill="#ffd46a"/>
              <path d="M0-19V-26" fill="none" stroke="#fff0c8" stroke-width="1.2"/>
              <path d="M0-26Q-5-31 0-34Q5-31 0-26Z" fill="#c8c0b2" stroke="#fff0d3" stroke-width="1"/>
              <circle cx="0" cy="-26" r="1.5" fill="#7cf5ed"/>
              <path d="M-12 4-19 1M12 4 19 1M0 17V23" fill="none" stroke="#d6b77d" stroke-width="1.2"/>
              <path d="M-4 22H4L2 26H-2Z" fill="#b9a98b" stroke="#fff0d3" stroke-width=".8"/>
              <path d="M-6-19 0-23 6-19" fill="none" stroke="#ffcb64" stroke-width="1"/>
              <circle cx="0" cy="-18" r="1.8" fill="#9effff"/>
            </g>
            <text id="rover-camera-coordinate" x="16" y="22" fill="#9efaf0" font-size="12"></text>
            <text id="rover-site-terrain" x="16" y="40" fill="#fff1c1" font-size="9" font-weight="bold"></text>
            <text x="16" y="325" fill="#d8d0c0" font-size="10">OVERHEAD LUNAR SURFACE · DRIVE TO EXPLORE</text>
          </svg>
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
          <div class="job" id="rover-park-job">🅿 Park <span id="rover-park-status">return to pad</span></div>
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
          <p class="key-hint">Drive with ↑/W, reverse with ↓/S, steer with ←/A and →/D. Let go to brake; press P for a picture.</p>
          <div class="controls"><button type="button" data-action="photo">Take picture · camera shutter</button><button type="button" data-action="water">Collect crater soil sample</button></div>
        </div>
        <div class="controls" id="rover-replay" hidden><button type="button" data-action="replay">Replay rover mission</button></div>
      </div>
      <p class="note">This uncrewed rocket carries the rover to the lunar surface. Moon terrain can block radio; the rover's onboard tracker and science tools keep working during a blackout.</p>`;
    panel.append(content);

    const flightAsteroids = content.querySelector<SVGGElement>('#cargo-asteroids')!;
    flightAsteroids.innerHTML = CARGO_ASTEROIDS.map((asteroid) =>
      `<g transform="translate(${asteroid.x} ${asteroid.y}) scale(${(asteroid.radius / 18).toFixed(2)})">
        <ellipse cy="14" rx="19" ry="5" fill="#020914" opacity=".45"/>
        <path d="M-16-5-8-16 4-18 17-8 15 7 6 16-9 13-18 4Z" fill="#827b73" stroke="#d0c6b7" stroke-width="2"/>
        <path d="m-8-12 8-2 5 6-7 4ZM5 4l8-5 2 7-7 7-6-3Z" fill="#a9a092" stroke="#68645f" stroke-width="1.5"/>
        <circle cx="-11" cy="3" r="2" fill="#5b5855"/><circle cx="3" cy="-10" r="2.5" fill="#625e5a"/>
        <path d="M-15 1-7 6M2 14l5-6" fill="none" stroke="#ded5c7" stroke-width="1" opacity=".8"/>
      </g>`,
    ).join('');
    const updateDisplay = (): void => {
      const state = this.roverState;
      const speed = Math.hypot(state.vx, state.vy);
      const flightActive = cargoPhases.includes(state.phase as typeof cargoPhases[number]);
      const roverActive = roverPhases.includes(state.phase as typeof roverPhases[number]);
      const flightView = content.querySelector<HTMLElement>('#cargo-flight-view')!;
      const surfaceView = content.querySelector<HTMLElement>('#rover-surface-view')!;
      flightView.hidden = !flightActive;
      content.classList.toggle('cargo-flight-active', flightActive);
      content.classList.toggle('rover-driving-active', roverActive);
      surfaceView.hidden = !roverActive;
      surfaceView.dataset.site = state.site ?? '';
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
      const engineFlame = content.querySelector<SVGPathElement>('#cargo-engine-flame');
      if (engineFlame) {
        engineFlame.setAttribute('visibility', Object.values(this.cargoControls).some(Boolean) ? 'visible' : 'hidden');
      }

      const cargoEarth = content.querySelector<SVGGElement>('#cargo-earth')!;
      const cargoMoon = content.querySelector<SVGGElement>('#cargo-moon')!;
      const cargoShip = content.querySelector<SVGGElement>('#cargo-ship')!;
      const cargoSite = content.querySelector<SVGGElement>('#cargo-site')!;
      const cargoCamera = content.querySelector<SVGSVGElement>('#cargo-flight-camera')!;
      const cameraBounds = cargoCamera.getBoundingClientRect();
      const cameraHeight = cameraBounds.width > 0
        ? Math.min(CARGO_WORLD.height, Math.max(420, CARGO_WORLD.width * cameraBounds.height / cameraBounds.width))
        : 420;
      const cameraTop = Math.max(0, Math.min(CARGO_WORLD.height - cameraHeight, state.y - cameraHeight / 2));
      cargoCamera.setAttribute('viewBox', `0 ${cameraTop.toFixed(1)} ${CARGO_WORLD.width} ${cameraHeight.toFixed(1)}`);
      cargoEarth.setAttribute('transform', `translate(${CARGO_WORLD.earth.x} ${CARGO_WORLD.earth.y})`);
      cargoMoon.setAttribute('transform', `translate(${CARGO_WORLD.moon.x} ${CARGO_WORLD.moon.y})`);
      const target = state.site ? CARGO_WORLD.sites[state.site] : CARGO_WORLD.moon;
      cargoSite.setAttribute('transform', `translate(${target.x} ${target.y})`);
      cargoSite.setAttribute('visibility', state.site ? 'visible' : 'hidden');
      cargoShip.setAttribute('transform', `translate(${state.x.toFixed(1)} ${state.y.toFixed(1)}) rotate(${(state.heading * 180 / Math.PI + 90).toFixed(1)})`);
      content.querySelector<SVGPolylineElement>('#cargo-flight-path')!.setAttribute('points', state.path.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' '));
      content.querySelector<SVGTextElement>('#cargo-coordinate')!.textContent = `CARGO ROCKET ${state.x.toFixed(0)}, ${state.y.toFixed(0)} · ${state.fuel.toFixed(0)}% PROPELLANT`;
      content.querySelector<HTMLElement>('#cargo-phase')!.textContent = state.phase === 'approach' ? 'Lunar approach' : state.phase === 'crashed' ? 'Flight ended' : 'Transfer';
      content.querySelector<HTMLElement>('#cargo-fuel')!.textContent = `${state.fuel.toFixed(0)}%`;
      content.querySelector<HTMLElement>('#cargo-signal')!.textContent = `${state.signal}%`;
      content.querySelector<HTMLElement>('#cargo-position')!.textContent = `${state.x.toFixed(0)}, ${state.y.toFixed(0)}`;
      content.querySelector<HTMLElement>('#cargo-speed')!.textContent = `${speed.toFixed(1)} m/s`;
      content.querySelector<HTMLElement>('#cargo-target')!.textContent = state.site === ROVER_SITES.sunnyRidge ? 'Sunny ridge' : state.site === ROVER_SITES.shadowedCrater ? 'Shadowed crater' : 'Not selected';

      const mapPoint = (point: { x: number; y: number }): { x: number; y: number } => ({
        x: 20 + point.x * 5.6,
        y: 65 + point.y * 2.1,
      });
      const ship = mapPoint(state);
      const mapCamera = content.querySelector<SVGSVGElement>('#rover-map-camera');
      const siteName = state.site === ROVER_SITES.sunnyRidge ? 'SUNNY RIDGE · SMOOTH, BRIGHT TERRAIN' : 'SHADOWED CRATER · DARK, ROCKY TERRAIN';
      if (mapCamera && state.site) mapCamera.setAttribute('aria-label', `Top-down lunar terrain for the ${state.site === ROVER_SITES.sunnyRidge ? 'sunny ridge' : 'shadowed crater'} landing site`);
      content.querySelector<SVGPolylineElement>('#rover-path')?.setAttribute('points', state.path.map((point) => {
        const mapped = mapPoint(point);
        return `${mapped.x.toFixed(1)},${mapped.y.toFixed(1)}`;
      }).join(' '));
      content.querySelector<SVGGElement>('#rover-map-ship')?.setAttribute('transform', `translate(${ship.x.toFixed(1)} ${ship.y.toFixed(1)}) rotate(${(state.heading * 180 / Math.PI + 90).toFixed(1)}) scale(.85)`);
      const cameraCoordinate = content.querySelector<SVGTextElement>('#rover-camera-coordinate');
      if (cameraCoordinate) cameraCoordinate.textContent = `ROVER ${state.x.toFixed(1)}, ${state.y.toFixed(1)} · ${speed.toFixed(1)} m/s`;
      const terrainLabel = content.querySelector<SVGTextElement>('#rover-site-terrain');
      if (terrainLabel) terrainLabel.textContent = state.site ? siteName : '';
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
      content.querySelector<HTMLElement>('#rover-park-status')!.textContent = state.parked ? 'parked' : 'return to pad';
      content.querySelector<HTMLElement>('#rover-photo-job')!.classList.toggle('done', state.photos.length >= 3);
      content.querySelector<HTMLElement>('#rover-map-job')!.classList.toggle('done', state.mappedTiles.length >= 5);
      content.querySelector<HTMLElement>('#rover-water-job')!.classList.toggle('done', state.waterSampled);
      content.querySelector<HTMLElement>('#rover-park-job')!.classList.toggle('done', state.parked);
      const parkingLabel = content.querySelector<SVGTextElement>('#rover-parking-label');
      if (parkingLabel) parkingLabel.textContent = state.parked ? 'ROVER PARKED' : 'PARK HERE';
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
    if (time - this.lastMissionRender >= 33) {
      this.lastMissionRender = time;
      this.renderMission?.();
    }
  }
}
