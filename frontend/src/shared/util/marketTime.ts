/**
 * 주식 시장(미국 뉴욕 기준) 진행률을 계산합니다. (09:30 ~ 16:00, 총 390분)
 */
export const getMarketProgress = (timestamp?: string): number => {
  let hours: number;
  let minutes: number;

  if (timestamp && timestamp.length === 6) {
    // 1. ✅ 서버가 준 HHMMSS (예: "130000")는 이미 뉴욕 현지 시간입니다.
    // 한국 시간으로 바꾸거나 뉴욕 시간으로 재변환하지 않고, 숫자만 그대로 뽑아 씁니다.
    hours = parseInt(timestamp.substring(0, 2));
    minutes = parseInt(timestamp.substring(2, 4));
  } else {
    // 2. 서버 시간이 없을 때만 현재 브라우저 시각을 뉴욕 시간으로 변환합니다.
    const nyTimeStr = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
    const parts = nyTimeStr.split(':');
    hours = parseInt(parts[0]);
    minutes = parseInt(parts[1]);
  }

  const currentTotalMinutes = hours * 60 + minutes;
  const startMinutes = 9 * 60 + 30; // 09:30
  const endMinutes = 16 * 60;      // 16:00
  const totalDuration = endMinutes - startMinutes; // 390분

  // 3. 진행률 결정 (0.1 ~ 1.0)
  // 장 시작 전(09:30 이전)이나 예기치 못한 데이터는 최소 10%로 잡습니다.
  if (currentTotalMinutes <= startMinutes) return 0.1; 
  if (currentTotalMinutes >= endMinutes) return 1.0;   // 장 마감 후

  const elapsed = currentTotalMinutes - startMinutes;
  const progress = elapsed / totalDuration;

  // 장 초반에 수치가 너무 튀는 것을 방지하기 위해 최소 0.1(10%) 하한선을 둡니다.
  return Math.max(0.1, progress);
};
