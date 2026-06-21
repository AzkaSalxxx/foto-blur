const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("status");
const startBtn = document.getElementById("startBtn");

let peaceDetected = false;

function fingerUp(tip, pip, landmarks) {
  return landmarks[tip].y < landmarks[pip].y;
}

function isPeace(landmarks) {
  const indexUp = fingerUp(8, 6, landmarks);
  const middleUp = fingerUp(12, 10, landmarks);
  const ringUp = fingerUp(16, 14, landmarks);
  const pinkyUp = fingerUp(20, 18, landmarks);

  return indexUp && middleUp && !ringUp && !pinkyUp;
}

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  },
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

hands.onResults((results) => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  peaceDetected = false;

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];

    if (isPeace(landmarks)) {
      peaceDetected = true;
    }
  }

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);

  if (peaceDetected) {
    ctx.filter = "blur(18px)";
    statusText.textContent = "Peace terdeteksi - Blur ON";
    statusText.style.background = "rgba(34, 197, 94, 0.85)";
  } else {
    ctx.filter = "none";
    statusText.textContent = "Tunjukkan gesture ✌️";
    statusText.style.background = "rgba(0, 0, 0, 0.65)";
  }

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.restore();
});

startBtn.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    video.srcObject = stream;

    const camera = new Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video });
      },
      width: 640,
      height: 480,
    });

    camera.start();

    startBtn.style.display = "none";
    statusText.textContent = "Kamera aktif";
  } catch (error) {
    statusText.textContent = "Kamera gagal dibuka";
    console.error(error);
  }
});
