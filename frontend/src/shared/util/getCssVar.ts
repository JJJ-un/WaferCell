/**
 * CSS 변수 값을 가져오는 유틸리티
 * @param name - CSS 변수명 (예: '--color-trend-up-900')
 */
export const getCssVar = (name: string) => {

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

  return value
};