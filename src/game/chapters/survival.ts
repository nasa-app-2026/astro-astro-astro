import { ChapterScene } from './ChapterScene';
import { chapters } from './catalog';
import { newMission, takeDay, type Action } from './survival/game';

export class SurvivalScene extends ChapterScene {
  constructor() { super(chapters[4]); }

  protected createMission(): void {
    let mission = newMission();
    const panel = document.createElement('section');
    panel.setAttribute('aria-label', 'Survival mission');
    panel.style.cssText = 'pointer-events:auto;position:relative;z-index:2;margin:1rem auto;padding:1rem;max-width:1000px;background:#081b30;color:white;border:1px solid #56849a;border-radius:12px;display:flex;flex-wrap:wrap;gap:1rem;font-family:Arial,sans-serif';
    document.querySelector('#chapter-view')!.append(panel);
    const render = () => {
      panel.replaceChildren();
      const sidebar = document.createElement('aside');
      sidebar.style.cssText = 'flex:1 1 200px;background:#102c43;padding:1rem;border-radius:8px';
      sidebar.innerHTML = `<h2>Resources</h2><p>Power: ${mission.power.toFixed(1)} kWh</p><p>Oxygen: ${mission.oxygen.toFixed(1)} kg</p><p>Water: ${mission.water.toFixed(1)} L</p><p>Radiation: ${mission.radiation.toFixed(1)} / 600 mSv</p><progress aria-label="Radiation" max="600" value="${mission.radiation}"></progress><p>Research: ${mission.research} points</p><progress aria-label="Research" max="14" value="${mission.research}"></progress>`;
      const main = document.createElement('div');
      main.style.cssText = 'flex:3 1 360px;padding:1rem';
      const dark = mission.spells.find(s => mission.day >= s.start && mission.day <= s.end);
      const nextDark = mission.spells.filter(s => mission.day < s.start && mission.day >= s.start - s.warning).sort((a,b) => a.start-b.start)[0];
      const today = mission.storms.find(s => s.day === mission.day);
      const title = document.createElement('h2'); title.textContent = mission.ended ? (mission.day > 14 && mission.oxygen > 0 && mission.water > 0 && mission.radiation < 600 ? 'Mission complete!' : 'Mission ended') : `Day ${mission.day} of 14`; main.append(title);
      const log = document.createElement('p'); log.setAttribute('aria-live', 'polite'); log.textContent = mission.log; main.append(log);
      const status = document.createElement('p'); status.textContent = dark ? 'Dark spell active: solar panels are off.' : nextDark ? `Dark spell coming in ${nextDark.start - mission.day} day(s).` : 'Solar panels are working.'; main.append(status);
      if (today) { const warning = document.createElement('p'); warning.textContent = today.falseAlarm ? 'Storm alert: the storm may miss the Moon.' : `Storm impact today: ${today.event.name}.`; main.append(warning); }
      if (!mission.ended) {
        const options: [Action, string, string, string][] = [
          ['research','Do scientific research','Run an experiment at the outpost.','+1 research point · −15 kWh'],
          ['water','Recycle water','Process water for another use.','+4.6 L water saved · −15 kWh'],
          ['oxygen','Make oxygen','Split water to replenish breathable oxygen.','+1.07 kg oxygen · −1.2 L water · −15 kWh'],
          ['both','Recycle water and make oxygen','Run both life support systems.','+4.6 L water saved · +1.07 kg oxygen · −1.2 L water · −30 kWh'],
          ['savePower','Save power','Adjust the base to collect extra solar energy.','+15 kWh · −0.2 kg oxygen · −0.5 L water'],
        ];
        if (today) options.push(['shelter','Seek shelter','Protect the crew from the storm.','−50% storm dose']);
        const choices = document.createElement('div'); choices.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.6rem';
        for (const [action, label, description, effects] of options) { const button = document.createElement('button'); button.type = 'button'; button.style.cssText = 'display:block;text-align:left;padding:.8rem;background:#17364f;color:white;border:1px solid #56849a;border-radius:8px;cursor:pointer'; const heading = document.createElement('strong'); heading.textContent = label; heading.style.display = 'block'; const effect = document.createElement('span'); effect.textContent = effects; effect.style.cssText = 'display:block;color:#79e6dc;font-size:.85rem;margin:.3rem 0'; const detail = document.createElement('span'); detail.textContent = description; button.append(heading,effect,detail); button.onclick = () => { mission = takeDay(mission, action); render(); }; choices.append(button); }
        main.append(choices);
      } else { const button = document.createElement('button'); button.textContent = 'Play again'; button.onclick = () => { mission = newMission(); render(); }; main.append(button); }
      const credit = document.createElement('small'); credit.textContent = 'Estimates based on NASA life support and published solar storm research. Shelter reduction is simulated.'; main.append(credit);
      panel.append(sidebar, main);
    };
    render();
    this.events.once('shutdown', () => panel.remove());
  }
}
