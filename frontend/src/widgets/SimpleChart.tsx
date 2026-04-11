import { useEffect, useRef } from 'react';
import { createChart, type IChartApi, LineSeries, ColorType, LineType, CrosshairMode } from 'lightweight-charts';

export interface ChartData {
  time: string; // 'YYYY-MM-DD' 형식
  value: number;
}
interface SimpleChartProps {
  chartData: ChartData[];
}

export const SimpleChart = ({ chartData }: SimpleChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);  
  const chartApiRef = useRef<IChartApi | null>(null);


  useEffect(() => {
    if (!chartContainerRef.current) return; //요소 생선 전 차트 생성 방지

    // createChart(container, options) → 차트 배경 생성 (지정 DOM 요소)
    chartApiRef.current = createChart(chartContainerRef.current, { 
      width: 1060,
      height: 500,
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' }, // 배경색
        textColor: '#333', // 글자색
        fontSize: 12,
        },
      grid: {
          vertLines: { visible: false }, // 세로 격자 숨김 (토스 스타일)
          horzLines: { color: '#f0f0f0' }, // 가로 격자 색상
      },
      rightPriceScale: {
          borderVisible: false, // 우측 테두리 숨김
      },
      timeScale: {
          borderVisible: false, // 하단 테두리 숨김
          timeVisible: true,    // 시간 표시 여부
          secondsVisible: false,
          // 데이터가 없을 때 우측에 여백을 주어 보기 편하게 만듦
          barSpacing: 35,
      },
      crosshair: {
          mode: CrosshairMode.Magnet, // 마우스가 데이터에 자석처럼 붙음
      },
    });
    

    const graph = chartApiRef.current.addSeries(LineSeries, {
        color: '#2962FF',        // 선 색상
        lineWidth: 3,            // 선 두께
        lineType: LineType.Curved, // 꺾은선이 아닌 부드러운 곡선 (매우 중요!)
        crosshairMarkerVisible: true, // 마우스 올렸을 때 점 표시
        lastPriceAnimation: 1,
        lastValueVisible: true,  // 현재가 표시 라벨 노출
        priceLineVisible: false, // 수평 가격선 숨김
    });
    

    // 데이터 넣기
    // 데이터 형식 일 월 년을 보여준다면
    graph.setData(chartData);

    return () => {
      chartApiRef.current?.remove();
    };
    
  }, []);
  

  return (
    <div ref={chartContainerRef} className="border rounded-[10px] overflow-hidden [&_a]:hidden" />
  );
  
}



