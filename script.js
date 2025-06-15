const WORDS = [
  "apple", "grape", "peach", "mango", "lemon", "berry", "melon", "charm", "crane", "flame"
];
let DICTIONARY = [];
let ANSWER = null;
let WORD_LENGTH = 5;
let MAX_TRIES = 6;

let currentRow = 0;
let currentCol = 0;
let guesses = Array.from({ length: MAX_TRIES }, () => Array(WORD_LENGTH).fill(""));
let gameOver = false;

let timer = null;
let timeLeft = 0;
let totalTime = 0;
let timerDiv = null;
let score = 0;

let selectedTime = 0;
let selectedLength = 5;
let gameStarted = false;

const gameDiv = document.getElementById("game");
const keyboardDiv = document.getElementById("keyboard");

function createBoard() {
  gameDiv.innerHTML = "";
  gameDiv.style.gridTemplateRows = `repeat(${MAX_TRIES}, 1fr)`;
  for (let r = 0; r < MAX_TRIES; r++) {
    const row = document.createElement("div");
    row.className = "row";
    row.style.gridTemplateColumns = `repeat(${WORD_LENGTH}, 1fr)`;
    for (let c = 0; c < WORD_LENGTH; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.id = `cell-${r}-${c}`;
      row.appendChild(cell);
    }
    gameDiv.appendChild(row);
  }
  // Adjust terminal frame min-width for different word lengths
  const terminal = document.getElementById('terminal-frame');
  if (WORD_LENGTH === 4) terminal.style.minWidth = '270px';
  else if (WORD_LENGTH === 5) terminal.style.minWidth = '350px';
  else if (WORD_LENGTH === 6) terminal.style.minWidth = '420px';
}

function createKeyboard() {
  const keys = [
    ["q","w","e","r","t","y","u","i","o","p"],
    ["a","s","d","f","g","h","j","k","l"],
    ["Enter","z","x","c","v","b","n","m","Backspace"]
  ];
  keyboardDiv.innerHTML = "";
  keys.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "keyboard-row";
    row.forEach(key => {
      const btn = document.createElement("button");
      btn.className = "key";
      btn.textContent = key.length === 1 ? key.toUpperCase() : key;
      btn.onclick = () => handleKey(key);
      rowDiv.appendChild(btn);
    });
    keyboardDiv.appendChild(rowDiv);
  });
}

function createGameOptions() {
  const terminal = document.getElementById('terminal-frame');
  let optionsDiv = document.getElementById('game-options');
  if (optionsDiv) optionsDiv.remove();
  optionsDiv = document.createElement('div');
  optionsDiv.id = 'game-options';
  optionsDiv.style.display = 'flex';
  optionsDiv.style.justifyContent = 'center';
  optionsDiv.style.gap = '18px';
  optionsDiv.style.marginBottom = '18px';

  // Letter count selector
  const letterDiv = document.createElement('div');
  letterDiv.style.display = 'flex';
  letterDiv.style.gap = '6px';
  [4, 5, 6].forEach(len => {
    const btn = document.createElement('button');
    btn.textContent = `${len}-Letter`;
    btn.className = 'key';
    btn.onclick = () => {
      selectedLength = len;
      highlightSelected('letter', len);
    };
    btn.dataset.type = 'letter';
    btn.dataset.value = len;
    letterDiv.appendChild(btn);
  });
  optionsDiv.appendChild(letterDiv);

  // Time selector
  const timeDiv = document.createElement('div');
  timeDiv.style.display = 'flex';
  timeDiv.style.gap = '6px';
  [15, 30, 60, 120].forEach(sec => {
    const btn = document.createElement('button');
    btn.textContent = `${sec}s`;
    btn.className = 'key';
    btn.onclick = () => {
      selectedTime = sec;
      highlightSelected('time', sec);
    };
    btn.dataset.type = 'time';
    btn.dataset.value = sec;
    timeDiv.appendChild(btn);
  });
  optionsDiv.appendChild(timeDiv);

  // Start button
  const startBtn = document.createElement('button');
  startBtn.textContent = 'START';
  startBtn.className = 'key';
  startBtn.style.fontWeight = 'bold';
  startBtn.onclick = () => {
    if (!selectedTime || !selectedLength) {
      showTerminalMessage('SELECT TIME AND LETTER COUNT', 'error');
      return;
    }
    startGame(selectedLength, selectedTime);
    optionsDiv.style.display = 'none';
  };
  optionsDiv.appendChild(startBtn);

  terminal.prepend(optionsDiv);
  highlightSelected('letter', selectedLength);
  highlightSelected('time', selectedTime);
}

function highlightSelected(type, value) {
  document.querySelectorAll(`#game-options button[data-type='${type}']`).forEach(btn => {
    if (parseInt(btn.dataset.value) === value) {
      btn.style.background = '#33ff33';
      btn.style.color = '#10181a';
    } else {
      btn.style.background = '#10181a';
      btn.style.color = '#33ff33';
    }
  });
}

function startGame(length, seconds) {
  setGameMode(length);
  startTimer(seconds);
  gameStarted = true;
}

function handleKey(key) {
  if (!gameStarted || gameOver) return;
  if (key === "Backspace") {
    if (currentCol > 0) {
      currentCol--;
      guesses[currentRow][currentCol] = "";
      updateBoard();
    }
  } else if (key === "Enter") {
    if (currentCol === WORD_LENGTH) {
      submitGuess();
    }
  } else if (/^[a-zA-Z]$/.test(key) && currentCol < WORD_LENGTH) {
    guesses[currentRow][currentCol] = key.toUpperCase();
    currentCol++;
    updateBoard();
  }
}

document.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === "Backspace" || /^[a-zA-Z]$/.test(e.key)) {
    handleKey(e.key);
  }
});

function updateBoard() {
  for (let c = 0; c < WORD_LENGTH; c++) {
    const cell = document.getElementById(`cell-${currentRow}-${c}`);
    cell.textContent = guesses[currentRow][c];
  }
}

function createTimerOptions() {
  const terminal = document.getElementById('terminal-frame');
  let timerOptions = document.getElementById('timer-options');
  if (timerOptions) timerOptions.remove();
  timerOptions = document.createElement('div');
  timerOptions.id = 'timer-options';
  timerOptions.style.display = 'flex';
  timerOptions.style.justifyContent = 'center';
  timerOptions.style.gap = '12px';
  timerOptions.style.marginBottom = '12px';
  [15, 30, 60, 120].forEach(sec => {
    const btn = document.createElement('button');
    btn.textContent = `${sec}s`;
    btn.className = 'key';
    btn.onclick = () => startTimer(sec);
    timerOptions.appendChild(btn);
  });
  terminal.prepend(timerOptions);
}

function startTimer(seconds) {
  if (timer) clearInterval(timer);
  timeLeft = seconds;
  totalTime = seconds;
  updateTimerDisplay();
  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timer);
      timer = null;
      showTerminalMessage('ACCESS DENIED\nTIME EXPIRED', 'error');
      gameOver = true;
    }
  }, 1000);
}

function updateTimerDisplay() {
  if (!timerDiv) {
    timerDiv = document.createElement('div');
    timerDiv.id = 'timer';
    timerDiv.style.textAlign = 'center';
    timerDiv.style.fontFamily = 'inherit';
    timerDiv.style.fontSize = '1.1rem';
    timerDiv.style.marginBottom = '10px';
    const terminal = document.getElementById('terminal-frame');
    terminal.prepend(timerDiv);
  }
  timerDiv.textContent = `TIMER: ${timeLeft}s`;

  // Color transition logic
  const percent = totalTime ? timeLeft / totalTime : 1;
  const terminal = document.getElementById('terminal-frame');
  const matrix = document.getElementById('matrix-bg');
  const title = document.getElementById('title');
  if (percent <= 0.25) {
    terminal.classList.remove('yellow');
    terminal.classList.add('red');
    matrix.classList.remove('yellow');
    matrix.classList.add('red');
    timerDiv.classList.remove('yellow');
    timerDiv.classList.add('red');
    title.classList.remove('yellow');
    title.classList.add('red');
  } else if (percent <= 0.5) {
    terminal.classList.remove('red');
    terminal.classList.add('yellow');
    matrix.classList.remove('red');
    matrix.classList.add('yellow');
    timerDiv.classList.remove('red');
    timerDiv.classList.add('yellow');
    title.classList.remove('red');
    title.classList.add('yellow');
  } else {
    terminal.classList.remove('yellow', 'red');
    matrix.classList.remove('yellow', 'red');
    timerDiv.classList.remove('yellow', 'red');
    title.classList.remove('yellow', 'red');
  }
}

// Matrix effect color change
(function patchMatrixColor() {
  const origDrawMatrix = window.drawMatrix;
  window.drawMatrix = function() {
    const matrix = document.getElementById('matrix-bg');
    let color = '#33ff33';
    if (matrix.classList.contains('red')) color = '#ff3333';
    else if (matrix.classList.contains('yellow')) color = '#b7ff33';
    ctx.fillStyle = 'rgba(16,24,26,0.15)';
    ctx.fillRect(0, 0, width, height);
    ctx.font = fontSize + 'px Fira Mono, Consolas, Courier New, monospace';
    ctx.fillStyle = color;
    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
      if (drops[i] * fontSize > height) drops[i] = 0;
    }
  };
})();

function resetTimerDisplay() {
  if (timerDiv) timerDiv.textContent = '';
}

function setGameMode(length) {
  WORD_LENGTH = length;
  guesses = Array.from({ length: MAX_TRIES }, () => Array(WORD_LENGTH).fill("") );
  currentRow = 0;
  currentCol = 0;
  gameOver = false;
  score = 0;
  if (timer) clearInterval(timer);
  resetTimerDisplay();
  // Filter dictionary for the selected word length
  const filtered = DICTIONARY.filter(w => w.length === WORD_LENGTH);
  if (filtered.length === 0) {
    alert(`No valid ${WORD_LENGTH}-letter words found in words.txt!`);
    return;
  }
  ANSWER = filtered[Math.floor(Math.random() * filtered.length)];
  createBoard();
  createKeyboard();
}

fetch('words.txt')
  .then(res => res.text())
  .then(text => {
    DICTIONARY = text.split(/\r?\n/)
      .map(w => w.trim().toUpperCase())
      .filter(w => /^[A-Z]+$/.test(w));
    setGameMode(5); // Default to 5-letter mode
  })
  .catch(() => {
    alert('Failed to load words.txt. Make sure it exists and is accessible.');
  });

function showTerminalMessage(message, type = "info") {
  let msgDiv = document.getElementById('terminal-message');
  if (!msgDiv) {
    msgDiv = document.createElement('div');
    msgDiv.id = 'terminal-message';
    msgDiv.style.margin = '18px 0 0 0';
    msgDiv.style.textAlign = 'center';
    msgDiv.style.fontFamily = 'inherit';
    msgDiv.style.fontSize = '1.2rem';
    msgDiv.style.letterSpacing = '0.1em';
    msgDiv.style.transition = 'opacity 0.3s';
    const terminal = document.getElementById('terminal-frame');
    terminal.appendChild(msgDiv);
  }
  msgDiv.textContent = message;
  msgDiv.style.opacity = 1;
  if (type === 'error') {
    msgDiv.style.color = '#ff3333';
    msgDiv.style.textShadow = '0 0 8px #ff3333, 0 0 2px #fff';
  } else if (type === 'success') {
    msgDiv.style.color = '#33ff33';
    msgDiv.style.textShadow = '0 0 12px #33ff33, 0 0 2px #fff';
  } else {
    msgDiv.style.color = '#33ff33';
    msgDiv.style.textShadow = '0 0 8px #33ff33, 0 0 2px #fff';
  }
  setTimeout(() => { msgDiv.style.opacity = 0; }, 2500);
}

function endGame(win) {
  if (timer) clearInterval(timer);
  let unusedAttempts = MAX_TRIES - currentRow - (win ? 1 : 0);
  let timeBonus = Math.floor((timeLeft / totalTime) * 10);
  score = Math.max(0, unusedAttempts) + timeBonus;
  if (win) {
    showTerminalMessage(`ACCESS GRANTED\nSCORE: ${score}`, 'success');
    if (score > 10) {
      setTimeout(() => showTerminalMessage('CRITICAL SERVER FAILURE', 'error'), 2500);
    }
  } else {
    showTerminalMessage(`ACCESS DENIED\nPASSWORD WAS: ${ANSWER}\nSCORE: ${score}`, 'error');
    if (score > 10) {
      setTimeout(() => showTerminalMessage('CRITICAL SERVER FAILURE', 'error'), 2500);
    }
  }
  gameOver = true;
}

function submitGuess() {
  const guess = guesses[currentRow].join("");
  if (guess.length !== WORD_LENGTH) return;
  if (!DICTIONARY.filter(w => w.length === WORD_LENGTH).includes(guess.toUpperCase())) {
    showTerminalMessage("INVALID ENTRY: NOT IN WORD LIST", "error");
    return;
  }
  colorRow(guess);
  if (guess === ANSWER) {
    endGame(true);
    return;
  }
  currentRow++;
  currentCol = 0;
  if (currentRow === MAX_TRIES) {
    endGame(false);
  }
}

function colorRow(guess) {
  const answerArr = ANSWER.split("");
  const guessArr = guess.split("");
  const cellColors = Array(WORD_LENGTH).fill("gray");
  const answerLetterCount = {};
  // First pass: green
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessArr[i] === answerArr[i]) {
      cellColors[i] = "green";
      answerArr[i] = null;
    } else {
      answerLetterCount[answerArr[i]] = (answerLetterCount[answerArr[i]] || 0) + 1;
    }
  }
  // Second pass: yellow
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (cellColors[i] === "green") continue;
    if (answerLetterCount[guessArr[i]]) {
      cellColors[i] = "yellow";
      answerLetterCount[guessArr[i]]--;
    }
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    const cell = document.getElementById(`cell-${currentRow}-${i}`);
    cell.classList.add(cellColors[i]);
    updateKeyboardColor(guessArr[i], cellColors[i]);
  }
}

function updateKeyboardColor(letter, color) {
  const keys = document.querySelectorAll(".key");
  keys.forEach(key => {
    if (key.textContent === letter) {
      if (!key.classList.contains("green")) {
        if (color === "green" || (color === "yellow" && !key.classList.contains("yellow"))) {
          key.className = `key ${color}`;
        } else if (color === "gray" && !key.classList.contains("yellow") && !key.classList.contains("green")) {
          key.className = `key gray`;
        }
      }
    }
  });
}

// Add game mode buttons
window.addEventListener('DOMContentLoaded', () => {
  createGameOptions();
});

createBoard();
createKeyboard();
