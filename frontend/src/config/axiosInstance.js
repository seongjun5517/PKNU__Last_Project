import axios from "axios"

export const springApi = axios.create({
    baseURL: "/spring",

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