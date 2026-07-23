const DEFAULT_MESSAGES = {
  timeout: "요청 처리 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.",
  unavailable: "현재 서버를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.",
  network: "서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.",
  fallback: "요청 처리 중 오류가 발생했습니다.",
};

export const getApiErrorMessage = (error, messages = {}) => {
  const resolvedMessages = { ...DEFAULT_MESSAGES, ...messages };
  const status = error?.response?.status;
  const errorCode = error?.code;

  if (errorCode === "ECONNABORTED" || errorCode === "ETIMEDOUT" || status === 504) {
    return resolvedMessages.timeout;
  }

  if (status === 502 || status === 503) {
    return resolvedMessages.unavailable;
  }

  if (errorCode === "ERR_NETWORK" || !error?.response) {
    return resolvedMessages.network;
  }

  const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
  return serverMessage || resolvedMessages.fallback;
};
