import type { Fact } from './types'

export const communication = {
  radioDelay: {
    id: "communication.radioDelay",
    value: 1.3,
    unit: "seconds",
    label: "known",
    sources: ["SRC-R05-31", "SRC-R05-32"],
    credit: "NASA",
    young: "🛰️ \"Hello Earth!\" takes about 1.3 seconds to reach home. That's like a slightly laggy video call!",
    older: "Radio takes about 1.3 seconds each way between Earth and the Moon, which takes at least about 2.5 seconds."
  },
  marsDelay: {
    id: "communication.marsDelay",
    range: [3, 22],
    unit: "minutes",
    label: "known",
    sources: ["SRC-R15B-19"],
    credit: "NASA",
    young: "🔴 For Mars, a message takes 3 to 22 minutes one way. No live chatting there!",
    older: "Mars for comparison: about 3 to 22 minutes one way, so no live conversation."
  },
  farSide: {
    id: "communication.farSide",
    label: "known",
    sources: ["SRC-R15B-18"],
    credit: "NASA",
    young: "🌑 The far side of the Moon never faces Earth, so radio can't reach it directly!",
    older: "The far side never faces Earth, so radio cannot reach it directly. (It is not dark: it gets as much sunlight as the near side.)"
  },
  poleHillsBlock: {
    id: "communication.poleHillsBlock",
    label: "known",
    sources: ["SRC-R05-33", "SRC-R05-34"],
    credit: "NASA",
    young: "⛰️ At the south pole, Earth sits low in the sky, so hills can block the signal, like losing phone signal behind a building!",
    older: "At the south pole Earth is low in the sky or hidden for part of each month, so hills can block signals."
  },
  artemis2Blackout: {
    id: "communication.artemis2Blackout",
    value: 40,
    unit: "minutes",
    label: "measured",
    sources: ["SRC-R05-01", "SRC-R05-09"],
    credit: "NASA Artemis II",
    young: "⚠️ When Artemis II flew behind the Moon, the crew couldn't talk to Earth for about 40 minutes. The whole Moon was in the way!",
    older: "Artemis II lost radio contact for about 40 minutes behind the Moon on 6 April 2026."
  },
  artemis2Laser: {
    id: "communication.artemis2Laser",
    value: 484,
    unit: "gigabytes",
    label: "measured",
    sources: ["SRC-R15B-11"],
    credit: "NASA Artemis II",
    young: "🚀 Artemis II tested a laser \"space internet\" that sent 484 gigabytes of photos, videos and data home!",
    older: "Artemis II's laser link reached 260 megabits per second and sent 484 gigabytes in about 10 days. Radio (a few megabits per second) was still the main link."
  },
  deepSpaceNetwork: {
    id: "communication.deepSpaceNetwork",
    value: 3,
    unit: "places",
    label: "known",
    sources: ["SRC-R15B-15", "SRC-R15B-14"],
    credit: "NASA Deep Space Network",
    young: "📡 NASA's giant listening dishes sit in 3 places around the world: California, Spain and Australia!",
    older: "NASA's Deep Space Network has big dishes in 3 places (California, Spain, Australia). It is so busy that requests sometimes exceed capacity by up to 40%."
  },
  relaySatellites: {
    id: "communication.relaySatellites",
    label: "plan",
    sources: ["SRC-R15B-16", "SRC-R15B-17"],
    credit: "NASA",
    young: "🔁 Relay satellites pass messages around the Moon like a postman, so hidden places can still talk to Earth!",
    older: "A relay satellite sees both the surface and Earth and passes messages between them. NASA hired Intuitive Machines to put relays around the Moon for the south pole."
  },
  moonlight: {
    id: "communication.moonlight",
    value: 5,
    unit: "satellites",
    label: "plan",
    sources: ["SRC-R15B-13"],
    credit: "ESA Moonlight",
    young: "🌍 Europe's Moonlight plans 5 satellites around the Moon, for messages and for finding your way!",
    older: "ESA's Moonlight plans 5 satellites (1 for messages, 4 for navigation), focused on the south pole, with first services by the end of 2028."
  },
  lunaNet: {
    id: "communication.lunaNet",
    label: "plan",
    sources: ["SRC-R12V-24", "SRC-R12V-26"],
    credit: "NASA, ESA and JAXA",
    young: "📶 LunaNet is a set of shared rules so everyone's Moon radios and satellites work together, a bit like the internet!",
    older: "LunaNet is a set of shared rules from NASA, ESA and JAXA so communication and navigation equipment from many owners works as one network. ESA's Moonlight will follow them."
  },
  queqiao: {
    id: "communication.queqiao",
    label: "known",
    sources: ["SRC-R15B-18"],
    credit: "China's Queqiao (not NASA)",
    young: "🛰️ China's Queqiao satellite sat beyond the Moon and passed messages for a lander on the far side.",
    older: "Queqiao, a Chinese relay satellite, passed messages for the Chang'e 4 lander on the far side. (China's mission, not NASA: context only.)"
  },
  decideAlone: {
    id: "communication.decideAlone",
    label: "known",
    sources: ["SRC-R15B-18"],
    credit: "China's Chang'e 4 (not NASA)",
    young: "📡 In 2019 a Chinese lander picked its own landing spot on the far side, because nobody on Earth could steer it live!",
    older: "Chang'e 4 landed on the far side on its own: its camera and software picked a flat spot without boulders. (China's mission, not NASA: context only.) In a fast emergency, crews must also act themselves."
  },
} as const satisfies Record<string, Fact>;