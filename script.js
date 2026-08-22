// Add a new memory or letter here and it will automatically join the
// constellation and its five-point-star layout.
const stories = {
  "memory-one": {
    type: "memory",
    number: "01",
    title: "A favorite moment",
    label: "memory no. 01",
    home: { x: 11.7, y: 64.5 },
  },
  "letter-one": {
    type: "letter",
    title: "Open when you miss me",
    label: "open when you miss me",
    home: { x: 27.4, y: 31.9 },
  },
  "memory-two": {
    type: "memory",
    number: "02",
    title: "The day we couldn't stop laughing",
    label: "memory no. 02",
    home: { x: 45.5, y: 49.7 },
  },
  "letter-two": {
    type: "letter",
    title: "Open on a hard day",
    label: "open on a hard day",
    home: { x: 62.2, y: 20.3 },
  },
  "memory-three": {
    type: "memory",
    number: "03",
    title: "A place worth remembering",
    label: "memory no. 03",
    home: { x: 75.8, y: 45.6 },
  },
  "letter-three": {
    type: "letter",
    title: "Open when you need a smile",
    label: "open when you need a smile",
    home: { x: 89.3, y: 28.8 },
  },
  "memory-four": {
    type: "memory",
    number: "04",
    title: "One of our little moments",
    label: "memory no. 04",
    home: { x: 34, y: 80.6 },
  },
  "memory-five": {
    type: "memory",
    number: "05",
    title: "A memory for later",
    label: "memory no. 05",
    home: { x: 64.6, y: 77.9 },
  },
  "final-star": {
    type: "letter",
    title: "For everything still to come",
    final: true,
  },
};

// Temporary starter copy. Replace these entries with the collection you provide.
const returnMessages = [
  {
    id: "brighter-again",
    title: "You came back",
    message: "The stars noticed you came back. Somehow, this little universe feels brighter again.",
  },
  {
    id: "saved-your-place",
    title: "Your place was waiting",
    message: "This little corner of the sky saved your place. It always will.",
  },
  {
    id: "found-your-way",
    title: "Welcome back, love",
    message: "You found your way back through the stars, and there was another note waiting for you.",
  },
];

const midnightMessages = [
  {
    title: "For this quiet hour",
    message: "If you're awake beneath these stars, imagine me somewhere under the same sky, missing you too.",
  },
  {
    title: "The world is quiet",
    message: "Everything may be still right now, but there is always a little light here waiting for you.",
  },
  {
    title: "A note after midnight",
    message: "Some hours feel softer because they seem to belong only to us.",
  },
];

const requiredStoryIds = Object.entries(stories)
  .filter(([, story]) => !story.final)
  .map(([storyId]) => storyId);

const storageKeys = {
  openedStories: "midnight-blues:opened-stories",
  lastVisit: "midnight-blues:last-visit",
  returnQueue: "midnight-blues:return-message-queue",
  returnSessionMessage: "midnight-blues:return-session-message",
  returnSessionActive: "midnight-blues:return-session-active",
};

const ambientContainer = document.querySelector(".ambient-stars");
const shootingSky = document.querySelector(".shooting-sky");
const initialCluster = document.querySelector(".initial-cluster");
const midnightStar = document.querySelector(".midnight-star");
const returnStar = document.querySelector(".return-star");
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

function renderStoryStars() {
  const fragment = document.createDocumentFragment();

  requiredStoryIds.forEach((storyId, index) => {
    const story = stories[storyId];
    const star = document.createElement("button");
    const halo = document.createElement("span");
    const core = document.createElement("span");
    const label = document.createElement("span");

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

    star.append(halo, core, label);
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
let progressUpdatePending = false;

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

  for (let index = 0; index < 100; index += 1) {
    const star = document.createElement("span");
    star.className = index % 19 === 0 ? "ambient-star accent-star" : "ambient-star";
    star.style.setProperty("--left", `${seededRandom(index + 1) * 100}%`);
    star.style.setProperty("--top", `${seededRandom(index + 101) * 100}%`);
    star.style.setProperty("--size", `${0.65 + seededRandom(index + 201) * 1.45}px`);
    star.style.setProperty("--opacity", `${0.1 + seededRandom(index + 301) * 0.34}`);
    star.style.setProperty("--duration", `${2.4 + seededRandom(index + 401) * 4}s`);
    star.style.setProperty("--delay", `${seededRandom(index + 501) * -5}s`);
    fragment.appendChild(star);
  }

  ambientContainer.appendChild(fragment);
}

function randomBetween(minimum, maximum) {
  return minimum + Math.random() * (maximum - minimum);
}

function createShootingStar() {
  const star = document.createElement("span");
  const startX = randomBetween(12, 88);
  const startY = randomBetween(4, 46);
  const direction = startX < 35 ? 1 : startX > 65 ? -1 : Math.random() > 0.5 ? 1 : -1;
  const travelX = randomBetween(280, 560) * direction;
  const travelY = randomBetween(120, 280);
  const angle = Math.atan2(travelY, travelX) * (180 / Math.PI);
  const duration = randomBetween(1.25, 2.35);

  star.className = "shooting-star";
  star.style.setProperty("--start-x", `${startX}vw`);
  star.style.setProperty("--start-y", `${startY}vh`);
  star.style.setProperty("--travel-x", `${travelX}px`);
  star.style.setProperty("--travel-y", `${travelY}px`);
  star.style.setProperty("--shoot-angle", `${angle}deg`);
  star.style.setProperty("--shoot-duration", `${duration}s`);
  star.style.setProperty("--tail-length", `${randomBetween(70, 150)}px`);
  star.addEventListener("animationend", () => star.remove(), { once: true });
  shootingSky.appendChild(star);
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
      "This final star is waiting for the words that bring your little universe together.";
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
  if (!story) return;

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
  const isMidnight = isPreviewing("midnight") || (hour >= 0 && hour < 6);
  document.body.classList.toggle("midnight-mode", isMidnight);
  madeFor.textContent = isMidnight
    ? "missing me after midnight? well i miss you more"
    : madeFor.dataset.defaultText;
  setSpecialStarVisibility(midnightStar, isMidnight);
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

function initializeReturningVisitor() {
  const today = localDateKey();
  const previousVisit = readStorage(window.localStorage, storageKeys.lastVisit);
  const sessionAlreadyReturning = readStorage(
    window.sessionStorage,
    storageKeys.returnSessionActive,
  ) === "true";
  const isReturning = isPreviewing("returning")
    || sessionAlreadyReturning
    || Boolean(previousVisit && previousVisit !== today);

  writeStorage(window.localStorage, storageKeys.lastVisit, today);
  if (isReturning) writeStorage(window.sessionStorage, storageKeys.returnSessionActive, "true");
  setSpecialStarVisibility(returnStar, isReturning);
}

makeAmbientStars();
showOpenedStories();
initializeConstellationLayout();
updateFinalStar();
applyMidnightMode();
initializeReturningVisitor();

enterButton.addEventListener("click", scrollToSky);

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
  resizeTimer = window.setTimeout(() => {
    window.cancelAnimationFrame(constellationAnimationFrame);
    initializeConstellationLayout();
  }, 180);
});

window.setInterval(applyMidnightMode, 60000);

if (!reducedMotion.matches) {
  window.setTimeout(createShootingStar, 5000);
  window.setInterval(createShootingStar, 15000);
}

if (window.matchMedia("(pointer: fine)").matches) {
  document.addEventListener("pointermove", (event) => {
    document.body.classList.add("pointer-active");
    document.documentElement.style.setProperty("--mouse-x", `${event.clientX}px`);
    document.documentElement.style.setProperty("--mouse-y", `${event.clientY}px`);
  });
}
