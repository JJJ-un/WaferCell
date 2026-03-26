import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api', // 기본 경로 설정
  timeout: 5000,   // 5초 이상 걸리면 에러 처리
  headers: {
    'Content-Type': 'application/json',
  },
});