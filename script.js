const stories = {
  "memory-one": {
    type: "memory",
    number: "01",
    title: "A favorite moment",
  },
  "memory-two": {
    type: "memory",
    number: "02",
    title: "The day we couldn't stop laughing",
  },
  "memory-three": {
    type: "memory",
    number: "03",
    title: "A place worth remembering",
  },
  "memory-four": {
    type: "memory",
    number: "04",
    title: "One of our little moments",
  },
  "memory-five": {
    type: "memory",
    number: "05",
    title: "A memory for later",
  },
  "letter-one": {
    type: "letter",
    title: "Open when you miss me",
  },
  "letter-two": {
    type: "letter",
    title: "Open on a hard day",
  },
  "letter-three": {
    type: "letter",
    title: "Open when you need a smile",
  },
};

const ambientContainer = document.querySelector(".ambient-stars");
const enterButton = document.querySelector(".enter-button");
const sky = document.querySelector(".sky");
const dialog = document.querySelector(".story-dialog");
const dialogContent = document.querySelector(".dialog-content");
const closeButton = document.querySelector(".close-dialog");
const memoryTemplate = document.querySelector("#memory-template");
const letterTemplate = document.querySelector("#letter-template");

function seededRandom(seed) {
  const value = Math.sin(seed * 9301 + 49297) * 233280;
  return value - Math.floor(value);
}

function makeAmbientStars() {
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 64; index += 1) {
    const star = document.createElement("span");
    star.className = "ambient-star";
    star.style.setProperty("--left", `${seededRandom(index + 1) * 100}%`);
    star.style.setProperty("--top", `${seededRandom(index + 101) * 100}%`);
    star.style.setProperty("--size", `${0.8 + seededRandom(index + 201) * 1.8}px`);
    star.style.setProperty("--opacity", `${0.12 + seededRandom(index + 301) * 0.36}`);
    star.style.setProperty("--duration", `${2.4 + seededRandom(index + 401) * 4}s`);
    star.style.setProperty("--delay", `${seededRandom(index + 501) * -5}s`);
    fragment.appendChild(star);
  }

  ambientContainer.appendChild(fragment);
}

function scrollToSky() {
  sky.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => {
    const firstStar = sky.querySelector(".story-star");
    firstStar?.focus({ preventScroll: true });
  }, 900);
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
  dialogContent.replaceChildren(card);

  const letterCard = dialogContent.querySelector(".letter-card");
  const openButton = dialogContent.querySelector(".open-letter");
  openButton.addEventListener("click", () => {
    letterCard.classList.add("opened");
    openButton.disabled = true;
  });
}

function openStory(storyId) {
  const story = stories[storyId];
  if (!story) return;

  if (story.type === "memory") {
    populateMemory(story);
  } else {
    populateLetter(story);
  }

  document.body.classList.add("dialog-open");
  dialog.showModal();
}

function closeStory() {
  dialog.close();
  document.body.classList.remove("dialog-open");
}

makeAmbientStars();

enterButton.addEventListener("click", scrollToSky);

document.querySelectorAll(".story-star").forEach((star) => {
  star.addEventListener("click", () => openStory(star.dataset.story));
});

closeButton.addEventListener("click", closeStory);

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeStory();
});

dialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
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

if (window.matchMedia("(pointer: fine)").matches) {
  document.addEventListener("pointermove", (event) => {
    document.body.classList.add("pointer-active");
    document.documentElement.style.setProperty("--mouse-x", `${event.clientX}px`);
    document.documentElement.style.setProperty("--mouse-y", `${event.clientY}px`);
  });
}
