export const MAX_IMAGE_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_FILE_SIZE_LABEL = "10MB";

export function isImageFileTooLarge(file) {
  return Boolean(file && file.size > MAX_IMAGE_FILE_SIZE_BYTES);
}
