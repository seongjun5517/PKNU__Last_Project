from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
from collections import Counter
from ultralytics import YOLO

app = Flask(__name__)

# 서버 시작 시 모델 한 번만 로드 (요청마다 로드하면 매우 느려짐)
MODEL_PATH = './models/skin_bi_ato_acne_normal_v3/weights/best.pt'
model = YOLO(MODEL_PATH)


@app.route('/health', methods=['GET'])
def health():
    """서버가 살아있는지 확인용"""
    return jsonify({"status": "ok"})


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

    # 결과 이미지 그리기
    img_result = img.copy()
    cv2.rectangle(img_result, (10, 10), (250, 40 + len(counts) * 30), (0, 0, 0), -1)
    cv2.putText(img_result, "Detection Summary", (20, 35),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    for i, (cls_id, count) in enumerate(counts.items()):
        label_text = f"{names[cls_id]}: {count}"
        cv2.putText(img_result, label_text, (20, 70 + (i * 30)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 1)

    for box in result.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        cv2.rectangle(img_result, (x1, y1), (x2, y2), (0, 255, 0), 2)

    _, buffer = cv2.imencode('.jpg', img_result)
    img_base64 = base64.b64encode(buffer).decode('utf-8')

    return jsonify({
        "detections": detections,
        "image": f"data:image/jpeg;base64,{img_base64}"
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)