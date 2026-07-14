from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
from collections import Counter
from ultralytics import YOLO
import os
import uuid
from flask import send_from_directory


app = Flask(__name__)
UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# 서버 시작 시 모델 한 번만 로드 (요청마다 로드하면 매우 느려짐)
MODEL_PATH = './models/last_model/best.pt'
model = YOLO(MODEL_PATH)


# ---------- 클래스별 색상 (BGR) ----------
# 필요하면 실제 클래스 이름/원하는 색으로 자유롭게 수정하세요.
CLASS_COLORS = {
    "acne": (66, 88, 245),     # 코랄 레드
    "bi": (66, 194, 245),      # 골드/앰버
    "ato": (135, 178, 95),     # 세이지 그린
}
DEFAULT_COLOR = (180, 130, 200)  # 매핑에 없는 클래스용 기본색


def get_color(cls_name):
    return CLASS_COLORS.get(cls_name, DEFAULT_COLOR)


def draw_box(img, x1, y1, x2, y2, color, thickness=2):
    """일반적인 사각형 박스"""
    cv2.rectangle(img, (x1, y1), (x2, y2), color, thickness, cv2.LINE_AA)


@app.route('/health', methods=['GET'])
def health():
    """서버가 살아있는지 확인용"""
    return jsonify({"status": "ok"})


@app.route("/uploads/<filename>")
def get_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "image 파일이 필요합니다."}), 400

    file = request.files['image']

    # 파일 -> numpy 배열 -> cv2 이미지 (디스크 저장 없이 바로 디코딩)
    file_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

    if img is None:
        return jsonify({"error": "이미지를 읽을 수 없습니다."}), 400

    # 추론
    results = model(img, conf=0.3, imgsz=640)
    result = results[0]

    names = result.names
    cls_ids = [int(box.cls[0]) for box in result.boxes]
    counts = Counter(cls_ids)

    detections = [
        {"dtype_result": names[cls_id], "dtype_cnt": count}
        for cls_id, count in counts.items()
    ]

    # ---------- 결과 이미지 그리기 (박스만) ----------
    img_result = img.copy()

    for box in result.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        cls_id = int(box.cls[0])
        cls_name = names[cls_id]
        color = get_color(cls_name)

        draw_box(img_result, x1, y1, x2, y2, color)

    _, buffer = cv2.imencode(".jpg", img_result)
    img_base64 = base64.b64encode(buffer).decode("utf-8")

    filename = f"{uuid.uuid4()}.jpg"
    save_path = os.path.join(UPLOAD_FOLDER, filename)
    cv2.imwrite(save_path, img_result)

    img_path = f"/uploads/{filename}"

    return jsonify({
        "detections": detections,
        "image": f"data:image/jpeg;base64,{img_base64}",
        "imgPath": img_path
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)