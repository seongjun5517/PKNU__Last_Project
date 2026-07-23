import axios from "axios";
import {
    CHATBOT_BASE_URL,
    FLASK_BASE_URL,
    SPRING_BASE_URL,
} from "./apiConfig";

const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "X-XSRF-TOKEN";
const CSRF_ENDPOINT = "/api/auth/csrf";
const SAFE_METHODS = new Set(["get", "head", "options"]);

export const springApi = axios.create({
    baseURL: SPRING_BASE_URL,
    timeout: 15000,
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: CSRF_COOKIE_NAME,
    xsrfHeaderName: CSRF_HEADER_NAME,

    headers : {
        "Content-Type" : "application/json"
    },
});

let csrfRequestPromise = null;

function readCookie(name) {
    if (typeof document === "undefined") return null;

    const prefix = `${name}=`;
    const cookie = document.cookie
        .split(";")
        .map((item) => item.trim())
        .find((item) => item.startsWith(prefix));

    if (!cookie) return null;

    const value = cookie.substring(prefix.length);
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

// XSRF-TOKEN 쿠키의 값만 복사해서 X-XSRF-TOKEN 요청 헤더에 넣는 함수
// 쿠키 전체를 헤더에 넣는것은 아님, 토큰 문자열만 복사
function setCsrfHeader(config, token) {
    if (typeof config.headers?.set === "function") {
        config.headers.set(CSRF_HEADER_NAME, token);
        return;
    }

    config.headers = {
        ...config.headers,
        [CSRF_HEADER_NAME]: token,
    };
}

function requestCsrfToken() {
    if (!csrfRequestPromise) {
        csrfRequestPromise = springApi
            .get(CSRF_ENDPOINT)
            .then(() => {
                const token = readCookie(CSRF_COOKIE_NAME);
                if (!token) {
                    throw new Error("CSRF token was not issued by the server.");
                }

                return token;
            })
            .finally(() => {
                csrfRequestPromise = null;
            });
    }

    return csrfRequestPromise;
}

export function ensureCsrfToken() {
    // 로그인 같은 post 요청은 csrf 검사가 필요함. 
    // 아래는 실제 로그인 요청시 정보가 들어감 T0은 토큰 예시 

    // POST /api/auth/login
    // Cookie: XSRF-TOKEN=T0
    // X-XSRF-TOKEN: T0

    // T0 == T0
    // → CSRF 검사 통과
    // → 아이디와 비밀번호 검사

    // 여기서 다르면 비밀번호 검사까지 가지 않고 403반환. 
    const cookieToken = readCookie(CSRF_COOKIE_NAME);
    if (cookieToken) {
        return Promise.resolve(cookieToken);
    }
    return requestCsrfToken();
}

export function refreshCsrfToken() {
    return requestCsrfToken();
}

springApi.interceptors.request.use(async (config) => {
    const method = String(config.method || "get").toLowerCase();
    if (SAFE_METHODS.has(method)) {
        return config;
    }

    const token = await ensureCsrfToken();
    setCsrfHeader(config, token);
    return config;
});

export const flaskApi = axios.create ({
    baseURL : FLASK_BASE_URL,
    timeout: 120000,

    headers : {
        "Content-Type" : "application/json"
    },
});

export const chatbotApi = axios.create({
    baseURL: CHATBOT_BASE_URL,
    timeout: 180000,

    headers: {
        "Content-Type": "application/json"
    },
});
