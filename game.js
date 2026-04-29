const arena       = document.getElementById('arena');
const overlay     = document.getElementById('overlay');
const overlayTitle= document.getElementById('overlay-title');
const overlayMsg  = document.getElementById('overlay-msg');
const startBtn    = document.getElementById('start-btn');
const scoreEl     = document.getElementById('score');
const timerEl     = document.getElementById('timer');
const highscoreEl = document.getElementById('highscore');

const BALLOONS = ['🎈','🎀','🎊','🎉','💜','🩷','🧡','💛'];
const DURATION  = 30;

let score = 0, timeLeft = 0, highscore = 0;
let gameInterval = null, spawnInterval = null;
let activeTimers = [];

function rand(min, max) { return Math.random() * (max - min) + min; }

function spawnBalloon() {
  const el = document.createElement('div');
  el.className = 'balloon';
  el.textContent = BALLOONS[Math.floor(Math.random() * BALLOONS.length)];

  const size   = rand(36, 60);
  const left   = rand(5, 85);          // % from left
  const dur    = rand(4, 9);           // seconds to float up
  const points = Math.round(10 * (1 - (size - 36) / 24)) * 5 + 5; // smaller = more pts

  el.style.cssText = `
    font-size: ${size}px;
    left: ${left}%;
    animation-duration: ${dur}s;
  `;

  el.addEventListener('click', () => popBalloon(el, points));

  arena.appendChild(el);

  // Remove when it leaves the screen
  const t = setTimeout(() => el.remove(), dur * 1000 + 100);
  activeTimers.push(t);
}

function popBalloon(el, points) {
  if (el.classList.contains('pop')) return;
  el.classList.add('pop');

  score += points;
  scoreEl.textContent = score;

  // Float score text
  const rect  = el.getBoundingClientRect();
  const arenaRect = arena.getBoundingClientRect();
  const span  = document.createElement('div');
  span.className = 'floatScore';
  span.textContent = `+${points}`;
  span.style.left = (rect.left - arenaRect.left + rect.width / 2 - 20) + 'px';
  span.style.top  = (rect.top  - arenaRect.top)  + 'px';
  arena.appendChild(span);

  setTimeout(() => { el.remove(); span.remove(); }, 500);
}

function startGame() {
  // Reset
  score = 0;
  scoreEl.textContent = 0;
  timeLeft = DURATION;
  timerEl.textContent = DURATION;
  timerEl.classList.remove('warn');
  overlay.classList.add('hidden');

  // Clear old balloons
  arena.querySelectorAll('.balloon').forEach(b => b.remove());
  activeTimers.forEach(clearTimeout);
  activeTimers = [];

  // Spawn loop
  spawnBalloon();
  spawnInterval = setInterval(spawnBalloon, 900);

  // Countdown
  gameInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 10) timerEl.classList.add('warn');
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  clearInterval(gameInterval);
  clearInterval(spawnInterval);
  activeTimers.forEach(clearTimeout);
  activeTimers = [];

  // Remove remaining balloons
  arena.querySelectorAll('.balloon').forEach(b => b.remove());

  if (score > highscore) {
    highscore = score;
    highscoreEl.textContent = highscore;
  }

  overlayTitle.textContent = score >= highscore ? '🏆 YENİ REKOR!' : 'SÜRE BİTTİ!';
  overlayMsg.innerHTML = `Skorun: <strong style="color:#ffe94e">${score}</strong> puan<br>En yüksek: ${highscore}`;
  startBtn.textContent = 'TEKRAR OYNA 🎈';
  overlay.classList.remove('hidden');
}

startBtn.addEventListener('click', startGame);
