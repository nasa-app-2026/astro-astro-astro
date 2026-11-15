import { ChapterScene } from './ChapterScene';
import { chapters } from './catalog';
import {
  applyMachineAction,
  beginMachineOperation,
  CARGO_CAPACITY_TONNES,
  createBuildingState,
  finishMachineOperation,
  getExcavatorBoomAngle,
  moveActiveMachine,
  releaseCraneLoad,
  selectCargoKit,
  scoopOrDumpRegolith,
  type MachineControls,
} from './building/logic';

export class BuildingScene extends ChapterScene {
  private updateMachine?: (deltaSeconds: number) => void;
  private readonly machineControls: Record<keyof MachineControls, boolean> = {
    left: false,
    right: false,
    raise: false,
    lower: false,
  };

  constructor() { super(chapters[3]); }

  update(_time: number, delta: number): void {
    this.updateMachine?.(delta / 1000);
  }

  protected createMission(): void {
    const chapterView = document.getElementById('chapter-view');
    if (!chapterView) throw new Error('Chapter view is required to build the lunar outpost.');
    this.drawEarthBackdrop();

    let state = createBuildingState();
    const panel = document.createElement('section');
    panel.className = 'outpost-panel';
    panel.dataset.missionPanel = 'building';
    panel.setAttribute('aria-label', 'Lunar outpost construction controls');

    const styles = document.createElement('style');
    styles.textContent = `
      .outpost-panel{position:relative;z-index:2;pointer-events:auto;max-width:1040px;margin:18px auto 58px;padding:20px;color:#edf8ff;font:15px Arial,sans-serif;background:linear-gradient(145deg,#102a42f5,#09192bf7);border:1px solid #47728a;border-radius:16px;box-shadow:0 18px 50px #0005}
      .outpost-panel *{box-sizing:border-box}.outpost-panel h2{margin:5px 0;color:#fff;font-size:clamp(23px,4vw,34px)}.outpost-panel p{line-height:1.5}
      .outpost-panel .eyebrow{margin:0;color:#79e6dc;font-size:11px;font-weight:bold;letter-spacing:.16em}.outpost-panel .intro{margin:7px 0 15px;color:#c3d8e6}
      .outpost-panel .site{display:grid;grid-template-columns:1.25fr .75fr;gap:12px}.outpost-panel .landscape,.outpost-panel .dashboard,.outpost-panel .machine{border:1px solid #31516a;border-radius:10px;background:#071827}
      .outpost-panel .landscape svg{display:block;width:100%;height:auto}.outpost-panel .dashboard{display:grid;align-content:start;gap:10px;padding:12px;background:#0d2438}
      .outpost-panel .stat{padding:10px;border:1px solid #31516a;border-radius:8px;background:#15334d}.outpost-panel .stat span{display:block;color:#a8c6d9;font-size:10px;text-transform:uppercase;letter-spacing:.08em}.outpost-panel .stat strong{display:block;margin-top:5px;color:#fff;font-size:20px}
      .outpost-panel .meter{height:8px;margin-top:8px;border-radius:8px;background:#27455b;overflow:hidden}.outpost-panel .meter span{display:block;height:100%;background:#79e6dc;transition:width .2s}
      .outpost-panel .machine-grid,.outpost-panel .manifest-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:12px 0}
      .outpost-panel .machine,.outpost-panel .manifest{padding:11px;text-align:left;color:#eaf7ff}.outpost-panel .machine strong,.outpost-panel .manifest strong{display:block;margin-bottom:5px;color:#fff}
      .outpost-panel .machine span,.outpost-panel .manifest span{display:block;color:#a9c5d5;font-size:12px;line-height:1.4}.outpost-panel button{min-height:48px;border:1px solid #5c9b9d;border-radius:8px;background:#12384b;cursor:pointer}
      .outpost-panel button:hover:not(:disabled){background:#1b5965;border-color:#79e6dc}.outpost-panel button:focus-visible{outline:3px solid #9efaf0;outline-offset:3px}
      .outpost-panel button:disabled{opacity:.5;cursor:default}.outpost-panel .manifest{min-height:86px;background:#15334d}
      .outpost-panel .status{min-height:42px;margin:10px 0;padding:10px 12px;border-left:3px solid #79e6dc;border-radius:5px;background:#102940;color:#e5f4ff}
      .outpost-panel .steps{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0}.outpost-panel .step{padding:6px 9px;border:1px solid #31516a;border-radius:99px;color:#a9c5d5;font-size:11px}.outpost-panel .step.done{border-color:#5faaa3;background:#123d46;color:#d9fff4}
      .outpost-panel .done-part{opacity:1!important;transition:opacity .2s}.outpost-panel .note{margin:10px 0 0;color:#9eb8ca;font-size:11px;line-height:1.5}
      .outpost-panel .replay{display:block;margin:10px auto 0;padding:10px 16px;color:#fff}
      .outpost-panel .machine-target{fill:none;stroke:#e9c46b;stroke-width:2;stroke-dasharray:4 4;opacity:.5}.outpost-panel .machine-target text{fill:#fff0b5;stroke:none;font-size:8px;letter-spacing:.08em}
      .outpost-panel .machine-target.active{stroke:#79e6dc;opacity:1;filter:drop-shadow(0 0 5px #79e6dc)}
      .outpost-panel .operator{margin:12px 0;padding:12px;border:1px solid #47728a;border-radius:10px;background:#0d2438}
      .outpost-panel .operator h4{margin:0 0 6px;color:#9efaf0}.outpost-panel .operator p{margin:5px 0 10px;color:#c3d8e6;font-size:13px}
      .outpost-panel .controls{display:grid;grid-template-columns:repeat(3,minmax(78px,120px));justify-content:center;gap:7px;margin:10px 0}
      .outpost-panel .controls button{min-height:44px;padding:8px;color:#fff;font-weight:bold;touch-action:none;user-select:none}
      .outpost-panel .controls [data-control="raise"]{grid-column:2}.outpost-panel .controls [data-control="left"]{grid-column:1;grid-row:2}.outpost-panel .controls [data-control="lower"]{grid-column:2;grid-row:2}.outpost-panel .controls [data-control="right"]{grid-column:3;grid-row:2}
      .outpost-panel .operator-actions{display:flex;justify-content:center;flex-wrap:wrap;gap:8px}.outpost-panel .operator-actions button{padding:10px 15px;color:#fff;font-weight:bold}
      .outpost-panel #printer-head{transform-box:fill-box;transform-origin:center top}.outpost-panel #printer-head.printing{animation:printer-pass .6s ease-in-out 2}
      .outpost-panel #excavator-boom,.outpost-panel #crane-part{transition:transform .06s linear}
      .outpost-panel #crane-part.moving .crane-wheel{transform-box:fill-box;transform-origin:center;animation:wheel-roll .35s linear infinite}
      .outpost-panel #excavator-part.moving .track-pattern{animation:track-roll .35s linear infinite}
      @keyframes printer-pass{0%{transform:translateX(-22px)}50%{transform:translateX(20px)}100%{transform:translateX(-22px)}}
      @keyframes wheel-roll{to{transform:rotate(360deg)}}@keyframes track-roll{to{stroke-dashoffset:-10}}
      .outpost-panel [hidden]{display:none!important}
      @media(max-width:700px){.outpost-panel{margin:12px 12px 55px;padding:15px}.outpost-panel .site{grid-template-columns:1fr}.outpost-panel .machine-grid,.outpost-panel .manifest-grid{grid-template-columns:1fr}}
    `;

    panel.innerHTML = `
      <p class="eyebrow">MISSION 04 · ROBOTIC CONSTRUCTION SITE</p>
      <h2>Build a home on the Moon</h2>
      <p class="intro">Pick the cargo your lander can carry, then put the machines to work. Build a habitat, power it, dig lunar soil and print a storm shelter.</p>
      <div class="site">
        <div class="landscape">
          <svg viewBox="0 0 700 230" role="img" aria-label="Outpost construction site with a crane, excavator, habitat, solar mast and storm shelter">
            <defs>
              <linearGradient id="build-sky" x2="0" y2="1"><stop stop-color="#081827"/><stop offset="1" stop-color="#263b4a"/></linearGradient>
              <linearGradient id="lunar-ground" x2="0" y2="1"><stop stop-color="#81888b"/><stop offset="1" stop-color="#454d54"/></linearGradient>
              <linearGradient id="machine-yellow" x2="0" y2="1"><stop stop-color="#ffe18b"/><stop offset=".48" stop-color="#eab64d"/><stop offset="1" stop-color="#a96c23"/></linearGradient>
              <linearGradient id="machine-glass" x2="1" y2="1"><stop stop-color="#9ce7f1"/><stop offset=".55" stop-color="#43768a"/><stop offset="1" stop-color="#203b50"/></linearGradient>
              <linearGradient id="habitat-shell" x2="0" y2="1"><stop stop-color="#f2f1e8"/><stop offset=".45" stop-color="#b9c9cd"/><stop offset="1" stop-color="#6e858f"/></linearGradient>
              <linearGradient id="regolith-shield" x2="0" y2="1"><stop stop-color="#baa77f"/><stop offset="1" stop-color="#655c4d"/></linearGradient>
              <pattern id="panel-cells" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#17648d"/><path d="M0 0h8M0 0v8" stroke="#78c9e6" stroke-width=".7"/></pattern>
              <filter id="machine-shadow" x="-.3" y="-.3" width="1.6" height="1.8"><feGaussianBlur stdDeviation="3"/></filter>
            </defs>
            <rect width="700" height="230" rx="10" fill="url(#build-sky)"/>
            <g fill="#e1f4ff" opacity=".8"><circle cx="44" cy="27" r="2"/><circle cx="122" cy="63" r="1.5"/><circle cx="284" cy="29" r="2"/><circle cx="520" cy="53" r="1.5"/><circle cx="656" cy="25" r="2"/></g>
            <g id="earth-background" aria-label="Earth above the lunar outpost">
              <circle cx="600" cy="76" r="25" fill="#2876ae" stroke="#b4e3fa" stroke-width="1.5"/>
              <path d="M581 67l5-8 7-2 4 5 7 1 4 7-4 4-5-2-2 7-6 3-3-7-7-2zM603 83l5-4 8 2 4 6-5 5-7-2z" fill="#76b879"/>
              <path d="M579 65q12-9 25-4m-21 26q14 8 29 1" fill="none" stroke="#e7f4fb" stroke-width="2" opacity=".65"/>
            </g>
            <path d="M0 164Q90 150 170 166T350 161T520 168T700 158V230H0Z" fill="url(#lunar-ground)"/>
            <path d="M0 177Q90 166 180 179T360 175T540 181T700 171" fill="none" stroke="#c7cbca" stroke-width="2" opacity=".55"/>
            <g fill="#343d43" opacity=".55"><ellipse cx="70" cy="187" rx="33" ry="3"/><ellipse cx="417" cy="187" rx="42" ry="3"/><ellipse cx="625" cy="184" rx="35" ry="3"/></g>
            <g fill="#a2a3a0" stroke="#555d62" stroke-width="1"><path d="M21 164l8-12 8 5 5 11z"/><path d="M474 165l11-15 9 8 7 11z"/><path d="M676 161l7-10 9 5 4 9z"/></g>
            <g id="solar-target" class="machine-target"><circle cx="132" cy="158" r="20"/><path d="M122 158h20M132 148v20"/><text x="132" y="195" text-anchor="middle">MAST PAD</text></g>
            <g id="habitat-target" class="machine-target"><circle cx="230" cy="158" r="25"/><path d="M218 158h24M230 146v24"/><text x="230" y="202" text-anchor="middle">HABITAT PAD</text></g>
            <g id="hopper-target" class="machine-target"><ellipse cx="280" cy="169" rx="18" ry="9"/><text x="280" y="198" text-anchor="middle">SOIL HOPPER</text></g>
            <g id="soil-target" class="machine-target"><ellipse cx="390" cy="169" rx="23" ry="10"/><path d="M378 168l8-10 8 10 8-7 9 9"/><text x="390" y="198" text-anchor="middle">DIG SITE</text></g>
            <g id="solar-part" opacity=".2">
              <ellipse cx="132" cy="165" rx="25" ry="5" fill="#252e33" stroke="#c2c7c8" stroke-width="2"/>
              <path d="M132 163V82M115 96h34M132 83l-12-11m12 11 13-13" fill="none" stroke="#d9e3e5" stroke-width="3"/>
              <path id="solar-array-left" d="M99 62l28 3v26l-28-3z" fill="url(#panel-cells)" stroke="#bcecf7" stroke-width="2"/>
              <path id="solar-array-right" d="M138 65l28-3v26l-28 3z" fill="url(#panel-cells)" stroke="#bcecf7" stroke-width="2"/>
              <circle cx="132" cy="82" r="5" fill="#f2cd72" stroke="#fff0bc" stroke-width="2"/>
              <path d="M132 108v49M121 165l11-8 11 8" fill="none" stroke="#aebbc1" stroke-width="2"/>
              <path d="M101 57l27 3M139 60l27-3" stroke="#fff" stroke-width="1" opacity=".7"/>
            </g>
            <g id="habitat-part" opacity=".2">
              <ellipse cx="228" cy="169" rx="54" ry="5" fill="#252e33" opacity=".6" filter="url(#machine-shadow)"/>
              <path d="M188 147l-5 18h10l10-17m42 0 9 17h9l-3-19" fill="none" stroke="#aebbc1" stroke-width="3"/>
              <path id="habitat-module" d="M177 119q0-15 17-15h67q17 0 17 15v27q0 11-16 11h-68q-17 0-17-12z" fill="url(#habitat-shell)" stroke="#eef5f3" stroke-width="2"/>
              <ellipse cx="181" cy="132" rx="7" ry="19" fill="#8299a1" stroke="#dce7e8" stroke-width="2"/>
              <path d="M190 106v48m9-49v50m49-49v49" stroke="#82959c" stroke-width="2" opacity=".75"/>
              <path d="M188 118q39-8 77 0v9q-38-8-77 0z" fill="#e4e6dc" opacity=".65"/>
              <g fill="#243f52" stroke="#9fe8f3" stroke-width="2"><circle cx="207" cy="133" r="7"/><circle cx="229" cy="133" r="7"/></g>
              <g fill="#79d6e8"><circle cx="207" cy="133" r="3"/><circle cx="229" cy="133" r="3"/></g>
              <path d="M252 121h12q9 0 9 9v20h-21z" fill="#78909a" stroke="#edf4f2" stroke-width="2"/>
              <rect id="habitat-airlock" x="257" y="132" width="13" height="18" rx="3" fill="#314b59" stroke="#cde3e7" stroke-width="2"/>
              <circle cx="263.5" cy="140" r="3" fill="#76d3e2"/>
              <path d="M222 104v-8h14v8m-7-8v-6m-5 0h10" fill="none" stroke="#e4ebeb" stroke-width="2"/>
              <path d="M186 159h9m58 0h11" stroke="#d6e1e2" stroke-width="3"/>
              <text x="226" y="151" text-anchor="middle" fill="#304d5b" font-size="5" font-weight="bold">HAB-01</text>
            </g>
            <g id="shelter-part" opacity=".2">
              <ellipse cx="334" cy="169" rx="51" ry="5" fill="#292e30" opacity=".6" filter="url(#machine-shadow)"/>
              <path id="shelter-berm" d="M282 166q12-43 52-47 38 1 54 47-19 8-53 8-36 0-53-8z" fill="url(#regolith-shield)" stroke="#d6c49c" stroke-width="2"/>
              <path d="M294 161q11-31 40-35 27 1 41 35" fill="none" stroke="#e0d0a8" stroke-width="3" stroke-dasharray="3 3" opacity=".8"/>
              <path d="M305 166q7-33 29-34t29 34z" fill="url(#habitat-shell)" stroke="#eef4ea" stroke-width="2"/>
              <rect x="327" y="146" width="15" height="20" rx="4" fill="#334b57" stroke="#dce7e3" stroke-width="2"/>
              <circle cx="334.5" cy="153" r="3" fill="#86d8e2"/>
              <path d="M310 148l5 4m34-4-5 4M306 158l6 2m44-2-6 2" stroke="#f2dfb6" stroke-width="2"/>
              <path d="M323 138v-5h22v5" fill="none" stroke="#f5dfac" stroke-width="2"/>
            </g>
            <g id="excavator-part" transform="translate(414 136)">
              <ellipse cx="-4" cy="30" rx="44" ry="5" fill="#252e33" opacity=".55" filter="url(#machine-shadow)"/>
              <g id="excavator-tracks">
                <rect x="-42" y="16" width="78" height="16" rx="8" fill="#20292d" stroke="#aeb8b7" stroke-width="2"/>
                <path class="track-pattern" d="M-36 17h66q7 0 7 7t-7 7h-66q-7 0-7-7t7-7z" fill="none" stroke="#626e70" stroke-width="2" stroke-dasharray="3 2"/>
                <g fill="#758286" stroke="#d4dbd9" stroke-width="1.5"><circle cx="-29" cy="24" r="5"/><circle cx="-12" cy="24" r="5"/><circle cx="5" cy="24" r="5"/><circle cx="23" cy="24" r="5"/></g>
                <g fill="#303c40"><circle cx="-29" cy="24" r="2"/><circle cx="-12" cy="24" r="2"/><circle cx="5" cy="24" r="2"/><circle cx="23" cy="24" r="2"/></g>
              </g>
              <path d="M-29 15v-7q0-6 8-8h43q10 0 14 9l2 7z" fill="url(#machine-yellow)" stroke="#ffe49a" stroke-width="2"/>
              <path d="M-28 5h14v10h-17v-6z" fill="#b8792b" stroke="#f6ce70" stroke-width="1.5"/>
              <g id="excavator-cab">
                <path d="M-16 8V-14q0-7 7-9h16q8 2 9 9V8z" fill="url(#machine-yellow)" stroke="#ffdf83" stroke-width="2"/>
                <path d="M-10-15q0-4 5-5h10q5 1 6 6v12H-10z" fill="url(#machine-glass)" stroke="#d5f5f4" stroke-width="1.5"/>
                <path d="M1-19v17M-12 1h24" stroke="#f6d57b" stroke-width="2"/>
                <path d="M-16-23h25" stroke="#ffe7a0" stroke-width="3"/>
                <circle cx="10" cy="-3" r="1.5" fill="#ecf8f6"/>
              </g>
              <path d="M-4 3l7-9 12 3" fill="none" stroke="#727f80" stroke-width="5"/>
              <path d="M-5 4l9-10" stroke="#dce4df" stroke-width="2"/>
              <g id="excavator-boom" transform="rotate(-35 -10 8)">
                <path d="M-10 8 2-8l15-18 10 5-10 17L1 14z" fill="url(#machine-yellow)" stroke="#936126" stroke-width="2"/>
                <path d="M-5 4 5-9 18-24" fill="none" stroke="#ffe6a0" stroke-width="2"/>
                <path d="M16-29l30 13 3 8-7 6-29-14z" fill="url(#machine-yellow)" stroke="#936126" stroke-width="2"/>
                <path d="M22-27l21 10" stroke="#ffe6a0" stroke-width="2"/>
                <g id="excavator-hydraulic">
                  <path d="M-5 7 11-13" stroke="#6b4c29" stroke-width="5" stroke-linecap="round"/>
                  <path d="M-5 7 6-7" stroke="#d8dfe0" stroke-width="2" stroke-linecap="round"/>
                  <path d="M7-10l10-14" stroke="#6b4c29" stroke-width="4" stroke-linecap="round"/>
                  <path d="M8-11l7-10" stroke="#d8dfe0" stroke-width="1.5"/>
                </g>
                <g id="excavator-bucket" transform="translate(44 -12)">
                  <path d="M-3-4 16-1 12 13 4 18-1 12z" fill="#8b7554" stroke="#e3c991" stroke-width="2"/>
                  <path d="M4 17l-3 5m8-5-1 6m6-10 2 5" stroke="#d8d8cb" stroke-width="1.5"/>
                  <g id="bucket-load" visibility="hidden"><path d="M1 2h12l-4 9H4z" fill="#a88c68"/></g>
                </g>
                <circle cx="-10" cy="8" r="5" fill="#414b4a" stroke="#ffe49a" stroke-width="2"/>
                <circle cx="17" cy="-26" r="4" fill="#414b4a" stroke="#ffe49a" stroke-width="2"/>
              </g>
              <path d="M-31 10h8m-5-13h6m-8 5h6" stroke="#fff0b5" stroke-width="1"/>
              <text x="-3" y="45" text-anchor="middle" fill="#dcecf4" font-size="8" letter-spacing=".08em">EXCAVATOR</text>
            </g>
            <g id="printer-part" transform="translate(365 153)">
              <ellipse cx="0" cy="12" rx="37" ry="4" fill="#27353b" opacity=".55"/>
              <path d="M-29 10V-34h58V10M-35-34h70" fill="none" stroke="#5d8292" stroke-width="5"/>
              <path d="M-24-31v39m48-39V8" stroke="#c5dbe1" stroke-width="2"/>
              <path d="M-20-27H20M-20-23H20" stroke="#7ea2ae" stroke-width="1"/>
              <path d="M-21-19h42" stroke="#d8e6e8" stroke-width="3"/>
              <g id="printer-head"><rect x="-7" y="-24" width="14" height="14" rx="2" fill="#d5e0e5" stroke="#fff" stroke-width="1"/><path d="M-4-10H4L0-3z" fill="#eab95a"/><path d="M0-24v-6" stroke="#f2d07c" stroke-width="2"/></g>
              <path d="M-27 10H27" stroke="#d5e0e5" stroke-width="4"/>
              <path d="M-18 8v-5M-9 8V0M0 8V-7M9 8V0M18 8v-5" stroke="#dfbd79" stroke-width="2"/>
              <path id="printer-feed-hopper" d="M-39-5h10v12h-10z" fill="#705b41" stroke="#d8bc82" stroke-width="2"/>
              <path d="M-37-4l6 8m-8-4 5 7" stroke="#c6a871" stroke-width="1"/>
              <path d="M-29 0h8" stroke="#d8bc82" stroke-width="2" stroke-dasharray="2 2"/>
              <text x="0" y="31" text-anchor="middle" fill="#dcecf4" font-size="8" letter-spacing=".08em">REGOLITH PRINTER</text>
            </g>
            <g id="crane-part" transform="translate(443 130)">
              <ellipse cx="-5" cy="30" rx="49" ry="5" fill="#252e33" opacity=".6" filter="url(#machine-shadow)"/>
              <g id="crane-outriggers" stroke="#c4ccca" stroke-width="3">
                <path d="M-29 10l-14 10m45-10 15 10" fill="none"/>
                <path d="M-46 19h8m54 0h8" stroke="#f1ca68" stroke-width="4"/>
              </g>
              <path d="M-43 12h82l-5 10h-72z" fill="#303a3e" stroke="#b9c3c4" stroke-width="2"/>
              <path d="M-38 15h68" stroke="#778286" stroke-width="2"/>
              <g fill="#20292d" stroke="#aab4b5" stroke-width="2">
                <circle class="crane-wheel" cx="-33" cy="25" r="7"/><circle class="crane-wheel" cx="-14" cy="25" r="7"/>
                <circle class="crane-wheel" cx="12" cy="25" r="7"/><circle class="crane-wheel" cx="32" cy="25" r="7"/>
              </g>
              <g fill="#89979a" stroke="#d9e0df" stroke-width="1"><circle cx="-33" cy="25" r="3"/><circle cx="-14" cy="25" r="3"/><circle cx="12" cy="25" r="3"/><circle cx="32" cy="25" r="3"/></g>
              <path id="crane-operator-cab" d="M-20 11v-13q0-7 8-9h18q9 2 10 9v13z" fill="url(#machine-yellow)" stroke="#ffdf83" stroke-width="2"/>
              <path d="M-15-4v-9q0-5 6-6h8v15z" fill="url(#machine-glass)" stroke="#d9f3f1" stroke-width="1.5"/>
              <path d="M2-18v15m-18 3h29" stroke="#f6d57b" stroke-width="2"/>
              <path d="M-18 9h31v4h-31z" fill="#d89c38" stroke="#ffe59b" stroke-width="1.5"/>
              <path id="crane-boom" d="M-2-2 7-37 41-59l8 3-3 7L13-32 5 0z" fill="url(#machine-yellow)" stroke="#9d6a25" stroke-width="2" stroke-linejoin="round"/>
              <path d="M9-37 42-56" stroke="#fff0ba" stroke-width="2"/>
              <path d="M19-43l5 8m5-14 5 8" stroke="#b77c28" stroke-width="2"/>
              <g id="crane-hydraulic">
                <path d="M-4 8 6-25" stroke="#714b22" stroke-width="6" stroke-linecap="round"/>
                <path d="M-4 8 3-15" stroke="#d8e1e1" stroke-width="2.5" stroke-linecap="round"/>
              </g>
              <circle cx="46" cy="-56" r="7" fill="#303a3e" stroke="#f5d274" stroke-width="3"/>
              <circle cx="46" cy="-56" r="2" fill="#dce7e7"/>
              <line id="crane-cable" x1="46" y1="-56" x2="46" y2="-43" stroke="#e5eded" stroke-width="2"/>
              <g id="crane-hook-block" transform="translate(46 -43)">
                <rect x="-5" y="-3" width="10" height="11" rx="2" fill="#293a43" stroke="#dce6e6" stroke-width="1.5"/>
                <circle cx="0" cy="0" r="2" fill="#e6c46f"/>
                <path id="crane-hook" d="M0 8v5q3 6 7 0" fill="none" stroke="#dfe8eb" stroke-width="3"/>
              </g>
              <g id="crane-cargo" transform="translate(46 -25)" visibility="hidden">
                <g id="habitat-load">
                  <path d="M-25-10h48q6 0 6 6v11q0 4-6 4h-48q-4 0-4-4V-5q0-5 4-5z" fill="url(#habitat-shell)" stroke="#fff" stroke-width="2"/>
                  <path d="M-16-9v18m10-18V9M8-9V9" stroke="#6e8289" stroke-width="2"/>
                  <circle cx="-12" cy="0" r="3" fill="#438ca0"/><circle cx="0" cy="0" r="3" fill="#438ca0"/>
                </g>
                <g id="solar-load" visibility="hidden">
                  <rect x="-16" y="-9" width="32" height="18" rx="2" fill="#718491" stroke="#fff" stroke-width="2"/>
                  <path d="M-12-6h24v12h-24z" fill="url(#panel-cells)" stroke="#9de8f5" stroke-width="1"/>
                  <path d="M0-6V6M-12 0h24" stroke="#c1eef6" stroke-width="1"/>
                </g>
              </g>
              <text x="-4" y="43" text-anchor="middle" fill="#dcecf4" font-size="8" letter-spacing=".08em">MOBILE CRANE</text>
            </g>
          </svg>
        </div>
        <aside class="dashboard" aria-label="Construction resources">
          <div class="stat"><span>Construction power · game units</span><strong id="building-power">45</strong><div class="meter" role="meter" aria-label="Construction power" aria-valuemin="0" aria-valuemax="60" aria-valuenow="45"><span id="building-power-fill" style="width:75%"></span></div></div>
          <div class="stat"><span>Cargo manifest · tonnes</span><strong id="building-cargo">Choose a kit</strong><div class="meter" role="meter" aria-label="Cargo payload" aria-valuemin="0" aria-valuemax="${CARGO_CAPACITY_TONNES}" aria-valuenow="0"><span id="building-cargo-fill" style="width:0%"></span></div></div>
          <div class="stat"><span>Regolith · Moon soil scoops</span><strong id="building-regolith">0</strong></div>
        </aside>
      </div>
      <div class="steps" aria-label="Outpost construction checklist">
        <span class="step" id="step-habitat">Habitat</span><span class="step" id="step-solar">Solar mast</span><span class="step" id="step-shelter">Storm shelter</span><span class="step" id="step-lab" hidden>Science bench</span>
      </div>
      <p class="status" id="building-status" role="status" aria-live="polite"></p>
      <div id="building-manifest">
        <h3>Choose one extra cargo kit</h3>
        <p class="intro">The habitat and construction machines use 10 tonnes in this game model. The cargo lander limit is 12 tonnes.</p>
        <div class="manifest-grid">
          <button class="manifest" type="button" data-kit="shield">
            <strong>Storm-shield kit · 1.5 t</strong><span>Less digging: combine shielding supplies with one scoop of lunar soil.</span>
          </button>
          <button class="manifest" type="button" data-kit="science">
            <strong>Science crate · 2 t</strong><span>Carry a lab instead. No shielding bags means the excavator must dig three scoops for a soil berm.</span>
          </button>
        </div>
      </div>
      <div id="building-machines" hidden>
        <h3>Operate the construction machines</h3>
        <div class="machine-grid" id="machine-selectors">
          <button class="machine" type="button" data-operate="crane" id="crane-operate"><strong>🏗️ Operate mobile crane</strong><span>Steer its trolley and lower the hook to set down each load.</span></button>
          <button class="machine" type="button" data-operate="excavator" id="excavator-operate"><strong>🚜 Operate excavator</strong><span>Drive to the soil patch, scoop, then carry soil to the hopper.</span></button>
          <button class="machine" type="button" data-action="shelter" id="printer-button"><strong>🖨️ 3D printer · build storm shelter</strong><span id="shelter-requirement">Use local soil and the selected cargo kit.</span></button>
          <button class="machine" type="button" data-action="lab" id="science-machine" hidden><strong>🔬 Crane · install science bench</strong><span>−5 power · unpack the science crate for the crew.</span></button>
        </div>
        <div class="operator" id="operator-controls" hidden>
          <h4 id="operator-title"></h4>
          <p id="operator-instructions"></p>
          <p id="operator-position"></p>
          <p id="operator-depth"></p>
          <div class="controls" role="group" aria-label="Hold to control the construction machine">
            <button type="button" data-control="raise">▲ Raise</button>
            <button type="button" data-control="left">◀ Left</button>
            <button type="button" data-control="lower">▼ Lower</button>
            <button type="button" data-control="right">Right ▶</button>
          </div>
          <div class="operator-actions">
            <button type="button" id="crane-release" data-action="release">Release hanging load</button>
            <button type="button" id="excavator-action" data-action="scoop">Scoop soil</button>
            <button type="button" id="finish-machine" data-action="finish-machine">Park machine</button>
          </div>
        </div>
      </div>
      <div id="building-complete" hidden>
        <h3>Outpost construction complete!</h3>
        <p>The crew has a powered habitat and a storm shelter. Machines made the lunar soil part of the build.</p>
        <button class="replay" type="button" data-action="replay">Plan another build</button>
      </div>
      <p class="note">Real mission context: NASA has studied large cargo landers carrying about 12–15 tonnes. A storm shelter for four astronauts is estimated at 1.3–1.6 tonnes. Payload and machine power figures above are simplified game values, not equipment specifications.</p>
    `;

    panel.prepend(styles);
    chapterView.append(panel);

    const required = <T extends Element>(selector: string): T => {
      const element = panel.querySelector<T>(selector);
      if (!element) throw new Error(`Missing outpost control: ${selector}`);
      return element;
    };

    const manifest = required<HTMLDivElement>('#building-manifest');
    const machines = required<HTMLDivElement>('#building-machines');
    const complete = required<HTMLDivElement>('#building-complete');
    const status = required<HTMLParagraphElement>('#building-status');
    const operator = required<HTMLDivElement>('#operator-controls');
    const operatorTitle = required<HTMLHeadingElement>('#operator-title');
    const operatorInstructions = required<HTMLParagraphElement>('#operator-instructions');
    const power = required<HTMLElement>('#building-power');
    const powerFill = required<HTMLElement>('#building-power-fill');
    const powerMeter = required<HTMLElement>('[aria-label="Construction power"]');
    const cargo = required<HTMLElement>('#building-cargo');
    const cargoFill = required<HTMLElement>('#building-cargo-fill');
    const cargoMeter = required<HTMLElement>('[aria-label="Cargo payload"]');
    const regolith = required<HTMLElement>('#building-regolith');
    const shelterRequirement = required<HTMLElement>('#shelter-requirement');
    const scienceMachine = required<HTMLButtonElement>('#science-machine');
    const craneOperate = required<HTMLButtonElement>('#crane-operate');
    const excavatorOperate = required<HTMLButtonElement>('#excavator-operate');
    const printerButton = required<HTMLButtonElement>('#printer-button');
    const craneRelease = required<HTMLButtonElement>('#crane-release');
    const excavatorAction = required<HTMLButtonElement>('#excavator-action');
    const finishMachine = required<HTMLButtonElement>('#finish-machine');
    const stepHabitat = required<HTMLElement>('#step-habitat');
    const stepSolar = required<HTMLElement>('#step-solar');
    const stepShelter = required<HTMLElement>('#step-shelter');
    const stepLab = required<HTMLElement>('#step-lab');
    const habitatPart = required<SVGGElement>('#habitat-part');
    const solarPart = required<SVGGElement>('#solar-part');
    const shelterPart = required<SVGGElement>('#shelter-part');
    const cranePart = required<SVGGElement>('#crane-part');
    const craneCable = required<SVGLineElement>('#crane-cable');
    const craneHook = required<SVGGElement>('#crane-hook-block');
    const craneCargo = required<SVGGElement>('#crane-cargo');
    const habitatLoad = required<SVGGElement>('#habitat-load');
    const solarLoad = required<SVGGElement>('#solar-load');
    const habitatTarget = required<SVGGElement>('#habitat-target');
    const solarTarget = required<SVGGElement>('#solar-target');
    const excavatorPart = required<SVGGElement>('#excavator-part');
    const excavatorBoom = required<SVGGElement>('#excavator-boom');
    const bucketLoad = required<SVGGElement>('#bucket-load');
    const hopperTarget = required<SVGGElement>('#hopper-target');
    const soilTarget = required<SVGGElement>('#soil-target');
    const printerHead = required<SVGGElement>('#printer-head');
    const operatorPosition = required<HTMLElement>('#operator-position');
    const operatorDepth = required<HTMLElement>('#operator-depth');

    const render = (): void => {
      manifest.hidden = state.phase !== 'manifest';
      machines.hidden = state.phase === 'manifest' || state.phase === 'complete';
      complete.hidden = state.phase !== 'complete';
      operator.hidden = state.activeMachine === null;
      status.textContent = state.message;
      power.textContent = `${state.power}`;
      powerFill.style.width = `${state.power / 60 * 100}%`;
      powerMeter.setAttribute('aria-valuenow', `${state.power}`);
      cargo.textContent = state.cargoKit ? `${state.cargoMass.toFixed(1)} / ${CARGO_CAPACITY_TONNES} t` : 'Choose a kit';
      cargoFill.style.width = `${state.cargoMass / CARGO_CAPACITY_TONNES * 100}%`;
      cargoMeter.setAttribute('aria-valuenow', `${state.cargoMass}`);
      regolith.textContent = `${state.regolith} / 3`;
      const soilNeeded = state.cargoKit === 'science' ? 3 : 1;
      const shelterPower = state.cargoKit === 'science' ? 20 : 14;
      const machineBusy = state.activeMachine !== null;
      craneOperate.disabled = machineBusy || (state.habitatPlaced && state.solarDeployed);
      excavatorOperate.disabled = machineBusy || !state.habitatPlaced || !state.solarDeployed || state.shelterBuilt || state.regolith >= soilNeeded;
      printerButton.disabled = machineBusy || !state.habitatPlaced || !state.solarDeployed || state.shelterBuilt || state.regolith < soilNeeded || state.power < shelterPower;
      scienceMachine.hidden = state.cargoKit !== 'science';
      scienceMachine.disabled = machineBusy || !state.habitatPlaced || !state.solarDeployed || state.scienceBenchInstalled || state.power < 5;
      shelterRequirement.textContent = state.cargoKit === 'science'
        ? `Needs 3 scoops of soil and 20 power · ${state.regolith} / 3 scoops ready.`
        : `Needs 1 scoop of soil and 14 power · ${state.regolith} / 1 scoop ready.`;
      if (state.activeMachine === 'crane') {
        operatorTitle.textContent = `Mobile crane · ${state.craneLoad === 'habitat' ? 'habitat module' : 'folded solar mast'}`;
        operatorInstructions.textContent = 'Arrow keys / WASD or hold the controls: steer the trolley over the glowing pad, lower the hook, then press Space or Release load.';
        operatorPosition.textContent = `Trolley ${Math.round(state.craneX)}% · target ${state.craneLoad === 'habitat' ? 'habitat' : 'solar mast'}`;
        operatorDepth.textContent = `Hook lowered ${Math.round(state.craneCable)}% · needs ${65}%`;
      } else if (state.activeMachine === 'excavator') {
        operatorTitle.textContent = 'Tracked excavator · dig and haul';
        operatorInstructions.textContent = 'Drive over the soil patch and lower the boom to Scoop. Then carry the loaded bucket to the hopper, raise it and Dump.';
        operatorPosition.textContent = `Tracks ${Math.round(state.excavatorX)}% · ${state.bucketLoaded ? 'loaded bucket' : 'empty bucket'}`;
        operatorDepth.textContent = `Boom lowered ${Math.round(state.bucketDepth)}% · dig at 70%, dump below 25%`;
      }
      craneRelease.hidden = state.activeMachine !== 'crane';
      excavatorAction.hidden = state.activeMachine !== 'excavator';
      excavatorAction.textContent = state.bucketLoaded ? 'Dump soil in hopper' : 'Scoop soil';
      finishMachine.hidden = state.activeMachine === null;
      finishMachine.disabled = state.bucketLoaded;
      stepHabitat.classList.toggle('done', state.habitatPlaced);
      stepSolar.classList.toggle('done', state.solarDeployed);
      stepShelter.classList.toggle('done', state.shelterBuilt);
      stepLab.hidden = state.cargoKit !== 'science';
      stepLab.classList.toggle('done', state.scienceBenchInstalled);
      habitatPart.classList.toggle('done-part', state.habitatPlaced);
      solarPart.classList.toggle('done-part', state.solarDeployed);
      shelterPart.classList.toggle('done-part', state.shelterBuilt);
      printerHead.classList.toggle('printing', state.shelterBuilt);
      cranePart.classList.toggle('moving', state.activeMachine === 'crane' && (this.machineControls.left || this.machineControls.right));
      excavatorPart.classList.toggle('moving', state.activeMachine === 'excavator' && (this.machineControls.left || this.machineControls.right));
      const craneHookX = 80 + state.craneX * 2.4;
      const craneCableEnd = -55 + 15 + state.craneCable * 0.68;
      cranePart.setAttribute('transform', `translate(${craneHookX - 45} 130)`);
      craneCable.setAttribute('y2', `${craneCableEnd}`);
      craneHook.setAttribute('transform', `translate(46 ${craneCableEnd})`);
      craneCargo.setAttribute('transform', `translate(46 ${craneCableEnd + 28})`);
      craneCargo.setAttribute('visibility', state.craneLoad ? 'visible' : 'hidden');
      habitatLoad.setAttribute('visibility', state.craneLoad === 'habitat' ? 'visible' : 'hidden');
      solarLoad.setAttribute('visibility', state.craneLoad === 'solar' ? 'visible' : 'hidden');
      habitatTarget.classList.toggle('active', state.activeMachine === 'crane' && state.craneLoad === 'habitat');
      solarTarget.classList.toggle('active', state.activeMachine === 'crane' && state.craneLoad === 'solar');
      const excavatorX = 180 + state.excavatorX * 2.6;
      const boomAngle = getExcavatorBoomAngle(state.bucketDepth);
      excavatorPart.setAttribute('transform', `translate(${excavatorX} 136)`);
      excavatorBoom.setAttribute('transform', `rotate(${boomAngle} -10 8)`);
      bucketLoad.setAttribute('visibility', state.bucketLoaded ? 'visible' : 'hidden');
      soilTarget.classList.toggle('active', state.activeMachine === 'excavator' && !state.bucketLoaded);
      hopperTarget.classList.toggle('active', state.activeMachine === 'excavator' && state.bucketLoaded);
      const activeMachine = state.activeMachine ?? 'none';
      this.game.canvas.dataset.buildingPhase = state.phase;
      this.game.canvas.dataset.buildingPower = `${state.power}`;
      this.game.canvas.dataset.buildingCargo = `${state.cargoMass}`;
      this.game.canvas.dataset.buildingRegolith = `${state.regolith}`;
      this.game.canvas.dataset.buildingShelter = String(state.shelterBuilt);
      this.game.canvas.dataset.buildingMachine = activeMachine;
      this.game.canvas.dataset.buildingCraneX = `${state.craneX}`;
      this.game.canvas.dataset.buildingCraneCable = `${state.craneCable}`;
      this.game.canvas.dataset.buildingExcavatorX = `${state.excavatorX}`;
      this.game.canvas.dataset.buildingBucketDepth = `${state.bucketDepth}`;
      this.game.canvas.dataset.buildingBucketLoaded = String(state.bucketLoaded);
    };

    const releaseControls = (): void => {
      this.machineControls.left = false;
      this.machineControls.right = false;
      this.machineControls.raise = false;
      this.machineControls.lower = false;
      spacePressed = false;
    };

    const operate = (action: string): void => {
      if (action === 'release') state = releaseCraneLoad(state);
      else if (action === 'scoop') state = scoopOrDumpRegolith(state);
      else if (action === 'finish-machine') state = finishMachineOperation(state);
      else if (action === 'shelter') state = applyMachineAction(state, 'shelter');
      else if (action === 'lab') state = applyMachineAction(state, 'lab');
      else if (action === 'replay') state = createBuildingState();
      render();
    };

    const onClick = (event: Event): void => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest<HTMLButtonElement>('button');
      if (!button || !panel.contains(button)) return;

      const kit = button.dataset.kit;
      const machine = button.dataset.operate;
      if (kit === 'shield' || kit === 'science') {
        state = selectCargoKit(state, kit);
      } else if (machine === 'crane' || machine === 'excavator') {
        state = beginMachineOperation(state, machine);
      } else if (button.dataset.action) {
        operate(button.dataset.action);
        return;
      }
      render();
    };

    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error('Keyboard input is required to operate construction machines.');
    const keyControls: Record<string, keyof MachineControls> = {
      arrowleft: 'left', a: 'left',
      arrowright: 'right', d: 'right',
      arrowup: 'raise', w: 'raise',
      arrowdown: 'lower', s: 'lower',
    };
    let spacePressed = false;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!state.activeMachine) return;
      const key = event.key.toLowerCase();
      const control = keyControls[key];
      if (control) {
        event.preventDefault();
        this.machineControls[control] = true;
      } else if (event.code === 'Space') {
        event.preventDefault();
        if (spacePressed) return;
        spacePressed = true;
        operate(state.activeMachine === 'crane' ? 'release' : 'scoop');
      }
    };
    const onKeyUp = (event: KeyboardEvent): void => {
      if (event.code === 'Space') spacePressed = false;
      const control = keyControls[event.key.toLowerCase()];
      if (control) this.machineControls[control] = false;
    };
    keyboard.on('keydown', onKeyDown);
    keyboard.on('keyup', onKeyUp);
    window.addEventListener('keyup', onKeyUp);

    const controlCleanup: (() => void)[] = [];
    panel.querySelectorAll<HTMLButtonElement>('[data-control]').forEach((button) => {
      const onPointerDown = (event: PointerEvent): void => {
        const control = button.dataset.control;
        if (control !== 'left' && control !== 'right' && control !== 'raise' && control !== 'lower') return;
        event.preventDefault();
        this.machineControls[control] = true;
        button.setPointerCapture(event.pointerId);
      };
      const onPointerRelease = (): void => {
        const control = button.dataset.control;
        if (control === 'left' || control === 'right' || control === 'raise' || control === 'lower') {
          this.machineControls[control] = false;
        }
      };
      button.addEventListener('pointerdown', onPointerDown);
      button.addEventListener('pointerup', onPointerRelease);
      button.addEventListener('pointercancel', onPointerRelease);
      button.addEventListener('lostpointercapture', onPointerRelease);
      controlCleanup.push(() => {
        button.removeEventListener('pointerdown', onPointerDown);
        button.removeEventListener('pointerup', onPointerRelease);
        button.removeEventListener('pointercancel', onPointerRelease);
        button.removeEventListener('lostpointercapture', onPointerRelease);
      });
    });

    panel.addEventListener('click', onClick);
    window.addEventListener('blur', releaseControls);
    this.updateMachine = (deltaSeconds): void => {
      const nextState = moveActiveMachine(state, this.machineControls, deltaSeconds);
      if (nextState === state) return;
      state = nextState;
      render();
    };
    let cleaned = false;
    const cleanup = (): void => {
      if (cleaned) return;
      cleaned = true;
      this.updateMachine = undefined;
      releaseControls();
      controlCleanup.forEach((removeListeners) => removeListeners());
      panel.removeEventListener('click', onClick);
      window.removeEventListener('blur', releaseControls);
      keyboard.off('keydown', onKeyDown);
      keyboard.off('keyup', onKeyUp);
      window.removeEventListener('keyup', onKeyUp);
      panel.remove();
      delete this.game.canvas.dataset.buildingPhase;
      delete this.game.canvas.dataset.buildingPower;
      delete this.game.canvas.dataset.buildingCargo;
      delete this.game.canvas.dataset.buildingRegolith;
      delete this.game.canvas.dataset.buildingShelter;
      delete this.game.canvas.dataset.buildingMachine;
      delete this.game.canvas.dataset.buildingCraneX;
      delete this.game.canvas.dataset.buildingCraneCable;
      delete this.game.canvas.dataset.buildingExcavatorX;
      delete this.game.canvas.dataset.buildingBucketDepth;
      delete this.game.canvas.dataset.buildingBucketLoaded;
      delete this.game.canvas.dataset.buildingBackground;
    };
    this.events.once('shutdown', cleanup, this);
    this.events.once('destroy', cleanup, this);
    render();
  }

  private drawEarthBackdrop(): void {
    const x = 810;
    const y = 190;
    this.add.circle(x, y, 152, 0x081427, 1);
    const earth = this.add.container(x, y);
    earth.add(this.add.circle(0, 0, 112, 0x2876ae, 1).setStrokeStyle(3, 0xb4e3fa, 0.9));
    earth.add(this.add.ellipse(-35, -27, 44, 28, 0x6eaf70, 1).setRotation(-0.35));
    earth.add(this.add.ellipse(31, 8, 52, 31, 0x6eaf70, 1).setRotation(0.45));
    earth.add(this.add.ellipse(-5, 53, 25, 13, 0x6eaf70, 1).setRotation(-0.2));
    earth.add(this.add.ellipse(-8, -62, 62, 8, 0xe7f4fb, 0.65).setRotation(-0.15));
    earth.add(this.add.ellipse(24, 43, 69, 7, 0xe7f4fb, 0.55).setRotation(-0.2));
    this.game.canvas.dataset.buildingBackground = 'earth';
  }
}
