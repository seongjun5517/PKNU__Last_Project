import { useState, useEffect, useRef } from "react";
import {
  deleteLatestPredict,
  getTodayPredict,
  setPredictFlask,
  setPredictSave,
} from "../flaskapi/DeepApi";
import "./Analysis1.css";
import { useAuth } from "../context/AuthContext";
import AnalysisFeedback from "../components/AnalysisFeedback";
import { getOliveYoungSearchUrl } from "../utils/oliveYoung";

// 진단 타입별 코멘트 및 하드코딩 성분 추천 매핑
// 실제 dtype_result 값: bi, acne, ato, normal
const SKIN_TYPE_INFO = {
  acne: {
    label: "여드름성 트러블",
    color: "var(--rose)",
    comment:
      "피부에 여드름성 트러블이 감지되었어요. 자극을 최소화하고 진정 케어를 우선해주세요.",
    ingredients: [
      { name: "티트리", desc: "트러블 부위 진정에 도움" },
      { name: "살리실산(BHA)", desc: "피지와 각질 관리에 도움" },
      { name: "판테놀", desc: "자극받은 피부 보습과 장벽 케어" },
      { name: "나이아신아마이드", desc: "과다 피지와 피부결 관리에 도움" },
      { name: "징크 PCA", desc: "번들거림 완화와 피부 컨디션 관리에 도움" },
    ],
  },
  bi: {
    label: "비립종",
    color: "var(--gold)",
    ingredients: [
      { name: "PHA", desc: "민감 피부도 부담이 적은 각질 케어" },
      { name: "글루코노락톤", desc: "피부결 정돈과 보습 보조" },
      { name: "알란토인", desc: "자극 완화와 진정 케어" },
      { name: "아젤라익애씨드", desc: "피부결과 모공 주변 관리에 도움" },
      { name: "히알루론산", desc: "가벼운 수분 보충으로 건조함 완화에 도움" },
    ],
  },
  ato: {
    label: "아토피성 피부",
    color: "var(--sage)",
    comment:
      "아토피성 건조·자극 반응이 감지되었어요. 저자극 보습 중심의 케어가 필요해요.",
    ingredients: [
      { name: "세라마이드", desc: "약해진 피부 장벽 보강" },
      { name: "시어버터", desc: "건조한 피부의 보습막 형성" },
      { name: "마데카소사이드", desc: "민감 피부 진정 케어" },
      { name: "콜로이달 오트밀", desc: "건조하고 민감한 피부 진정에 도움" },
      { name: "스쿠알란", desc: "피부 수분 보호막 유지에 도움" },
    ],
  },
  normal: {
    label: "양호",
    color: "var(--sage-dark)",
    comment: "전반적으로 양호한 피부 상태예요. 꾸준한 보습과 자외선 차단이 중요해요.",
    ingredients: [
      { name: "히알루론산", desc: "가벼운 수분 충전" },
      { name: "글리세린", desc: "기본 보습 유지" },
      { name: "녹차 추출물", desc: "산뜻한 진정 케어" },
    ],
  },
  default: {
    label: "결과",
    color: "var(--ink-faint)",
    comment: "전반적으로 양호한 피부 상태예요. 꾸준한 보습과 자외선 차단이 중요해요.",
    ingredients: [
      { name: "히알루론산", desc: "수분 공급" },
      { name: "세라마이드", desc: "피부 장벽 케어" },
    ],
  },
};

const DIAGNOSIS_COMMENTS = {
  acne: "피부에 여드름성 트러블이 감지되었어요. 자극을 최소화하고 진정 케어를 우선해주세요.",
  bi: "피부에 비립종으로 보이는 작은 돌기가 감지되었어요. 무리하게 압출하지 말고 부드러운 각질 관리가 필요해요.",
  ato: "피부에 건조함과 민감 반응이 감지되었어요. 보습을 충분히 해주고 자극적인 제품 사용은 피해 주세요.",
  "acne+bi":
    "여드름성 트러블과 비립종이 함께 감지되었어요. 피부 자극을 줄이고 유분 조절과 부드러운 각질 관리를 함께 진행해주세요.",
  "bi+ato":
    "비립종과 민감·건조 반응이 함께 감지되었어요. 강한 각질 제거는 피하고 보습과 장벽 케어를 우선해주세요.",
  "acne+ato":
    "여드름성 트러블과 민감 반응이 함께 감지되었어요. 자극적인 여드름 케어보다는 진정과 보습 중심의 관리가 필요해요.",
  "acne+bi+ato":
    "여드름, 비립종, 민감·건조 반응이 함께 감지되었어요. 피부 장벽이 약해질 수 있으니 진정, 보습, 저자극 관리를 우선해주세요.",
};

const DIAGNOSIS_TYPE_ORDER = ["acne", "bi", "ato"];

const MEDIAPIPE_TASKS_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";
const MEDIAPIPE_WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MEDIAPIPE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

const MASCOT_INFO = {
  acne: {
    label: "아크니",
    image: "/img/mascot-acne.png",
  },
  bi: {
    label: "비리",
    image: "/img/mascot-bi.png",
  },
  ato: {
    label: "아토",
    image: "/img/mascot-ato.png",
  },
};

function getSkinInfo(detections) {
  if (!detections || detections.length === 0) return SKIN_TYPE_INFO.default;
  const top = [...detections].sort((a, b) => b.dtype_cnt - a.dtype_cnt)[0];
  return SKIN_TYPE_INFO[top.dtype_result] || SKIN_TYPE_INFO.default;
}

function getDetectionInfo(type) {
  return SKIN_TYPE_INFO[type] || SKIN_TYPE_INFO.default;
}

function getStatusIngredientRecommendations(detections) {
  const detectedTypes = new Set(
    normalizeDetections(detections)
      .filter((item) => (item.dtype_cnt || 0) > 0)
      .map((item) => item.dtype_result)
  );
  const types = DIAGNOSIS_TYPE_ORDER.filter((type) => detectedTypes.has(type));

  if (types.length === 0) {
    return [{ label: "기본 피부 관리", items: SKIN_TYPE_INFO.normal.ingredients }];
  }

  const itemCount = types.length === 1 ? 5 : 2;
  return types.map((type) => ({
    label: SKIN_TYPE_INFO[type].label,
    items: SKIN_TYPE_INFO[type].ingredients.slice(0, itemCount),
  }));
}

function getDiagnosisComment(detections) {
  const detectedTypes = new Set(
    normalizeDetections(detections)
      .filter((item) => (item.dtype_cnt || 0) > 0)
      .map((item) => item.dtype_result)
  );

  const key = DIAGNOSIS_TYPE_ORDER.filter((type) => detectedTypes.has(type)).join("+");

  if (DIAGNOSIS_COMMENTS[key]) {
    return DIAGNOSIS_COMMENTS[key];
  }

  return getSkinInfo(detections).comment;
}

function getDetectedMascots(detections) {
  const detectionByType = new Map(
    normalizeDetections(detections)
      .filter((item) => (item.dtype_cnt || 0) > 0)
      .map((item) => [item.dtype_result, item])
  );

  return DIAGNOSIS_TYPE_ORDER
    .filter((type) => detectionByType.has(type))
    .map((type) => ({
      type,
      count: detectionByType.get(type)?.dtype_cnt || 0,
      detection: detectionByType.get(type),
      ...MASCOT_INFO[type],
      ...getDetectionInfo(type),
    }));
}

// Flask 서버 주소 (배포 시 실제 서버 주소로 변경)
const FLASK_BASE_URL = "http://localhost:5000";

// detections가 undefined/null로 와도 항상 배열을 반환
function normalizeDetections(detections) {
  return Array.isArray(detections) ? detections : [];
}

function evaluateFaceQuality(landmarks, videoWidth, videoHeight) {
  const LEFT_CHEEK = 234;
  const RIGHT_CHEEK = 454;
  const LEFT_EYE_OUTER = 33;
  const RIGHT_EYE_OUTER = 263;
  const NOSE_TIP = 1;
  const FOREHEAD = 10;
  const CHIN = 152;

  const get = (index) => ({
    x: landmarks[index].x * videoWidth,
    y: landmarks[index].y * videoHeight,
  });

  const leftCheek = get(LEFT_CHEEK);
  const rightCheek = get(RIGHT_CHEEK);
  const leftEye = get(LEFT_EYE_OUTER);
  const rightEye = get(RIGHT_EYE_OUTER);
  const nose = get(NOSE_TIP);
  const forehead = get(FOREHEAD);
  const chin = get(CHIN);

  const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
  const widthRatio = faceWidth / videoWidth;
  const faceCenterX = (leftCheek.x + rightCheek.x) / 2;
  const faceCenterY = (forehead.y + chin.y) / 2;
  const offsetX = Math.abs(faceCenterX - videoWidth / 2) / videoWidth;
  const offsetY = Math.abs(faceCenterY - videoHeight / 2) / videoHeight;
  const eyeMidX = (leftEye.x + rightEye.x) / 2;
  const eyeDistance = Math.abs(rightEye.x - leftEye.x);
  const noseOffset = Math.abs(nose.x - eyeMidX) / (eyeDistance || 1);

  const messages = [];
  if (widthRatio < 0.28) messages.push("얼굴을 조금 더 가까이 해주세요.");
  else if (widthRatio > 0.62) messages.push("얼굴을 조금 더 멀리 해주세요.");
  if (offsetX > 0.12 || offsetY > 0.12) messages.push("얼굴을 화면 중앙에 맞춰주세요.");
  if (noseOffset > 0.18) messages.push("정면을 바라봐주세요.");

  return {
    ok: messages.length === 0,
    message: messages[0] || "좋습니다. 촬영할 수 있어요.",
  };
}

function Analysis1() {
  const { userId } = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const mediaPipeRef = useRef(null);
  const runningModeRef = useRef("VIDEO");
  const previewUrlRef = useRef(null);
  const lastGuideRef = useRef({ ok: false, message: "" });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { detections, image }
  const [view, setView] = useState("upload"); // 'upload' | 'loading' | 'result'
  const [checkingSavedResult, setCheckingSavedResult] = useState(true);
  const [deletingLatest, setDeletingLatest] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("idle");
  const [cameraMessage, setCameraMessage] = useState("카메라를 시작하면 얼굴 위치를 인식해 촬영할 수 있어요.");
  const [captureReady, setCaptureReady] = useState(false);

  const clearSelectedImage = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setImageFile(null);
    setPreviewUrl(null);
  };

  const applySelectedImage = (file, message) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextPreviewUrl;
    setImageFile(file);
    setPreviewUrl(nextPreviewUrl);
    setError("");
    setCameraStatus("captured");
    setCameraMessage(message);
    setCaptureReady(false);
    lastGuideRef.current = { ok: false, message };
  };

  const clearCameraCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const stopCamera = ({ keepStatus = false } = {}) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    clearCameraCanvas();
    setCaptureReady(false);

    if (!keepStatus) {
      setCameraStatus("idle");
      setCameraMessage("카메라를 시작하면 얼굴 위치를 인식해 촬영할 수 있어요.");
      lastGuideRef.current = { ok: false, message: "" };
    }
  };

  const updateCameraGuide = (ok, message) => {
    if (lastGuideRef.current.ok === ok && lastGuideRef.current.message === message) return;

    lastGuideRef.current = { ok, message };
    setCaptureReady(ok);
    setCameraMessage(message);
  };

  const ensureFaceLandmarker = async () => {
    if (faceLandmarkerRef.current && mediaPipeRef.current) {
      return mediaPipeRef.current;
    }

    const mediaPipe = await import(/* webpackIgnore: true */ MEDIAPIPE_TASKS_URL);
    const { FaceLandmarker, FilesetResolver, DrawingUtils } = mediaPipe;
    const filesetResolver = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);

    try {
      faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: MEDIAPIPE_MODEL_URL,
          delegate: "GPU",
        },
        outputFaceBlendshapes: false,
        runningMode: "VIDEO",
        numFaces: 5,
      });
    } catch (err) {
      faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: MEDIAPIPE_MODEL_URL,
        },
        outputFaceBlendshapes: false,
        runningMode: "VIDEO",
        numFaces: 5,
      });
    }

    mediaPipeRef.current = { FaceLandmarker, DrawingUtils };
    return mediaPipeRef.current;
  };

  const resizeCameraCanvas = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
  };

  const drawLandmarks = (landmarksList) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const mediaPipe = mediaPipeRef.current;
    if (!canvas || !ctx || !mediaPipe) return;

    const { FaceLandmarker, DrawingUtils } = mediaPipe;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const drawingUtils = new DrawingUtils(ctx);

    landmarksList.forEach((landmarks) => {
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
        color: "#C0C0C030",
        lineWidth: 1,
      });
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, {
        color: "#7C9B82",
        lineWidth: 2,
      });
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, {
        color: "#7C9B82",
        lineWidth: 2,
      });
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, {
        color: "#7C9B82",
        lineWidth: 1,
      });
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, {
        color: "#7C9B82",
        lineWidth: 1,
      });
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, {
        color: "#BD6F63",
        lineWidth: 2,
      });
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
        color: "#D9A441",
        lineWidth: 2,
      });
    });

    ctx.restore();
  };

  const predictCamera = () => {
    const video = videoRef.current;
    const faceLandmarker = faceLandmarkerRef.current;
    if (!video || !faceLandmarker || !streamRef.current) return;

    if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
      const detection = faceLandmarker.detectForVideo(video, performance.now());
      const faces = detection.faceLandmarks || [];
      drawLandmarks(faces);

      if (faces.length === 1) {
        const quality = evaluateFaceQuality(faces[0], video.videoWidth, video.videoHeight);
        updateCameraGuide(quality.ok, quality.message);
      } else if (faces.length === 0) {
        updateCameraGuide(false, "얼굴이 인식되지 않습니다.");
      } else {
        updateCameraGuide(false, "얼굴이 여러 개 감지되었습니다. 한 명만 화면에 나와주세요.");
      }
    }

    rafRef.current = requestAnimationFrame(predictCamera);
  };

  const startCamera = async () => {
    if (!userId) {
      setError("로그인이 필요합니다.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("이 브라우저에서는 카메라를 사용할 수 없습니다.");
      return;
    }

    try {
      setError("");
      clearSelectedImage();
      stopCamera({ keepStatus: true });
      setCameraStatus("loading");
      setCameraMessage("얼굴 인식 모델을 준비하고 있어요.");

      await ensureFaceLandmarker();

      if (runningModeRef.current !== "VIDEO") {
        await faceLandmarkerRef.current.setOptions({ runningMode: "VIDEO" });
        runningModeRef.current = "VIDEO";
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await new Promise((resolve) => {
        videoRef.current.onloadedmetadata = resolve;
      });
      await videoRef.current.play();

      resizeCameraCanvas();
      setCameraStatus("running");
      setCameraMessage("얼굴을 화면 중앙에 맞춰주세요.");
      rafRef.current = requestAnimationFrame(predictCamera);
    } catch (err) {
      stopCamera({ keepStatus: true });
      setCameraStatus("error");
      setCaptureReady(false);
      setCameraMessage("카메라를 시작하지 못했습니다.");
      setError(`카메라 접근 실패: ${err.message}`);
    }
  };

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !captureReady) return;

    const captureCanvas = document.createElement("canvas");
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    const captureCtx = captureCanvas.getContext("2d");
    captureCtx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

    captureCanvas.toBlob((blob) => {
      if (!blob) {
        setError("촬영한 이미지를 만들지 못했습니다.");
        return;
      }

      const file = new File([blob], `skin_capture_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      stopCamera({ keepStatus: true });
      applySelectedImage(file, "촬영 완료. 분석 시작을 눌러주세요.");
    }, "image/jpeg", 0.92);
  };

  const handleRetakeCapture = () => {
    clearSelectedImage();
    setCameraStatus("idle");
    setCameraMessage("카메라를 다시 시작해 촬영해주세요.");
    setCaptureReady(false);
  };

  // 오늘 저장된 분석이 있으면 결과 화면을 표시하고, 없으면 새 분석을 허용한다.
  useEffect(() => {
    if (!userId) {
      setCheckingSavedResult(false);
      return;
    }

    (async () => {
      try {
        const res = await getTodayPredict(userId);
        if (res?.data) {
          setResult({
            detections: normalizeDetections(res.data.detections),
            image: `${FLASK_BASE_URL}${res.data.imgPath}`,
          });
          setView("result");
        }
      } catch (err) {
        // 404 등 -> 저장된 기록 없음, 업로드 화면 유지
      } finally {
        setCheckingSavedResult(false);
      }
    })();
  }, [userId]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (faceLandmarkerRef.current?.close) {
        faceLandmarkerRef.current.close();
      }
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    stopCamera({ keepStatus: true });
    applySelectedImage(file, "사진이 선택되었어요. 분석 시작을 눌러주세요.");
  };

  const handleSubmit = async () => {
    if (!userId) {
      setError("로그인이 필요합니다.");
      return;
    }
    if (!imageFile) {
      setError("이미지를 선택해주세요.");
      return;
    }

    setError("");
    stopCamera({ keepStatus: true });
    setView("loading");

    // 최소 2초간 로딩 화면을 보여주기 위한 지연
    const minDelay = new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const [flaskResponse] = await Promise.all([setPredictFlask(formData), minDelay]);
      const { detections, image, imgPath } = flaskResponse.data;

      await setPredictSave(userId, detections, imgPath);

      // 분석 직후에는 base64 image를 바로 사용 (추가 요청 없이 즉시 렌더링)
      setResult({ detections: normalizeDetections(detections), image });
      setView("result");
    } catch (err) {
      await minDelay;
      const status = err.response?.status;
      const message = err.response?.data?.message;

      setError(
        status === 409
          ? message || "이미 저장된 피부 상태 분석 결과가 있습니다."
          : message || "예측 처리 중 오류가 발생했습니다."
      );
      setView("upload");
    }
  };

  const handleRetest = async () => {
    if (!userId) {
      setError("로그인이 필요합니다.");
      return;
    }

    if (!window.confirm("저장된 최신 피부 상태 분석 결과와 진단 사진을 삭제하고 다시 진단할까요?")) {
      return;
    }

    try {
      setDeletingLatest(true);
      setError("");
      await deleteLatestPredict(userId);
      clearSelectedImage();
      stopCamera();
      setResult(null);
      setView("upload");
    } catch (err) {
      // DB가 초기화됐거나 이미 삭제된 경우에도 재검사를 계속할 수 있게 한다.
      if (err.response?.status === 404) {
        clearSelectedImage();
        stopCamera();
        setResult(null);
        setView("upload");
        return;
      }

      console.error("최신 피부 상태 분석 결과 삭제 실패:", err);
      alert("재진단 준비에 실패했습니다. 서버 상태를 확인해주세요.");
    } finally {
      setDeletingLatest(false);
    }
  };

  const skinInfo = result ? getSkinInfo(result.detections) : null;
  const diagnosisComment = result ? getDiagnosisComment(result.detections) : "";
  const detectedMascots = result ? getDetectedMascots(result.detections) : [];
  const ingredientRecommendations = result
    ? getStatusIngredientRecommendations(result.detections)
    : [];
  

  return (
    <div className="analysis1_app">
      <div className="analysis1_header">
        <div>
          <p className="analysis1_eyebrow">AI SKIN DIAGNOSIS</p>
          <h1 className="analysis1_title">피부 진단</h1>
        </div>
        {view === "result" && result && (
          <button
            type="button"
            className="analysis1_retest_button"
            onClick={handleRetest}
            disabled={deletingLatest}
          >
            {deletingLatest ? "삭제 중" : "재진단하기"}
          </button>
        )}
      </div>

      <p className="analysis1_subtitle">
        카메라로 얼굴을 인식하고 촬영하면 AI가 피부 상태를 분석해드려요.
      </p>

      <div className="analysis1_grid">
        {/* 왼쪽 박스: 이미지 (업로드 -> 로딩 -> 결과 전환) */}
        <div className="card analysis1_image_card">
          <div className="card_header_row">
            <h2>카메라 인식</h2>
            {view === "result" && result && (
              <span className="today_badge">최신 분석 완료</span>
            )}
          </div>

          <div className="analysis1_image_stage">
            {(view === "upload" || view === "loading") && (
              <div className="camera_panel">
                {previewUrl ? (
                  <div className="upload_preview camera_capture_preview">
                    <img src={previewUrl} alt="촬영 미리보기" />
                  </div>
                ) : (
                  <div className={`camera_stage ${captureReady ? "is_ready" : ""}`}>
                    <video ref={videoRef} autoPlay playsInline muted />
                    <canvas ref={canvasRef} />
                    <div className="camera_guide_frame" />
                    {(cameraStatus === "idle" || cameraStatus === "error") && (
                      <div className="camera_idle_hint">
                        <strong>카메라 인식 준비</strong>
                        <span>얼굴이 화면 중앙에 오면 촬영할 수 있어요.</span>
                      </div>
                    )}
                    {cameraStatus === "loading" && (
                      <div className="camera_idle_hint">
                        <strong>모델 준비 중</strong>
                        <span>얼굴 인식 기능을 불러오고 있어요.</span>
                      </div>
                    )}
                  </div>
                )}

                {view === "loading" && (
                  <div className="analysis1_loading_overlay">
                    <div className="loading_dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <p>AI가 피부를 분석하고 있어요</p>
                  </div>
                )}

                <p className={`camera_guide_text ${captureReady ? "ready" : ""}`}>
                  {cameraMessage}
                </p>

                <div className="camera_actions">
                  {previewUrl ? (
                    <button
                      type="button"
                      className="camera_action_button secondary"
                      onClick={handleRetakeCapture}
                      disabled={view === "loading"}
                    >
                      다시 촬영
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="camera_action_button"
                        onClick={startCamera}
                        disabled={!userId || cameraStatus === "loading" || cameraStatus === "running" || view === "loading"}
                      >
                        카메라 인식하기
                      </button>
                      <button
                        type="button"
                        className="camera_action_button"
                        onClick={handleCapture}
                        disabled={!captureReady || view === "loading"}
                      >
                        촬영하기
                      </button>
                      <button
                        type="button"
                        className="camera_action_button secondary"
                        onClick={() => stopCamera()}
                        disabled={cameraStatus !== "running" || view === "loading"}
                      >
                        중지
                      </button>
                    </>
                  )}
                </div>

                <label className="camera_file_fallback">
                  사진 파일로 선택
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={view === "loading"}
                  />
                </label>
              </div>
            )}

            {view === "result" && result && (
              <div className="upload_preview result_fade_in">
                <img src={result.image} alt="분석 결과 이미지" />
              </div>
            )}
          </div>

          {view === "upload" && (
            <button
              className="analysis1_submit"
              onClick={handleSubmit}
              disabled={!userId || checkingSavedResult || !imageFile}
            >
              분석 시작
            </button>
          )}

          {error && <p className="analysis1_message error">{error}</p>}
          {!userId && (
            <p className="analysis1_message info">로그인 후 이용해주세요.</p>
          )}
        </div>

        {/* 오른쪽 박스: 감지 목록 + 코멘트 */}
        <div className="card analysis1_result_card">
          <h2>분석 결과</h2>

          {view === "result" && result && skinInfo ? (
            <div className="analysis1_result_detail">
              {detectedMascots.length > 0 && (
                <div
                  className={`analysis1_mascot_list count_${detectedMascots.length}`}
                  aria-label="감지된 피부 상태 마스코트"
                >
                  {detectedMascots.map((mascot) => (
                    <figure
                      key={mascot.type}
                      className="analysis1_mascot"
                      style={{ "--detection-color": mascot.color }}
                    >
                      <figcaption className="analysis1_mascot_result">
                        <span className="detection_name">{mascot.label}</span>
                        <span className="detection_code">{mascot.type}</span>
                        <span className="detection_count">{mascot.count}개</span>
                      </figcaption>
                      <img src={mascot.image} alt={`${mascot.label} 마스코트`} />
                    </figure>
                  ))}
                </div>
              )}

              <div className="analysis1_comment" style={{ "--comment-accent": skinInfo.color }}>
                <h3>TripleSkin의 코멘트</h3>
                <p>{diagnosisComment}</p>
              </div>
            </div>
          ) : (
            <div className="analysis1_result_placeholder">
              <p className="result_empty">
                아직 분석 결과가 없어요.
                <br />
                왼쪽에서 카메라로 얼굴을 촬영하고 분석을 시작해보세요.
              </p>
            </div>
          )}
        </div>
      </div>

      {view === "result" && result && skinInfo && (
        <nav className="analysis1_quick_guide" aria-label="피부 상태 분석 결과 활용 순서">
          <a href="#status-recommendations">
            <span>01</span>
            <strong>성분 확인</strong>
            <small>현재 피부 상태에 맞는 핵심 성분</small>
          </a>
          <a href="#status-recommendations">
            <span>02</span>
            <strong>화장품 찾기</strong>
            <small>올리브영에서 바로 검색</small>
          </a>
          <a href="#status-feedback">
            <span>03</span>
            <strong>결과 평가</strong>
            <small>분석이 도움 됐는지 알려주기</small>
          </a>
        </nav>
      )}

      {view === "result" && result && skinInfo && (
        <section
          className="analysis1_recommend_section"
          id="status-recommendations"
          aria-labelledby="status-ingredient-heading"
        >
          <div className="analysis1_recommend_card">
            <div className="analysis1_section_heading">
              <span className="analysis1_section_number">01–02</span>
              <div>
                <p className="analysis1_recommend_eyebrow">INGREDIENT &amp; PRODUCT PICK</p>
                <h3 id="status-ingredient-heading">성분 추천과 화장품 찾기</h3>
                <p>피부 상태별 추천 이유를 확인하고 관련 화장품을 바로 찾아보세요.</p>
              </div>
            </div>
            {ingredientRecommendations.map((recommendation) => (
              <div className="recommend_group" key={recommendation.label}>
                <h4>{recommendation.label}</h4>
                <ul className="recommend_list">
                  {recommendation.items.map((item) => (
                    <li key={item.name}>
                      <span className="recommend_dot ingredient_dot" />
                      <div className="recommend_text">
                        <a
                          className="recommend_name ingredient_link"
                          href={getOliveYoungSearchUrl(item.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${item.name} 올리브영에서 검색`}
                        >
                          <span>{item.name}</span>
                          <span className="ingredient_link_cta">
                            화장품 추천 보기 ↗
                          </span>
                        </a>
                        <span className="recommend_desc">{item.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {view === "result" && result && skinInfo && (
        <div className="analysis1_feedback_section" id="status-feedback">
          <div className="analysis1_feedback_label">
            <span className="analysis1_section_number">03</span>
            <span>마지막으로 분석 결과를 평가해 주세요</span>
          </div>
          <AnalysisFeedback
            feedbackType="SKIN_STATUS"
            analysisName="피부 상태 분석"
          />
        </div>
      )}
    </div>
  );
}

export default Analysis1;
