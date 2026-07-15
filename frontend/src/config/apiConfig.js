const apiBaseUrl = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/+$/, "");

const createServiceBaseUrl = (servicePath) =>
  `${apiBaseUrl}/${servicePath.replace(/^\/+/, "")}`;

export const SPRING_BASE_URL = createServiceBaseUrl("spring");
export const FLASK_BASE_URL = createServiceBaseUrl("flask");
export const CHATBOT_BASE_URL = createServiceBaseUrl("chatbot");
