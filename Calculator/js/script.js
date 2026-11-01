
/* =================================
   NEXORA CALC - COMPLETE JAVASCRIPT
================================= */

// DISPLAY ELEMENTS
const display = document.getElementById('display');
const previous = document.getElementById('previous');

// CALCULATOR VARIABLES
let current = '0';
let stored = null;
let operator = null;
let shouldReset = false;

// =================================
// SOUND EFFECTS
// =================================

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency = 600, duration = 0.06, type = 'sine') {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  gain.gain.setValueAtTime(0.07, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + duration
  );

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

// =================================
// DISPLAY
// =================================

function render() {
  display.textContent = current;
}

// =================================
// NUMBER INPUT
// =================================

function enterNumber(number) {
  if (shouldReset || current === 'Error') {
    current = number;
    shouldReset = false;
  } else {
    current = current === '0' ? number : current + number;
  }

  render();
}

// =================================
// OPERATORS
// =================================

function chooseOperator(nextOperator) {
  if (current === 'Error') return;

  if (operator && !shouldReset) {
    calculate();
  }

  stored = Number(current);
  operator = nextOperator;

  previous.textContent = `${stored} ${operator}`;
  shouldReset = true;
}

// =================================
// CALCULATE
// =================================

function calculate() {
  if (operator === null || stored === null) return;

  const a = stored;
  const b = Number(current);
  let result;

  switch (operator) {
    case '+':
      result = a + b;
      break;

    case '−':
      result = a - b;
      break;

    case '×':
      result = a * b;
      break;

    case '÷':
      if (b === 0) {
        current = 'Error';
        previous.textContent = 'Cannot divide by zero';

        stored = null;
        operator = null;
        shouldReset = true;

        render();
        return;
      }

      result = a / b;
      break;

    default:
      return;
  }

  const expression = `${formatNumber(a)} ${operator} ${formatNumber(b)}`;

  current = String(Number(result.toPrecision(12)));

  addToHistory(`${expression} = ${formatNumber(current)}`);

  previous.textContent = `${expression} =`;

  stored = null;
  operator = null;
  shouldReset = true;

  render();
}

// =================================
// NUMBER FORMATTING
// =================================

function formatNumber(value) {
  return Number(value).toLocaleString('en-US', {
    maximumFractionDigits: 10
  });
}

// =================================
// CLEAR ALL
// =================================

function clearAll() {
  current = '0';
  stored = null;
  operator = null;
  shouldReset = false;

  previous.textContent = '';

  render();
}

// =================================
// OTHER BUTTON ACTIONS
// =================================

function performAction(action) {
  switch (action) {

    case 'clear':
      clearAll();
      break;

    case 'delete':
      if (current !== 'Error') {
        current = current.length > 1
          ? current.slice(0, -1)
          : '0';
      }

      render();
      break;

    case 'decimal':
      if (shouldReset || current === 'Error') {
        current = '0.';
        shouldReset = false;
      } else if (!current.includes('.')) {
        current += '.';
      }

      render();
      break;

    case 'sign':
      if (current !== '0' && current !== 'Error') {
        current = String(-Number(current));
      }

      render();
      break;

    case 'percent':
      if (current !== 'Error') {
        current = String(Number(current) / 100);
      }

      render();
      break;

    case 'equals':
      calculate();
      break;
  }
}

// =================================
// BUTTON CLICK EVENTS + SOUNDS
// =================================

document.querySelector('.keys').addEventListener('click', (event) => {

  const button = event.target.closest('button');

  if (!button) return;

  // Play sound
  if (button.dataset.number !== undefined) {
    playSound(500, 0.05);
  } else if (button.dataset.operator) {
    playSound(750, 0.08);
  } else if (button.dataset.action === 'equals') {
    playSound(950, 0.15);
  } else {
    playSound(350, 0.07);
  }

  // Perform button action
  if (button.dataset.number !== undefined) {
    enterNumber(button.dataset.number);

  } else if (button.dataset.operator) {
    chooseOperator(button.dataset.operator);

  } else if (button.dataset.action) {
    performAction(button.dataset.action);
  }
});

// =================================
// KEYBOARD SUPPORT
// =================================

document.addEventListener('keydown', (event) => {

  if (/^[0-9]$/.test(event.key)) {
    playSound(500, 0.05);
    enterNumber(event.key);

  } else if (event.key === '.') {
    performAction('decimal');

  } else if (event.key === '+') {
    chooseOperator('+');

  } else if (event.key === '-') {
    chooseOperator('−');

  } else if (event.key === '*') {
    chooseOperator('×');

  } else if (event.key === '/') {
    event.preventDefault();
    chooseOperator('÷');

  } else if (event.key === 'Enter' || event.key === '=') {
    playSound(950, 0.15);
    performAction('equals');

  } else if (event.key === 'Backspace') {
    performAction('delete');

  } else if (event.key === 'Escape') {
    clearAll();
  }
});

// =================================
// CALCULATION HISTORY
// =================================

const historyToggle = document.getElementById('historyToggle');
const historyPanel = document.getElementById('historyPanel');
const historyList = document.getElementById('historyList');
const clearHistory = document.getElementById('clearHistory');

let calculationHistory = [];

try {
  calculationHistory = JSON.parse(
    localStorage.getItem('calculatorHistory') || '[]'
  );

  if (!Array.isArray(calculationHistory)) {
    calculationHistory = [];
  }

} catch {
  calculationHistory = [];
}

// ADD HISTORY
function addToHistory(calculation) {

  calculationHistory.unshift(calculation);

  // Keep only the latest 50 calculations
  calculationHistory = calculationHistory.slice(0, 50);

  localStorage.setItem(
    'calculatorHistory',
    JSON.stringify(calculationHistory)
  );

  showHistory();
}

// DISPLAY HISTORY
function showHistory() {

  historyList.innerHTML = '';

  if (calculationHistory.length === 0) {
    historyList.innerHTML = '<p>No calculations yet.</p>';
    return;
  }

  calculationHistory.forEach(item => {

    const entry = document.createElement('div');

    entry.className = 'history-item';
    entry.textContent = item;

    historyList.appendChild(entry);
  });
}

// OPEN AND CLOSE HISTORY
historyToggle.addEventListener('click', () => {

  historyPanel.hidden = !historyPanel.hidden;

  playSound(650, 0.06);

  showHistory();
});

// CLEAR HISTORY
clearHistory.addEventListener('click', () => {

  calculationHistory = [];

  localStorage.removeItem('calculatorHistory');

  playSound(400, 0.08);

  showHistory();
});

// LOAD SAVED HISTORY
showHistory();

// INITIAL DISPLAY
render();
// =================================
// DARK / LIGHT MODE
// =================================

const themeToggle = document.getElementById('themeToggle');

// Load saved theme
let savedTheme = localStorage.getItem('calculatorTheme') || 'dark';

function applyTheme(theme) {
  document.body.classList.toggle('light-theme', theme === 'light');

  themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';

  localStorage.setItem('calculatorTheme', theme);
}

// Apply theme when calculator opens
applyTheme(savedTheme);

// Switch theme when clicked
themeToggle.addEventListener('click', () => {
  savedTheme = savedTheme === 'dark' ? 'light' : 'dark';

  applyTheme(savedTheme);
  playSound(700, 0.08);
});