export interface AnalysisSection {
  title: string;
  bulletPoints: string[];
}

export interface KeywordRequest {
  keyword: string;
}

export interface AiTextResponse {
  ticker: string;
  selectedKeyword: string;
  sections: AnalysisSection[]; // 💡 통글자 마크다운 대신 깔끔한 자바스크립트 객체 배열 수신
}