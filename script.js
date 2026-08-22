// Add a new memory or letter here and it will automatically join the
// constellation and its five-point-star layout.
const stories = {
  "memory-one": {
    type: "memory",
    number: "01",
    title: "a favorite moment",
    label: "memory no. 01",
    releaseOrder: 1,
    home: { x: 11.7, y: 64.5 },
  },
  "letter-one": {
    type: "letter",
    title: "open when you miss me",
    label: "open when you miss me",
    releaseOrder: 2,
    home: { x: 27.4, y: 31.9 },
  },
  "memory-two": {
    type: "memory",
    number: "02",
    title: "the day we couldn't stop laughing",
    label: "memory no. 02",
    releaseOrder: 3,
    home: { x: 45.5, y: 49.7 },
  },
  "letter-two": {
    type: "letter",
    title: "open on a hard day",
    label: "open on a hard day",
    releaseOrder: 4,
    home: { x: 62.2, y: 20.3 },
  },
  "memory-three": {
    type: "memory",
    number: "03",
    title: "a place worth remembering",
    label: "memory no. 03",
    releaseOrder: 5,
    home: { x: 75.8, y: 45.6 },
  },
  "letter-three": {
    type: "letter",
    title: "open when you need a smile",
    label: "open when you need a smile",
    releaseOrder: 6,
    home: { x: 89.3, y: 28.8 },
  },
  "memory-four": {
    type: "memory",
    number: "04",
    title: "one of our little moments",
    label: "memory no. 04",
    releaseOrder: 7,
    home: { x: 34, y: 80.6 },
  },
  "memory-five": {
    type: "memory",
    number: "05",
    title: "a memory for later",
    label: "memory no. 05",
    releaseOrder: 8,
    home: { x: 64.6, y: 77.9 },
  },
  "final-star": {
    type: "letter",
    title: "for everything still to come",
    final: true,
  },
};

// Temporary starter copy. Replace these entries with the collection you provide.
const returnMessages = [
  {
    id: "brighter-again",
    title: "you came back",
    message: "the stars noticed you came back. somehow, this little universe feels brighter again.",
  },
  {
    id: "saved-your-place",
    title: "your place was waiting",
    message: "this little corner of the sky saved your place. it always will.",
  },
  {
    id: "found-your-way",
    title: "welcome back, love",
    message: "you found your way back through the stars, and there was another note waiting for you.",
  },
];

const midnightMessages = [
  {
    title: "for this quiet hour",
    message: "if you're awake beneath these stars, imagine me somewhere under the same sky, missing you too.",
  },
  {
    title: "the world is quiet",
    message: "everything may be still right now, but there is always a little light here waiting for you.",
  },
  {
    title: "a note after midnight",
    message: "some hours feel softer because they seem to belong only to us.",
  },
];

const requiredStoryIds = Object.entries(stories)
  .filter(([, story]) => !story.final)
  .sort(([, first], [, second]) => first.releaseOrder - second.releaseOrder)
  .map(([storyId]) => storyId);

const storageKeys = {
  openedStories: "midnight-blues:opened-stories",
  lastVisit: "midnight-blues:last-visit",
  returnQueue: "midnight-blues:return-message-queue",
  returnSessionMessage: "midnight-blues:return-session-message",
  returnSessionActive: "midnight-blues:return-session-active",
  firstDailyUnlock: "midnight-blues:first-daily-unlock",
};

const ambientContainer = document.querySelector(".ambient-stars");
const ambientStarConnection = document.querySelector(".star-hover-connection");
const moonGlow = document.querySelector(".midnight-moon-glow");
const midnightMoon = document.querySelector(".midnight-moon");
const moonLight = document.querySelector(".moon-light");
const shootingSky = document.querySelector(".shooting-sky");
const idleWhisper = document.querySelector(".idle-whisper");
const initialCluster = document.querySelector(".initial-cluster");
const midnightStar = document.querySelector(".midnight-star");
const returnStar = document.querySelector(".return-star");
const midnightToggle = document.querySelector(".midnight-toggle");
const returnerToggle = document.querySelector(".returner-toggle");
const madeFor = document.querySelector(".made-for");
const enterButton = document.querySelector(".enter-button");
const sky = document.querySelector(".sky");
const constellation = document.querySelector(".constellation");
const constellationPath = document.querySelector(".constellation-path");
const storyStarsContainer = document.querySelector(".story-stars");
const dialog = document.querySelector(".story-dialog");
const dialogContent = document.querySelector(".dialog-content");
const closeButton = document.querySelector(".close-dialog");
const memoryTemplate = document.querySelector("#memory-template");
const letterTemplate = document.querySelector("#letter-template");
const messageTemplate = document.querySelector("#message-template");
const finalStar = document.querySelector(".final-star");
const finalStarNotice = document.querySelector(".final-star-notice");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const previewModes = new Set(
  (new URLSearchParams(window.location.search).get("preview") || "")
    .split(",")
    .filter(Boolean),
);

function isPreviewing(mode) {
  return previewModes.has("all") || previewModes.has(mode);
}

// Temporary review overrides. Set these to false after copy and visual review.
const reviewSettings = {
  forceAllStoriesUnlocked: !previewModes.has("schedule"),
  forceMidnightMode: true,
  forceReturningVisitor: true,
};
let manualMidnightOverride = null;
let manualReturnerOverride = null;
let automaticReturningVisitor = false;
let ambientStarElements = [];
let ambientConnectionFrame = null;
let latestPointerPosition = null;

function renderStoryStars() {
  const fragment = document.createDocumentFragment();

  requiredStoryIds.forEach((storyId, index) => {
    const story = stories[storyId];
    const star = document.createElement("button");
    const halo = document.createElement("span");
    const core = document.createElement("span");
    const label = document.createElement("span");
    const countdown = document.createElement("span");

    star.className = `story-star ${story.type}-star`;
    star.type = "button";
    star.dataset.story = storyId;
    star.style.setProperty("--x", `${story.home.x}%`);
    star.style.setProperty("--y", `${story.home.y}%`);
    star.style.setProperty("--delay", `${0.05 + index * 0.1}s`);

    halo.className = "star-halo";
    core.className = "star-core";
    label.className = "star-label";
    label.textContent = story.label;
    countdown.className = "star-countdown";

    star.append(halo, core, label, countdown);
    fragment.appendChild(star);
  });

  storyStarsContainer.appendChild(fragment);
}

renderStoryStars();

const storyStarElements = [...storyStarsContainer.querySelectorAll(".story-star")];

function readStorage(storage, key, fallback = null) {
  try {
    const value = storage.getItem(key);
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

function writeStorage(storage, key, value) {
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function readJsonStorage(storage, key, fallback) {
  try {
    const value = readStorage(storage, key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function getOpenedStories() {
  const savedStories = readJsonStorage(window.localStorage, storageKeys.openedStories, []);
  if (!Array.isArray(savedStories)) return new Set();
  return new Set(savedStories.filter((storyId) => Object.hasOwn(stories, storyId)));
}

const openedStories = getOpenedStories();
let unlockedStoryIds = new Set();
let progressUpdatePending = false;

function nextSixAmAfter(date) {
  const nextUnlock = new Date(date);
  nextUnlock.setHours(6, 0, 0, 0);
  if (nextUnlock <= date) nextUnlock.setDate(nextUnlock.getDate() + 1);
  return nextUnlock;
}

function dailyScheduleState(now = new Date()) {
  if (reviewSettings.forceAllStoriesUnlocked) {
    return { unlockedCount: requiredStoryIds.length, nextUnlockAt: null };
  }

  let firstUnlockAt = Number(readStorage(window.localStorage, storageKeys.firstDailyUnlock));
  if (!Number.isFinite(firstUnlockAt) || firstUnlockAt <= 0) {
    firstUnlockAt = nextSixAmAfter(now).getTime();
    writeStorage(window.localStorage, storageKeys.firstDailyUnlock, String(firstUnlockAt));
  }

  let unlockedCount = Math.min(1, requiredStoryIds.length);
  const nextUnlock = new Date(firstUnlockAt);

  while (unlockedCount < requiredStoryIds.length && nextUnlock <= now) {
    unlockedCount += 1;
    nextUnlock.setDate(nextUnlock.getDate() + 1);
    nextUnlock.setHours(6, 0, 0, 0);
  }

  const highestOpenedIndex = requiredStoryIds.reduce(
    (highest, storyId, index) => openedStories.has(storyId) ? Math.max(highest, index) : highest,
    -1,
  );
  unlockedCount = Math.max(unlockedCount, highestOpenedIndex + 1);

  return {
    unlockedCount,
    nextUnlockAt: unlockedCount < requiredStoryIds.length ? nextUnlock.getTime() : null,
  };
}

function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

function applyDailyUnlocks() {
  const now = new Date();
  const { unlockedCount, nextUnlockAt } = dailyScheduleState(now);
  unlockedStoryIds = new Set(requiredStoryIds.slice(0, unlockedCount));
  const nextStoryId = requiredStoryIds[unlockedCount];

  storyStarElements.forEach((star) => {
    const storyId = star.dataset.story;
    const story = stories[storyId];
    const label = star.querySelector(".star-label");
    const countdown = star.querySelector(".star-countdown");
    const isUnlocked = unlockedStoryIds.has(storyId);
    const isNext = storyId === nextStoryId;

    star.classList.toggle("is-locked", !isUnlocked);
    star.classList.toggle("is-next-unlock", isNext);
    star.disabled = !isUnlocked;
    star.tabIndex = isUnlocked ? 0 : -1;

    if (isUnlocked) {
      label.textContent = story.label;
      countdown.textContent = "";
      star.removeAttribute("aria-label");
    } else {
      label.textContent = "still dreaming";
      countdown.textContent = isNext && nextUnlockAt
        ? formatCountdown(nextUnlockAt - now.getTime())
        : "";
      star.setAttribute(
        "aria-label",
        isNext && countdown.textContent
          ? `still dreaming. unlocks in ${countdown.textContent}`
          : "still dreaming. this star unlocks on a future day.",
      );
    }
  });
}

function isStoryUnlocked(storyId) {
  return storyId === "final-star" || unlockedStoryIds.has(storyId);
}

function showOpenedStories() {
  openedStories.forEach((storyId) => {
    document.querySelector(`[data-story="${storyId}"]`)?.classList.add("is-opened");
  });
}

function openedStoryCount() {
  return requiredStoryIds.filter((storyId) => openedStories.has(storyId)).length;
}

function updateFinalStar({ announce = false } = {}) {
  const isComplete = requiredStoryIds.every((storyId) => openedStories.has(storyId));
  const wasUnlocked = finalStar.classList.contains("is-unlocked");

  if (!isComplete) return;

  finalStar.classList.add("is-unlocked");
  finalStar.disabled = false;
  finalStar.tabIndex = 0;
  finalStar.setAttribute("aria-hidden", "false");

  if (announce && !wasUnlocked) {
    finalStarNotice.textContent = "one last star has appeared at the center";
    finalStarNotice.classList.add("visible");
    window.setTimeout(() => finalStarNotice.classList.remove("visible"), 6000);
  }
}

function rememberOpenedStory(storyId) {
  const isNewlyOpened = !openedStories.has(storyId);
  openedStories.add(storyId);
  document.querySelector(`[data-story="${storyId}"]`)?.classList.add("is-opened");
  writeStorage(window.localStorage, storageKeys.openedStories, JSON.stringify([...openedStories]));

  if (isNewlyOpened && storyId !== "final-star") {
    progressUpdatePending = true;
  }
}

function seededRandom(seed) {
  const value = Math.sin(seed * 9301 + 49297) * 233280;
  return value - Math.floor(value);
}

function makeAmbientStars() {
  const fragment = document.createDocumentFragment();
  const regularStarCount = 100;
  const midnightStarCount = 60;

  for (let index = 0; index < regularStarCount + midnightStarCount; index += 1) {
    const isMidnightOnly = index >= regularStarCount;
    const star = document.createElement("span");
    star.className = [
      "ambient-star",
      index % 19 === 0 ? "accent-star" : "",
      isMidnightOnly ? "midnight-only-star" : "",
    ]
      .filter(Boolean)
      .join(" ");
    star.style.setProperty("--left", `${seededRandom(index + 1) * 100}%`);
    star.style.setProperty("--top", `${seededRandom(index + 101) * 100}%`);
    star.style.setProperty("--size", `${0.65 + seededRandom(index + 201) * 1.45}px`);
    star.style.setProperty(
      "--opacity",
      `${(isMidnightOnly ? 0.16 : 0.1) + seededRandom(index + 301) * (isMidnightOnly ? 0.4 : 0.34)}`,
    );
    star.style.setProperty("--duration", `${2.4 + seededRandom(index + 401) * 4}s`);
    star.style.setProperty("--delay", `${seededRandom(index + 501) * -5}s`);
    fragment.appendChild(star);
  }

  ambientContainer.appendChild(fragment);
  ambientStarElements = [...ambientContainer.querySelectorAll(".ambient-star")];
}

function randomBetween(minimum, maximum) {
  return minimum + Math.random() * (maximum - minimum);
}

const synodicMonthDays = 29.530588;
const knownNewMoonUtc = Date.UTC(2000, 0, 6, 18, 15);

function currentMoonPhase(date = new Date()) {
  const daysSinceKnownNewMoon = (date.getTime() - knownNewMoonUtc) / 86400000;
  const elapsedCycles = daysSinceKnownNewMoon / synodicMonthDays;
  const phase = ((elapsedCycles % 1) + 1) % 1;
  const illumination = (1 - Math.cos(phase * Math.PI * 2)) / 2;
  return { phase, illumination };
}

function moonPhaseName(phase) {
  const phases = [
    "new moon",
    "waxing crescent",
    "first quarter",
    "waxing gibbous",
    "full moon",
    "waning gibbous",
    "last quarter",
    "waning crescent",
  ];
  return phases[Math.floor((phase + 0.0625) * 8) % phases.length];
}

function moonLightPath(phase, illumination) {
  if (illumination < 0.0005) return "";
  if (illumination > 0.9995) {
    return "M 50 5 A 45 45 0 0 1 50 95 A 45 45 0 0 1 50 5 Z";
  }

  const waxing = phase < 0.5;
  const outerSweep = waxing ? 1 : 0;
  const phaseCosine = Math.cos(phase * Math.PI * 2);
  const terminatorControlX = waxing
    ? 50 + 90 * phaseCosine
    : 50 - 90 * phaseCosine;

  return `M 50 5 A 45 45 0 0 ${outerSweep} 50 95 Q ${terminatorControlX} 50 50 5 Z`;
}

function updateMoonPhase() {
  const { phase, illumination } = currentMoonPhase();
  moonLight.setAttribute("d", moonLightPath(phase, illumination));
  midnightMoon.dataset.phase = moonPhaseName(phase);
  midnightMoon.dataset.illumination = illumination.toFixed(3);
  moonGlow.style.setProperty("--moon-glow-opacity", `${0.3 + illumination * 0.36}`);
}

const maxActiveShootingStars = 3;

function createShootingStar() {
  if (shootingSky.querySelectorAll(".shooting-star").length >= maxActiveShootingStars) return;

  const star = document.createElement("span");
  const startX = randomBetween(-8, 42);
  const startY = randomBetween(-5, 28);
  const angle = randomBetween(18, 38);
  const travelX = Math.max(randomBetween(window.innerWidth * 0.55, window.innerWidth * 0.9), 520);
  const travelY = travelX * Math.tan(angle * (Math.PI / 180));
  const duration = randomBetween(2.2, 4.1);

  star.className = "shooting-star";
  star.style.setProperty("--start-x", `${startX}vw`);
  star.style.setProperty("--start-y", `${startY}vh`);
  star.style.setProperty("--travel-x", `${travelX}px`);
  star.style.setProperty("--travel-y", `${travelY}px`);
  star.style.setProperty("--shoot-angle", `${angle}deg`);
  star.style.setProperty("--shoot-duration", `${duration}s`);
  star.style.setProperty("--tail-length", `${randomBetween(130, 240)}px`);
  const cleanupTimer = window.setTimeout(() => star.remove(), (duration + 0.75) * 1000);
  star.addEventListener("animationend", () => {
    window.clearTimeout(cleanupTimer);
    star.remove();
  }, { once: true });
  shootingSky.appendChild(star);
}

function createShootingStarEvent() {
  const activeCount = shootingSky.querySelectorAll(".shooting-star").length;
  const availableSlots = maxActiveShootingStars - activeCount;
  if (availableSlots <= 0) return;

  const roll = Math.random();
  const requestedCount = roll < 0.08 ? 3 : roll < 0.3 ? 2 : 1;
  const eventCount = Math.min(requestedCount, availableSlots);

  for (let index = 0; index < eventCount; index += 1) {
    window.setTimeout(createShootingStar, index * randomBetween(180, 520));
  }
}

function scheduleNextShootingStar({ initial = false } = {}) {
  const delay = initial ? randomBetween(4500, 8000) : randomBetween(11000, 24000);
  window.setTimeout(() => {
    createShootingStarEvent();
    scheduleNextShootingStar();
  }, delay);
}

function hideAmbientStarConnection() {
  ambientStarConnection.classList.remove("is-visible");
}

function renderAmbientStarConnection() {
  ambientConnectionFrame = null;
  if (!latestPointerPosition || document.body.classList.contains("dialog-open")) {
    hideAmbientStarConnection();
    return;
  }

  const bounds = ambientContainer.getBoundingClientRect();
  const midnightMode = document.body.classList.contains("midnight-mode");
  const points = ambientStarElements
    .filter((star) => midnightMode || !star.classList.contains("midnight-only-star"))
    .map((star) => ({
      x: bounds.left + (parseFloat(star.style.getPropertyValue("--left")) / 100) * bounds.width,
      y: bounds.top + (parseFloat(star.style.getPropertyValue("--top")) / 100) * bounds.height,
    }))
    .filter(({ x, y }) => (
      x >= -24
      && x <= window.innerWidth + 24
      && y >= -24
      && y <= window.innerHeight + 24
    ));

  let hoveredPoint = null;
  let hoveredDistance = Number.POSITIVE_INFINITY;

  points.forEach((point) => {
    const distance = Math.hypot(
      point.x - latestPointerPosition.x,
      point.y - latestPointerPosition.y,
    );
    if (distance < hoveredDistance) {
      hoveredDistance = distance;
      hoveredPoint = point;
    }
  });

  if (!hoveredPoint || hoveredDistance > 52) {
    hideAmbientStarConnection();
    return;
  }

  let neighborPoint = null;
  let neighborDistance = Number.POSITIVE_INFINITY;

  points.forEach((point) => {
    const distance = Math.hypot(point.x - hoveredPoint.x, point.y - hoveredPoint.y);
    if (distance > 0.5 && distance < neighborDistance) {
      neighborDistance = distance;
      neighborPoint = point;
    }
  });

  if (!neighborPoint || neighborDistance > 230) {
    hideAmbientStarConnection();
    return;
  }

  const angle = Math.atan2(
    neighborPoint.y - hoveredPoint.y,
    neighborPoint.x - hoveredPoint.x,
  ) * (180 / Math.PI);

  ambientStarConnection.style.left = `${hoveredPoint.x}px`;
  ambientStarConnection.style.top = `${hoveredPoint.y}px`;
  ambientStarConnection.style.width = `${neighborDistance}px`;
  ambientStarConnection.style.setProperty("--connection-angle", `${angle}deg`);
  ambientStarConnection.classList.add("is-visible");
}

function queueAmbientStarConnection(event) {
  latestPointerPosition = { x: event.clientX, y: event.clientY };
  if (ambientConnectionFrame !== null) return;
  ambientConnectionFrame = window.requestAnimationFrame(renderAmbientStarConnection);
}

const inactivityDelay = 3 * 60 * 1000;
let inactivityCheckTimer = null;
let lastActivityAt = Date.now();

function hideIdleWhisper() {
  idleWhisper.classList.remove("is-visible");
  idleWhisper.textContent = "";
}

function scheduleInactivityCheck() {
  window.clearTimeout(inactivityCheckTimer);
  const remaining = Math.max(0, inactivityDelay - (Date.now() - lastActivityAt));

  inactivityCheckTimer = window.setTimeout(() => {
    const inactiveFor = Date.now() - lastActivityAt;
    if (inactiveFor < inactivityDelay) {
      scheduleInactivityCheck();
      return;
    }

    idleWhisper.textContent = "still here?";
    idleWhisper.classList.add("is-visible");
    inactivityCheckTimer = null;
  }, remaining);
}

function recordActivity() {
  lastActivityAt = Date.now();
  if (idleWhisper.classList.contains("is-visible")) {
    hideIdleWhisper();
  }
  if (inactivityCheckTimer === null) scheduleInactivityCheck();
}

function pointDistance(first, second, width, height) {
  return Math.hypot(
    ((first.x - second.x) / 100) * width,
    ((first.y - second.y) / 100) * height,
  );
}

function interpolatePoint(start, end, progress) {
  return {
    x: start.x + (end.x - start.x) * progress,
    y: start.y + (end.y - start.y) * progress,
  };
}

function generatePentagramTargets(count) {
  const compactLayout = window.matchMedia("(max-width: 720px)").matches;
  const radiusX = compactLayout ? 37 : 31;
  const radiusY = compactLayout ? 23 : 40;
  const outerPoints = Array.from({ length: 5 }, (_, index) => {
    const angle = (-90 + index * 72) * (Math.PI / 180);
    return {
      x: 50 + Math.cos(angle) * radiusX,
      y: 50 + Math.sin(angle) * radiusY,
    };
  });

  if (count < 5) {
    return outerPoints.slice(0, count).map((point, sequence) => ({ ...point, sequence }));
  }

  const route = [0, 2, 4, 1, 3];
  const extraPointCounts = Array(5).fill(Math.floor((count - 5) / 5));
  for (let index = 0; index < (count - 5) % 5; index += 1) {
    extraPointCounts[index] += 1;
  }

  const targets = [];

  route.forEach((pointIndex, segmentIndex) => {
    const start = outerPoints[pointIndex];
    const end = outerPoints[route[(segmentIndex + 1) % route.length]];
    targets.push({ ...start, sequence: targets.length });

    for (let extraIndex = 1; extraIndex <= extraPointCounts[segmentIndex]; extraIndex += 1) {
      let progress = extraIndex / (extraPointCounts[segmentIndex] + 1);
      if (extraPointCounts[segmentIndex] === 1) {
        progress = segmentIndex % 2 === 0 ? 0.4 : 0.6;
      }
      const point = interpolatePoint(start, end, progress);
      targets.push({ ...point, sequence: targets.length });
    }
  });

  return targets;
}

function minimumSpacingForPairs(pairs, width, height) {
  let minimumSpacing = Number.POSITIVE_INFINITY;

  for (let sample = 0; sample <= 20; sample += 1) {
    const progress = sample / 20;
    const positions = pairs.map(({ home, target }) => interpolatePoint(home, target, progress));

    for (let firstIndex = 0; firstIndex < positions.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < positions.length; secondIndex += 1) {
        minimumSpacing = Math.min(
          minimumSpacing,
          pointDistance(positions[firstIndex], positions[secondIndex], width, height),
        );
      }
    }
  }

  return minimumSpacing;
}

function buildCollisionSafeMapping() {
  const width = constellation.clientWidth || 1000;
  const height = constellation.clientHeight || 620;
  const homes = storyStarElements.map((element) => ({
    element,
    storyId: element.dataset.story,
    home: stories[element.dataset.story].home,
  }));
  const targets = generatePentagramTargets(homes.length);
  const angleOf = (point) => Math.atan2(
    ((point.y - 50) / 100) * height,
    ((point.x - 50) / 100) * width,
  );
  const sortedHomes = [...homes].sort((first, second) => angleOf(first.home) - angleOf(second.home));
  const angularTargets = [...targets].sort((first, second) => angleOf(first) - angleOf(second));
  let bestPairs = [];
  let bestScore = Number.NEGATIVE_INFINITY;

  [angularTargets, [...angularTargets].reverse()].forEach((targetOrder) => {
    for (let shift = 0; shift < targetOrder.length; shift += 1) {
      const pairs = sortedHomes.map((home, index) => ({
        ...home,
        target: targetOrder[(index + shift) % targetOrder.length],
      }));
      const minimumSpacing = minimumSpacingForPairs(pairs, width, height);
      const averageTravel = pairs.reduce(
        (total, pair) => total + pointDistance(pair.home, pair.target, width, height),
        0,
      ) / pairs.length;
      const score = minimumSpacing - averageTravel * 0.015;

      if (score > bestScore) {
        bestScore = score;
        bestPairs = pairs;
      }
    }
  });

  return bestPairs;
}

let constellationMapping = [];
let currentConstellationPositions = new Map();
let constellationAnimationFrame = null;

function progressLayout() {
  const progress = requiredStoryIds.length === 0 ? 0 : openedStoryCount() / requiredStoryIds.length;
  return new Map(
    constellationMapping.map(({ storyId, home, target }) => [
      storyId,
      interpolatePoint(home, target, progress),
    ]),
  );
}

function updateConstellationPath(positions) {
  const orderedPairs = [...constellationMapping].sort(
    (first, second) => first.target.sequence - second.target.sequence,
  );
  if (orderedPairs.length === 0) return;

  const path = orderedPairs.map(({ storyId }, index) => {
    const point = positions.get(storyId);
    return `${index === 0 ? "M" : "L"} ${point.x * 10} ${point.y * 6.2}`;
  }).join(" ");

  constellationPath.setAttribute("d", `${path} Z`);
}

function applyConstellationLayout(positions) {
  constellationMapping.forEach(({ element, storyId }) => {
    const point = positions.get(storyId);
    element.style.setProperty("--x", `${point.x}%`);
    element.style.setProperty("--y", `${point.y}%`);
  });
  updateConstellationPath(positions);
  currentConstellationPositions = new Map(positions);
}

function initializeConstellationLayout() {
  constellationMapping = buildCollisionSafeMapping();
  applyConstellationLayout(progressLayout());
}

function animateConstellationToProgress() {
  const targetPositions = progressLayout();

  if (reducedMotion.matches) {
    applyConstellationLayout(targetPositions);
    return;
  }

  window.cancelAnimationFrame(constellationAnimationFrame);
  const startPositions = new Map(currentConstellationPositions);
  const startedAt = performance.now();
  const duration = 3200;

  function animateFrame(now) {
    const elapsed = Math.min((now - startedAt) / duration, 1);
    const eased = elapsed < 0.5
      ? 4 * elapsed * elapsed * elapsed
      : 1 - Math.pow(-2 * elapsed + 2, 3) / 2;
    const framePositions = new Map();

    constellationMapping.forEach(({ storyId }) => {
      framePositions.set(
        storyId,
        interpolatePoint(startPositions.get(storyId), targetPositions.get(storyId), eased),
      );
    });

    applyConstellationLayout(framePositions);

    if (elapsed < 1) {
      constellationAnimationFrame = window.requestAnimationFrame(animateFrame);
    }
  }

  constellationAnimationFrame = window.requestAnimationFrame(animateFrame);
}

function flushProgressUpdate() {
  if (!progressUpdatePending) return;
  progressUpdatePending = false;
  animateConstellationToProgress();
  updateFinalStar({ announce: true });
}

function scrollToSky() {
  sky.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => storyStarElements[0]?.focus({ preventScroll: true }), 900);
}

function populateMemory(story) {
  const card = memoryTemplate.content.cloneNode(true);
  card.querySelector(".dialog-kicker").textContent = `memory no. ${story.number}`;
  card.querySelector("h3").textContent = story.title;
  dialogContent.replaceChildren(card);
}

function populateLetter(story) {
  const card = letterTemplate.content.cloneNode(true);
  card.querySelector("h3").textContent = story.title;

  if (story.final) {
    card.querySelector(".dialog-kicker").textContent = "the final star";
    card.querySelector(".letter-sheet span").textContent = "one last thing";
    card.querySelector(".letter-message > p:nth-child(2)").textContent =
      "this final star is waiting for the words that bring your little universe together.";
  }

  dialogContent.replaceChildren(card);

  const letterCard = dialogContent.querySelector(".letter-card");
  const openButton = dialogContent.querySelector(".open-letter");
  openButton.addEventListener("click", () => {
    letterCard.classList.add("opened");
    openButton.disabled = true;
  });
}

function populateSpecialMessage({ kicker, title, message, signoff }) {
  const card = messageTemplate.content.cloneNode(true);
  card.querySelector(".dialog-kicker").textContent = kicker;
  card.querySelector("h3").textContent = title;
  card.querySelector(".special-message-body").textContent = message;
  card.querySelector(".special-message-signoff").textContent = signoff;
  dialogContent.replaceChildren(card);
}

function showDialog() {
  document.body.classList.add("dialog-open");
  dialog.showModal();
}

function openStory(storyId) {
  const story = stories[storyId];
  if (!story || !isStoryUnlocked(storyId)) return;

  rememberOpenedStory(storyId);
  if (story.type === "memory") populateMemory(story);
  else populateLetter(story);
  showDialog();
}

function closeStory() {
  dialog.close();
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function setSpecialStarVisibility(star, isVisible) {
  star.classList.toggle("is-visible", isVisible);
  star.disabled = !isVisible;
  star.tabIndex = isVisible ? 0 : -1;
  star.setAttribute("aria-hidden", String(!isVisible));
}

function hashText(text) {
  return [...text].reduce((hash, character) => ((hash << 5) - hash + character.charCodeAt(0)) | 0, 0);
}

function currentMidnightMessage() {
  const index = Math.abs(hashText(localDateKey())) % midnightMessages.length;
  return midnightMessages[index];
}

function applyMidnightMode() {
  const hour = new Date().getHours();
  const automaticMidnight = reviewSettings.forceMidnightMode
    || isPreviewing("midnight")
    || (hour >= 0 && hour < 6);
  const isMidnight = manualMidnightOverride ?? automaticMidnight;
  document.body.classList.toggle("midnight-mode", isMidnight);
  madeFor.textContent = isMidnight
    ? "missing me after midnight? well i miss you more"
    : madeFor.dataset.defaultText;
  setSpecialStarVisibility(midnightStar, isMidnight);
  hideAmbientStarConnection();
  midnightToggle.setAttribute("aria-pressed", String(isMidnight));
  midnightToggle.querySelector("span").textContent = isMidnight ? "midnight on" : "midnight off";
}

function shuffled(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function currentReturnMessage() {
  const messageIds = new Set(returnMessages.map(({ id }) => id));
  const sessionMessageId = readStorage(window.sessionStorage, storageKeys.returnSessionMessage);
  const savedSessionMessage = returnMessages.find(({ id }) => id === sessionMessageId);
  if (savedSessionMessage) return savedSessionMessage;

  let queue = readJsonStorage(window.localStorage, storageKeys.returnQueue, []);
  if (!Array.isArray(queue)) queue = [];
  queue = queue.filter((messageId) => messageIds.has(messageId));
  if (queue.length === 0) queue = shuffled([...messageIds]);

  const nextMessageId = queue.shift();
  writeStorage(window.localStorage, storageKeys.returnQueue, JSON.stringify(queue));
  writeStorage(window.sessionStorage, storageKeys.returnSessionMessage, nextMessageId);
  return returnMessages.find(({ id }) => id === nextMessageId) || returnMessages[0];
}

function applyReturnerVisibility() {
  const isVisible = manualReturnerOverride ?? automaticReturningVisitor;
  setSpecialStarVisibility(returnStar, isVisible);
  returnerToggle.setAttribute("aria-pressed", String(isVisible));
  returnerToggle.querySelector("span").textContent = isVisible ? "returner on" : "returner off";
}

function initializeReturningVisitor() {
  const today = localDateKey();
  const previousVisit = readStorage(window.localStorage, storageKeys.lastVisit);
  const sessionAlreadyReturning = readStorage(
    window.sessionStorage,
    storageKeys.returnSessionActive,
  ) === "true";
  automaticReturningVisitor = reviewSettings.forceReturningVisitor
    || isPreviewing("returning")
    || sessionAlreadyReturning
    || Boolean(previousVisit && previousVisit !== today);

  writeStorage(window.localStorage, storageKeys.lastVisit, today);
  if (automaticReturningVisitor) {
    writeStorage(window.sessionStorage, storageKeys.returnSessionActive, "true");
  }
  applyReturnerVisibility();
}

makeAmbientStars();
updateMoonPhase();
showOpenedStories();
applyDailyUnlocks();
initializeConstellationLayout();
updateFinalStar();
applyMidnightMode();
initializeReturningVisitor();
scheduleInactivityCheck();

enterButton.addEventListener("click", scrollToSky);

midnightToggle.addEventListener("click", () => {
  manualMidnightOverride = !document.body.classList.contains("midnight-mode");
  applyMidnightMode();
});

returnerToggle.addEventListener("click", () => {
  manualReturnerOverride = !returnStar.classList.contains("is-visible");
  applyReturnerVisibility();
});

document.querySelectorAll(".story-star").forEach((star) => {
  star.addEventListener("click", () => openStory(star.dataset.story));
});

midnightStar.addEventListener("click", () => {
  const message = currentMidnightMessage();
  populateSpecialMessage({
    kicker: "between midnight and six",
    title: message.title,
    message: message.message,
    signoff: "missing you under the same sky",
  });
  showDialog();
});

returnStar.addEventListener("click", () => {
  const message = currentReturnMessage();
  populateSpecialMessage({
    kicker: "a little welcome-back star",
    title: message.title,
    message: message.message,
    signoff: "the stars remembered you",
  });
  showDialog();
});

closeButton.addEventListener("click", closeStory);

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeStory();
});

dialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
  flushProgressUpdate();
});

const skyObserver = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting) {
      sky.classList.add("in-view");
      skyObserver.disconnect();
    }
  },
  { threshold: 0.16 },
);

skyObserver.observe(sky);

initialCluster.addEventListener("click", () => {
  const isRevealed = initialCluster.classList.toggle("revealed");
  initialCluster.setAttribute("aria-pressed", String(isRevealed));
});

let resizeTimer;
window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  hideAmbientStarConnection();
  resizeTimer = window.setTimeout(() => {
    window.cancelAnimationFrame(constellationAnimationFrame);
    initializeConstellationLayout();
  }, 180);
});

window.setInterval(applyMidnightMode, 60000);
window.setInterval(applyDailyUnlocks, 1000);
window.setInterval(updateMoonPhase, 60 * 60 * 1000);

if (!reducedMotion.matches) {
  scheduleNextShootingStar({ initial: true });
}

if (window.matchMedia("(pointer: fine)").matches) {
  document.addEventListener("pointermove", (event) => {
    document.body.classList.add("pointer-active");
    document.documentElement.style.setProperty("--mouse-x", `${event.clientX}px`);
    document.documentElement.style.setProperty("--mouse-y", `${event.clientY}px`);
    queueAmbientStarConnection(event);
  });
  document.addEventListener("pointerleave", hideAmbientStarConnection);
  window.addEventListener("scroll", hideAmbientStarConnection, { passive: true });
}

document.addEventListener("pointermove", recordActivity, { passive: true });
document.addEventListener("pointerdown", recordActivity, { passive: true });
document.addEventListener("keydown", recordActivity);
document.addEventListener("touchstart", recordActivity, { passive: true });
window.addEventListener("scroll", recordActivity, { passive: true });
