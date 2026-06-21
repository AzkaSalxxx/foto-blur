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
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.6,
  minTrackingConfidence: 0.6,
});

hands.onResults((results) => {
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;

  peaceDetected = false;

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    peaceDetected = isPeace(landmarks);
  }

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);

  ctx.filter = peaceDetected ? "blur(18px)" : "none";
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  ctx.restore();

  statusText.style.background = peaceDetected ? "#22c55e" : "#ef4444";
});

startBtn.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 1280,
        height: 720,
        facingMode: "user",
      },
      audio: false,
    });

    video.srcObject = stream;

    const camera = new Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video });
      },
      width: 1280,
      height: 720,
    });

    camera.start();

    startBtn.style.display = "none";
    statusText.style.background = "#ef4444";
  } catch (error) {
    statusText.style.background = "#f59e0b";
    console.error(error);
  }
});
