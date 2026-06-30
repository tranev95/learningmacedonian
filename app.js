const STORAGE_KEY = "macedonian-flashcards-known";

const card = document.getElementById("card");
const wordMk = document.getElementById("word-mk");
const wordEn = document.getElementById("word-en");
const phonetic = document.getElementById("phonetic");
const knownCount = document.getElementById("known-count");
const remainingCount = document.getElementById("remaining-count");
const cardCounter = document.getElementById("card-counter");
const knowBtn = document.getElementById("know-btn");

let deck = [];
let currentIndex = 0;
let knownIds = loadKnown();

function loadKnown() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
  } catch {
    return new Set();
  }
}

function saveKnown() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...knownIds]));
}

function cardId(card) {
  return `${card.mk}|${card.en}`;
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function resetFlipInstant() {
  card.classList.add("no-transition");
  card.classList.remove("flipped");
  void card.offsetHeight;
  card.classList.remove("no-transition");
}

function renderCard() {
  if (deck.length === 0) {
    resetFlipInstant();
    wordMk.textContent = "No cards";
    wordEn.textContent = "—";
    phonetic.textContent = "";
    cardCounter.textContent = "0 / 0";
    updateStats();
    return;
  }

  resetFlipInstant();

  const current = deck[currentIndex];
  wordMk.textContent = current.mk;
  wordEn.textContent = current.en;
  phonetic.textContent = current.phonetic ? `/ ${current.phonetic} /` : "";
  cardCounter.textContent = `${currentIndex + 1} / ${deck.length}`;

  const id = cardId(current);
  knowBtn.classList.toggle("marked", knownIds.has(id));
  knowBtn.textContent = knownIds.has(id) ? "Learned ✓" : "Got it ✓";

  updateStats();
}

function updateStats() {
  const deckIds = new Set(deck.map(cardId));
  const learnedInDeck = [...knownIds].filter((id) => deckIds.has(id)).length;
  knownCount.textContent = learnedInDeck;
  remainingCount.textContent = deck.length - learnedInDeck;
}

function goNext() {
  if (deck.length === 0) return;
  currentIndex = (currentIndex + 1) % deck.length;
  renderCard();
}

function goPrev() {
  if (deck.length === 0) return;
  currentIndex = (currentIndex - 1 + deck.length) % deck.length;
  renderCard();
}

function toggleKnown() {
  if (deck.length === 0) return;
  const id = cardId(deck[currentIndex]);
  const wasKnown = knownIds.has(id);
  if (wasKnown) {
    knownIds.delete(id);
  } else {
    knownIds.add(id);
  }
  saveKnown();
  if (!wasKnown && deck.length > 1) {
    goNext();
  } else {
    renderCard();
  }
}

function startDeck(shuffled = false) {
  deck = shuffled ? shuffleArray(FLASHCARDS) : [...FLASHCARDS];
  currentIndex = 0;
  renderCard();
}

card.addEventListener("click", () => {
  card.classList.toggle("flipped");
});

document.getElementById("prev-btn").addEventListener("click", (e) => {
  e.stopPropagation();
  goPrev();
});

document.getElementById("next-btn").addEventListener("click", (e) => {
  e.stopPropagation();
  goNext();
});

knowBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleKnown();
});

document.getElementById("shuffle-btn").addEventListener("click", () => {
  startDeck(true);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") goNext();
  if (e.key === "ArrowLeft") goPrev();
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    card.classList.toggle("flipped");
  }
});

startDeck();
