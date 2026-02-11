const video = document.getElementById("webcam");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const match = document.querySelector(".match");
const cakeArea = document.querySelector(".cake-area");
const cakeImg = document.querySelector(".cake");

const INITIAL_MATCH_POSITION = {
  x: 250,
  y: 120,
};

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const WEBCAM_WIDTH = isMobile ? 240 : 300;
const WEBCAM_HEIGHT = isMobile ? 180 : 225;
const BLOW_THRESHOLD = 70;
const LIGHT_DISTANCE = 20;

canvas.width = WEBCAM_WIDTH;
canvas.height = WEBCAM_HEIGHT;

let handPosition = { x: 0.5, y: 0.5 };
let isHandDetected = false;

let isCakeLit = false;
let isCandlesBlownOut = false;

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  },
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: isMobile ? 0 : 1,
  minDetectionConfidence: isMobile ? 0.6 : 0.7,
  minTrackingConfidence: isMobile ? 0.4 : 0.5,
});

// Hand tracking
hands.onResults((results) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(results.image, -canvas.width, 0, canvas.width, canvas.height);
  ctx.restore();

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    isHandDetected = true;

    const indexTip = landmarks[8];
    handPosition.x = 1 - indexTip.x;
    handPosition.y = indexTip.y;

    updateMatchPosition();
    checkCandleLighting();
  } else {
    isHandDetected = false;
  }
});

function setInitialMatchPosition() {
  match.style.left = `${INITIAL_MATCH_POSITION.x}px`;
  match.style.top = `${INITIAL_MATCH_POSITION.y}px`;
}

function updateMatchPosition() {
  if (!isHandDetected) return;

  const cakeRect = cakeArea.getBoundingClientRect();
  const padding = 20;
  const matchX = padding + handPosition.x * (cakeRect.width - padding * 2 - 40);
  const matchY = padding + handPosition.y * (cakeRect.height - padding * 2 - 60);

  match.style.left = `${matchX}px`;
  match.style.top = `${matchY}px`;
}

function checkCandleLighting() {
  if (isCakeLit || isCandlesBlownOut) return;

  const matchRect = match.getBoundingClientRect();
  const cakeRect = cakeImg.getBoundingClientRect();

  const matchTipX = matchRect.left + matchRect.width / 2;
  const matchTipY = matchRect.top;
  const candleX = cakeRect.left + cakeRect.width / 2;
  const candleY = cakeRect.top + 10;

  const distance = Math.sqrt(
    Math.pow(matchTipX - candleX, 2) + Math.pow(matchTipY - candleY, 2)
  );

  if (distance < LIGHT_DISTANCE) {
    lightCake();
  }
}

function lightCake() {
  if (isCakeLit) return;
  isCakeLit = true;
  cakeImg.src = "assets/cake_lit.gif";
  match.style.display = "none";
}

function blowOutCandles() {
  if (!isCakeLit || isCandlesBlownOut) return;
  isCandlesBlownOut = true;
  cakeImg.src = "assets/cake_unlit.gif";
  createConfetti();
}

function launchSideBursts() {
  const colors = ["#ff6f91", "#ffc75f", "#845ec2", "#4d96ff", "#00c9a7"];
  const duration = 2500;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 70,
      startVelocity: 35,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 70,
      startVelocity: 35,
      origin: { x: 1 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

function launchTopConfetti() {
  const palette = ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93", "#f72585"];
  const pieces = 22;

  for (let i = 0; i < pieces; i++) {
    setTimeout(() => {
      confetti({
        particleCount: 1,
        startVelocity: 14 + Math.random() * 20,
        gravity: 0.45 + Math.random() * 0.15,
        ticks: 650 + Math.random() * 200,
        scalar: 1.1 + Math.random() * 0.4,
        angle: 80 + Math.random() * 20,
        origin: { x: Math.random(), y: Math.random() * -0.6 },
        colors: [palette[Math.floor(Math.random() * palette.length)]],
      });
    }, Math.random() * 1000);
  }
}

function createConfetti() {
  launchSideBursts();
  launchTopConfetti();
  setTimeout(() => beginQuietEnding(), 1000);
}

function beginQuietEnding() {
  // Create the overlay container
  const endingScreen = document.createElement('div');
  endingScreen.className = 'quiet-ending';

 
  endingScreen.innerHTML = `
    <div class="cinematic-overlay"></div>
    <div class="film-projector-beam"></div>
    <div class="film-title-overlay">Happy birthday, My sweet Boy!</div>
  `;

  document.body.appendChild(endingScreen);

  createFireflies(endingScreen);

  requestAnimationFrame(() => {
    endingScreen.style.display = 'flex';
    requestAnimationFrame(() => {
      endingScreen.style.opacity = '1';
      document.querySelector('.film-title-overlay').style.opacity = '1';
      setTimeout(startPersonalFilmReel, 1500);
    });
  });
}

function createFireflies(container) {
  for (let i = 0; i < 20; i++) {
    const firefly = document.createElement('div');
    firefly.className = 'firefly';
    firefly.style.left = Math.random() * 100 + '%';
    firefly.style.top = Math.random() * 100 + '%';
    firefly.style.animationDelay = Math.random() * 5 + 's';
    firefly.style.animationDuration = (Math.random() * 3 + 4) + 's';
    container.appendChild(firefly);
  }
}

function startPersonalFilmReel() {
  const filmContainer = document.createElement('div');
  filmContainer.className = 'film-reel-container';

  const ourMoments = [
    { type: 'image', src: 'assets/1.png', caption: 'looked like a cute puppy!', Overall: '100/10' },
    { type: 'image', src: 'assets/2.png', caption: 'Prettiest baby ((', Overall: '100/10' },
    { type: 'image', src: 'assets/7.jpeg', caption: 'Sleepy unc(beauty)', Overall: '10/10'},
    { type: 'image', src: 'assets/4.png', caption: 'Us', Overall: '11/10' },
    { type: 'image', src: 'assets/5.png', caption: 'Very my type😋', Overall: '100/10' },
    { type: 'image', src: 'assets/6.jpeg', caption: 'My favourite picture of you', Overall: '1000/10' },
  ];

  const filmStrip = document.createElement('div');
  filmStrip.className = 'film-strip';

  ourMoments.forEach((moment, index) => {
    const frame = document.createElement('div');
    frame.className = 'film-frame';

    const frameContent = document.createElement('div');
    frameContent.className = 'frame-content';

    let mediaEl;
    if (moment.type === 'video') {
      mediaEl = document.createElement('video');
      mediaEl.src = moment.src;
      mediaEl.muted = true;
      mediaEl.loop = true;
      mediaEl.autoplay = true;
      mediaEl.playsInline = true;
    } else {
      mediaEl = document.createElement('img');
      mediaEl.src = moment.src;
      if (moment.src === 'assets/5.png') {
        mediaEl.style.objectPosition = '50% 20%';
      }
      if (moment.src === 'assets/6.jpeg') {
        mediaEl.style.objectPosition = '50% 22%';
      }
      if (moment.src === 'assets/7.jpeg') {
        mediaEl.style.objectPosition = '50% 20%';
      }
    }

    mediaEl.loading = 'lazy';
    mediaEl.onerror = () => {
      if (moment.type !== 'video') mediaEl.src = 'https://placehold.co/400x300?text=Pending+Memory';
    };

    frameContent.appendChild(mediaEl);

    const caption = document.createElement('div');
    caption.className = 'film-caption';
    caption.innerHTML = `
      <span class="caption-text">${moment.caption}</span>
      <span class="frame-number">${moment.Overall}</span>
    `;

    frameContent.appendChild(caption);
    frame.appendChild(frameContent);
    filmStrip.appendChild(frame);
  });

  const frames = Array.from(filmStrip.children);

  frames.forEach(frame => {
    filmStrip.appendChild(frame.cloneNode(true));
  });

  filmContainer.appendChild(filmStrip);
  const endingScreen = document.querySelector('.quiet-ending');
  if (endingScreen) {
    endingScreen.appendChild(filmContainer);
    filmContainer.style.opacity = '0';
    filmContainer.style.transform = 'scale(0.9)';

 
    const songSrc = 'assets/audio.mp3';
    const reelAudio = document.createElement('audio');
    reelAudio.src = songSrc;
    reelAudio.preload = 'auto';
    reelAudio.loop = false;
    reelAudio.volume = 0.75;
    reelAudio.style.display = 'none';
    endingScreen.appendChild(reelAudio);
    reelAudio.onerror = () => console.warn('Reel audio not found:', songSrc);

    setTimeout(() => {
      filmContainer.style.opacity = '1';
      filmContainer.style.transform = 'scale(1)';
      filmContainer.style.transition = 'all 1.5s cubic-bezier(0.23, 1, 0.32, 1)';

      const playPromise = reelAudio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch((err) => console.warn('Autoplay blocked for reel audio', err));
      }

      const fixedDurationMs = 30000;

      requestAnimationFrame(() => {
        const singleCycleWidth = (filmStrip.scrollWidth || filmStrip.offsetWidth) / 2 || 1;
        const speedPxPerSecond = singleCycleWidth / (fixedDurationMs / 1000);

        animateFilmReel(filmStrip, speedPxPerSecond);

        setTimeout(() => endFilmSequence(endingScreen, filmContainer, reelAudio), fixedDurationMs);
      });
    }, 500);
  }

}

function animateFilmReel(filmStrip, speedPxPerSecond = 60) {
  let position = 0;
  let isPaused = false;
  const singleCycleWidth = (filmStrip.scrollWidth || filmStrip.offsetWidth) / 2 || 1;

  filmStrip.addEventListener('mouseenter', () => isPaused = true);
  filmStrip.addEventListener('mouseleave', () => isPaused = false);

  let lastTime = null;
  function frame(time) {
    if (!lastTime) lastTime = time;
    const delta = time - lastTime;
    lastTime = time;

    if (!isPaused) {
      position -= speedPxPerSecond * (delta / 1000);
      if (position <= -singleCycleWidth) {
        position = 0;
      }
      filmStrip.style.transform = `translateX(${position}px)`;
    }
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function endFilmSequence(container, filmContainer, reelAudio) {
  try {
    if (reelAudio) {
      reelAudio.pause();
      reelAudio.currentTime = 0;
      if (reelAudio.parentNode) reelAudio.parentNode.removeChild(reelAudio);
    }
  } catch (e) {
    console.warn('Error stopping reel audio', e);
  }

  if (filmContainer) {
    filmContainer.style.opacity = '0';
    filmContainer.style.transition = 'opacity 2s ease-out';
    setTimeout(() => filmContainer.remove(), 2000);
  }

  const title = document.querySelector('.film-title-overlay');
  if (title) title.style.opacity = '0';

  const letterContainer = document.createElement('div');
  letterContainer.className = 'letter-container';

  letterContainer.innerHTML = `
    <div class="letter-paper">
      <h1 class="letter-header">Happy birthday</h1>
      <div class="letter-content">
        <p class="letter-body">
Happyyy birthdayyy my most adorable babieee,I hope you get all the besttt things in the world cause you deserve to, I'm so proud of you for everything!
You mean everything to me, and I am forever grateful for your presence in my life. Even Though i won't be able to wish you in person (i'm very sad about it) but that shouldn't stop from making your day a lil bit better(?). You've been Handling a lot of heavy stuff lately, yoou're so so strong, and again im so so so proud of my sweet boy.
Love ya <3
        </p>
        <p class="letter-signoff">
          ~ ♥
        </p>
      </div>
    </div>
  `;

  container.appendChild(letterContainer);

  setTimeout(() => {
    letterContainer.style.display = 'flex';
    requestAnimationFrame(() => {
      letterContainer.style.opacity = '1';
    });
  }, 1000);
}

let audioContext = null;
let analyser = null;
let microphone = null;
let isBlowDetectionActive = false;

function preloadReelImages() {
  const reelImages = [
    'assets/1.png',
    'assets/2.png',
    'assets/4.png',
    'assets/5.png',
    'assets/6.jpeg',
    'assets/7.jpeg'
  ];
  
  reelImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}

async function initBlowDetection() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);
    analyser.fftSize = 256;
    microphone.connect(analyser);
    isBlowDetectionActive = true;
    detectBlow();
  } catch (err) {
    console.error("Error accessing microphone:", err);
  }
}

function detectBlow() {
  if (!isBlowDetectionActive) return;
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);
  const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
  if (volume > BLOW_THRESHOLD && isCakeLit && !isCandlesBlownOut) {
    blowOutCandles();
  }
  requestAnimationFrame(detectBlow);
}

async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: WEBCAM_WIDTH, height: WEBCAM_HEIGHT, facingMode: "user" }
    });
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play();
      startHandTracking();
    };
  } catch (err) {
    console.error("Error accessing webcam:", err);
    alert("Could not access webcam. Please allow camera permissions.");
  }
}

function startHandTracking() {
  const camera = new Camera(video, {
    onFrame: async () => await hands.send({ image: video }),
    width: WEBCAM_WIDTH,
    height: WEBCAM_HEIGHT,
  });
  camera.start();
}

window.addEventListener("DOMContentLoaded", () => {
  preloadReelImages(); // Start loading images early
  setInitialMatchPosition();
  initCamera();
  if (isMobile) {
    document.body.addEventListener("click", () => {
      if (!audioContext) initBlowDetection();
    }, { once: true });
  } else {
    initBlowDetection();
  }
});