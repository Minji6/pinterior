"use client"

import axios from "axios";

// 로그인 성공했을 때 기본 요청 헤더에 Authorization 추가
export function addAuthHeader(token) {
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;
}

// 로그아웃 했을 때 기본 요청 헤더에 Authorization 제거
export function removeAuthHeader() {
    delete axios.defaults.headers.common["Authorization"];
}

function AxiosConfig() {
    return null;

}

export default AxiosConfig;