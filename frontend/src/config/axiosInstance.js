import axios from "axios";
import {
    CHATBOT_BASE_URL,
    FLASK_BASE_URL,
    SPRING_BASE_URL,
} from "./apiConfig";

export const springApi = axios.create({
    baseURL: SPRING_BASE_URL,
    timeout: 15000,

    headers : {
        "Content-Type" : "application/json"
    },
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
