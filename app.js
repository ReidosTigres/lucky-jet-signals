// Инициализация Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) tg.expand();

// Элементы UI
const mainMenu = document.getElementById('main-menu');
const gameScreen = document.getElementById('game-screen');
const btnStart = document.getElementById('btn-start');
const btnBack = document.getElementById('btn-back');
const btnGenerate = document.getElementById('btn-generate');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingText = document.getElementById('loading-text');
const signalCard = document.getElementById('signal-card');
const timerSec = document.getElementById('timer-sec');
const precisionVal = document.getElementById('precision-val');

// Canvas Настройки
const canvas = document.getElementById('jetCanvas');
const ctx = canvas.getContext('2d');

let sammyImg = new Image();
sammyImg.src = 'assets/sammy.png';

let animationFrameId;
let timerInterval;

let currentMultiplier = 1.00;
let targetMultiplier = 1.00;
let isFlying = false;

// Счётчик кликов
let totalSpins = 0;

// Звёзды
const stars = [];

// Вспомогательная функция для получения логической ширины и высоты
function getCanvasSize() {
  const dpr = window.devicePixelRatio || 1;
  return {
    width: canvas.width / dpr,
    height: canvas.height / dpr
  };
}

// Настройка разрешения Canvas под Retina (iPhone)
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();

  // Задаем реальное физическое разрешение Canvas
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // Оставляем визуальный CSS-размер
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  // Масштабируем контекст отрисовки
  ctx.scale(dpr, dpr);

  generateStars();
}

function generateStars() {
  const { width, height } = getCanvasSize();
  stars.length = 0;
  for (let i = 0; i < 20; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * (height - 80),
      size: Math.random() * 3 + 2,
      opacity: Math.random() * 0.7 + 0.3
    });
  }
}

resizeCanvas();

// Переход к графику
btnStart.addEventListener('click', () => {
  mainMenu.classList.remove('active');
  gameScreen.classList.add('active');
  resizeCanvas();
  resetState();
});

// Кнопка назад в главное меню
btnBack.addEventListener('click', () => {
  gameScreen.classList.remove('active');
  mainMenu.classList.add('active');
  resetState();
});

function resetState() {
  clearInterval(timerInterval);
  cancelAnimationFrame(animationFrameId);
  isFlying = false;
  currentMultiplier = 1.00;
  targetMultiplier = 1.00;
  signalCard.classList.add('hidden');
  loadingOverlay.classList.add('hidden');
  btnGenerate.disabled = false;
  drawScene(0, 1.00);
}

function getEndCoords() {
  const { width, height } = getCanvasSize();
  return {
    startX: 10,
    startY: height - 35,
    endX: width - 55,
    endY: 55
  };
}

// Отрисовка звезд
function drawStars() {
  stars.forEach(star => {
    ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
    ctx.beginPath();
    ctx.moveTo(star.x, star.y - star.size);
    ctx.lineTo(star.x + star.size / 1.5, star.y);
    ctx.lineTo(star.x, star.y + star.size);
    ctx.lineTo(star.x - star.size / 1.5, star.y);
    ctx.closePath();
    ctx.fill();
  });
}

// Отрисовка облаков
function drawClouds() {
  const { height } = getCanvasSize();
  ctx.fillStyle = '#18132e';

  ctx.beginPath();
  ctx.arc(-20, height + 10, 65, 0, Math.PI * 2);
  ctx.arc(40, height + 5, 50, 0, Math.PI * 2);
  ctx.arc(100, height + 15, 55, 0, Math.PI * 2);
  ctx.arc(170, height, 60, 0, Math.PI * 2);
  ctx.arc(240, height + 10, 50, 0, Math.PI * 2);
  ctx.arc(310, height + 5, 65, 0, Math.PI * 2);
  ctx.arc(380, height + 15, 55, 0, Math.PI * 2);
  ctx.arc(440, height + 10, 60, 0, Math.PI * 2);
  ctx.fill();
}

// Главная функция отрисовки
function drawScene(progress, multiplier) {
  const { width, height } = getCanvasSize();
  ctx.clearRect(0, 0, width, height);

  drawStars();
  drawClouds();

  const { startX, startY, endX, endY } = getEndCoords();
  const t = Math.min(Math.max(progress, 0), 1);

  const currentX = startX + (endX - startX) * t;
  const currentY = startY - (startY - endY) * Math.pow(t, 1.8);

  // Полупрозрачная проекция
  if (t > 0) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);

    const steps = 40;
    for (let i = 1; i <= steps; i++) {
      const stepT = (t / steps) * i;
      const stepX = startX + (endX - startX) * stepT;
      const stepY = startY - (startY - endY) * Math.pow(stepT, 1.8);
      ctx.lineTo(stepX, stepY);
    }

    ctx.lineTo(currentX, height);
    ctx.lineTo(startX, height);
    ctx.closePath();

    const fillGradient = ctx.createLinearGradient(0, currentY, 0, height);
    fillGradient.addColorStop(0, 'rgba(139, 92, 246, 0.35)');
    fillGradient.addColorStop(1, 'rgba(139, 92, 246, 0.0)');
    ctx.fillStyle = fillGradient;
    ctx.fill();

    // Неоновая линия
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    for (let i = 1; i <= steps; i++) {
      const stepT = (t / steps) * i;
      const stepX = startX + (endX - startX) * stepT;
      const stepY = startY - (startY - endY) * Math.pow(stepT, 1.8);
      ctx.lineTo(stepX, stepY);
    }
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Значение X слева
  if (isFlying || multiplier > 1.00) {
    ctx.font = '900 42px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
    ctx.shadowBlur = 12;
    ctx.fillText(`x${multiplier.toFixed(2)}`, width * 0.38, height / 2 - 5);
    ctx.shadowBlur = 0;
  }

  // Отрисовка Сэми
  const imgWidth = 46;
  const imgHeight = 46;
  if (sammyImg.complete && sammyImg.naturalWidth !== 0) {
    ctx.drawImage(sammyImg, currentX - imgWidth / 2, currentY - imgHeight / 2, imgWidth, imgHeight);
  } else {
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 10, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Строгий порядок сообщений
const statusMessages = [
  "CONEXÃO AO SERVIDOR...",
  "ANÁLISE DAS RODADAS...",
  "RECEÇÃO DO SINAL..."
];

// Алгоритм вычисления икса
function calculateSmartMultiplier() {
  totalSpins++;
  let result;

  if (totalSpins % 5 === 0) {
    result = 1.10 + Math.random() * 0.89;
    return parseFloat(result.toFixed(2));
  }

  const rand = Math.random();

  if (rand < 0.35) {
    result = 2.00 + Math.random() * 0.99;
  } else if (rand < 0.80) {
    result = 3.00 + Math.random() * 2.00;
  } else if (rand < 0.92) {
    result = 5.01 + Math.random() * 2.99;
  } else {
    result = 8.01 + Math.random() * 3.99;
  }

  return parseFloat(result.toFixed(2));
}

// Генерация точности от 97.0% до 98.5%
function getRandomPrecision() {
  const precision = 97.0 + Math.random() * 1.5;
  return `${precision.toFixed(1)}%`;
}

// Клик по кнопке генерации
btnGenerate.addEventListener('click', () => {
  if (btnGenerate.disabled) return;

  // Легкая вибрация при клике
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred('medium');
  }

  btnGenerate.disabled = true;
  signalCard.classList.add('hidden');
  loadingOverlay.classList.remove('hidden');

  targetMultiplier = calculateSmartMultiplier();

  const durationMs = Math.floor(Math.random() * 1500) + 1500;
  let startTime = null;
  let currentStepIndex = 0;
  
  isFlying = true;
  loadingText.innerText = statusMessages[0];

  function animateJet(timestamp) {
    if (!startTime) startTime = timestamp;
    const runtime = timestamp - startTime;
    const progress = Math.min(runtime / durationMs, 1);

    const stepIndex = Math.min(Math.floor(progress * statusMessages.length), statusMessages.length - 1);
    if (stepIndex !== currentStepIndex) {
      currentStepIndex = stepIndex;
      loadingText.classList.add('fade-out');
      setTimeout(() => {
        loadingText.innerText = statusMessages[currentStepIndex];
        loadingText.classList.remove('fade-out');
      }, 150);
    }

    currentMultiplier = 1.00 + (targetMultiplier - 1.00) * progress;

    drawScene(progress, currentMultiplier);

    if (runtime < durationMs) {
      animationFrameId = requestAnimationFrame(animateJet);
    } else {
      isFlying = false;
      drawScene(1.0, targetMultiplier);
      finishSignalGeneration();
    }
  }

  requestAnimationFrame(animateJet);
});

function finishSignalGeneration() {
  loadingOverlay.classList.add('hidden');
  
  if (precisionVal) {
    precisionVal.innerText = getRandomPrecision();
  }

  signalCard.classList.remove('hidden');

  // Вибрация успеха при появлении сигнала
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.notificationOccurred('success');
  }

  startTimer(15);
}

function startTimer(seconds) {
  clearInterval(timerInterval);
  let left = seconds;
  timerSec.innerText = left;

  timerInterval = setInterval(() => {
    left--;
    timerSec.innerText = left;
    if (left <= 0) {
      clearInterval(timerInterval);
      signalCard.classList.add('hidden');
      drawScene(0, 1.00);
      btnGenerate.disabled = false;
    }
  }, 1000);
}
