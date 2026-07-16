import { springApi, flaskApi } from "../config/axiosInstance";

// [Flask] 이미지 업로드 -> YOLO 추론 -> detections + 결과이미지 반환
export const setPredictFlask = (formData) =>
  flaskApi.post(`/predict`, formData, {
    headers: { "Content-Type": undefined },
  });

// [Spring] 예측 결과 저장
export const setPredictSave = (detections, imgPath) =>
  springApi.post(`/deep/save`, { detections, imgPath });

// [Spring] 최신 예측 결과 조회
export const getLatestPredict = () => springApi.get(`/deep/latest`);

// [Spring] 오늘 예측 결과 조회
export const getTodayPredict = () => springApi.get(`/deep/today`);

// [Spring] 최신 예측 결과 전체 삭제
export const deleteLatestPredict = () => springApi.delete(`/deep/latest`);

// [Spring] 오늘 예측 결과 전체 삭제
export const deleteTodayPredict = () => springApi.delete(`/deep/today`);

// [Spring] 특정 dtypeCode 결과 조회
export const getDeepView = (dtypeCode) =>
  springApi.get(`/deep/${dtypeCode}`);

// [Spring] 특정 dtypeCode 결과 삭제
export const setDeepDelete = (dtypeCode) =>
  springApi.delete(`/deep/${dtypeCode}`);
