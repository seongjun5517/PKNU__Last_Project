import { springApi, flaskApi } from "../config/axiosInstance";

// [Flask] 이미지 업로드 -> YOLO 추론 -> detections + 결과이미지 반환
export const setPredictFlask = (formData) =>
  flaskApi.post(`/predict`, formData, {
    headers: { "Content-Type": undefined },
  });

// [Spring] 예측 결과 저장 (하루 1회 제한 체크 포함)
export const setPredictSave = (userId, detections, imgPath) =>
  springApi.post(`/deep/save`, { userId, detections, imgPath });

// [Spring] 오늘 예측 결과 조회
export const getTodayPredict = (userId) =>
  springApi.get(`/deep/today`, { params: { userId } });

// [Spring] 특정 dtypeCode 결과 조회
export const getDeepView = (dtypeCode) =>
  springApi.get(`/deep/${dtypeCode}`);

// [Spring] 특정 dtypeCode 결과 삭제
export const setDeepDelete = (dtypeCode) =>
  springApi.delete(`/deep/${dtypeCode}`);