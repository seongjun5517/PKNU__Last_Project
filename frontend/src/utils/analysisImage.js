import { FLASK_BASE_URL } from "../config/apiConfig";

export function getAnalysisImageUrl(imgPath) {
  if (!imgPath) return "";

  if (
    imgPath.startsWith("data:") ||
    imgPath.startsWith("blob:") ||
    imgPath.startsWith("http://") ||
    imgPath.startsWith("https://")
  ) {
    return imgPath;
  }

  const normalizedPath = imgPath.startsWith("/") ? imgPath : `/${imgPath}`;
  return `${FLASK_BASE_URL}${normalizedPath}`;
}
