export function getProfileImageSrc(imagePath) {
  if (!imagePath) return "";

  if (
    imagePath.startsWith("blob:") ||
    imagePath.startsWith("data:") ||
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }

  if (!imagePath.includes("/") && !imagePath.includes("\\")) {
    return `/spring/images/profile/${imagePath}`;
  }

  const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

  if (normalizedPath.startsWith("/spring/")) {
    return normalizedPath;
  }

  if (normalizedPath.startsWith("/images/profile/")) {
    return `/spring${normalizedPath}`;
  }

  return normalizedPath;
}
