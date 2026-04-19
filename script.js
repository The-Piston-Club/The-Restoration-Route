// STATE
let stamps = 0;
const TOTAL_STAMPS = 8;

// ELEMENTS
const screens = {
  start: document.getElementById("startScreen"),
  game: document.getElementById("gameScreen"),
  end: document.getElementById("endScreen")
};

const startBtn = document.getElementById("startBtn");
const scanBtn = document.getElementById("scanBtn");
const progressBar = document.getElementById("progressBar");
const stampsContainer = document.getElementById("stamps");

// INIT STAMPS GRID
function createStamps() {
  stampsContainer.innerHTML = "";
  for (let i = 0; i < TOTAL_STAMPS; i++) {
    const div = document.createElement("div");
    div.classList.add("stamp");
    stampsContainer.appendChild(div);
  }
}

// UPDATE UI
function updateUI() {
  const stampElements = document.querySelectorAll(".stamp");

  stampElements.forEach((el, index) => {
    if (index < stamps) {
      el.classList.add("filled");
    } else {
      el.classList.remove("filled");
    }
  });

  const percent = (stamps / TOTAL_STAMPS) * 100;
  progressBar.style.width = percent + "%";
}

// SCREEN SWITCH
function showScreen(screenName) {
  Object.values(screens).forEach(screen => {
    screen.classList.remove("active");
  });
  screens[screenName].classList.add("active");
}

// START GAME
startBtn.addEventListener("click", () => {
  stamps = 0;
  createStamps();
  updateUI();
  showScreen("game");
});

// SIMULATED QR SCAN
scanBtn.addEventListener("click", () => {
  if (stamps >= TOTAL_STAMPS) return;

  stamps++;
  updateUI();

  if (stamps === TOTAL_STAMPS) {
    triggerCompletion();
  }
});

// COMPLETION FLOW
function triggerCompletion() {
  showScreen("end");

  // AUTO RESET AFTER CELEBRATION
  setTimeout(() => {
    resetGame();
  }, 4000);
}

// RESET GAME
function resetGame() {
  stamps = 0;
  createStamps();
  updateUI();
  showScreen("start");
}

// INIT
createStamps();
updateUI();
showScreen("start");
