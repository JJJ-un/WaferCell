import { useState, useLayoutEffect } from 'react';
import * as d3 from 'd3';
import { getCssVar } from '@/shared/util/getCssVar';

export const useColorScale = () => {
  // 초기값: 빈 스케일 혹은 기본 스케일
  const [colorScale, setColorScale] = useState<d3.ScaleLinear<string, string>>(() =>
    d3.scaleLinear<string>().domain([0, 1]).range(['#fff', '#fff'])
  );

  useLayoutEffect(() => {
    const newScale = d3.scaleLinear<string>()
      .domain([-10, -5, -2, -0.5, -0.01, 0, 0.01, 0.5, 2, 5, 10])
      .range([
        getCssVar('--color-trend-down-900'),
        getCssVar('--color-trend-down-700'),
        getCssVar('--color-trend-down-500'),
        getCssVar('--color-trend-down-300'),
        getCssVar('--color-trend-down-100'),
        getCssVar('--color-trend-zero'),
        getCssVar('--color-trend-up-100'),
        getCssVar('--color-trend-up-300'),
        getCssVar('--color-trend-up-500'),
        getCssVar('--color-trend-up-700'),
        getCssVar('--color-trend-up-900'),
      ])
      .interpolate(d3.interpolateHcl)
      .clamp(true);

    setColorScale(() => newScale);
  }, []); // 다크모드 등 테마 변수가 있다면 의존성 배열에 추가

  return colorScale;
};