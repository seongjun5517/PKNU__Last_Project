import axios from "axios"

export const springApi = axios.create({
    baseURL: "/spring",
    withCredentials: true,

    headers : {
        "Content-Type" : "application/json"
    },
});

export const flaskApi = axios.create ({
    baseURL : "/flask",

    headers : {
        "Content-Type" : "application/json"
    },
});

export const chatbotApi = axios.create({
    baseURL: "/chatbot",

    headers: {
        "Content-Type": "application/json"
    },
});
