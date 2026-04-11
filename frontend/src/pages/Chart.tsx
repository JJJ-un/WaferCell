import { SimpleChart } from "@/widgets/SimpleChart"
import Selector from "@/shared/ui/selector/Selector"
import { type ChartPeriod } from "@/shared/type/period.type"
import { useState } from "react";

export const Chart = () => {
    const chartData  = [
      { time: '2025-01-01', value: 100 },
      { time: '2025-02-01', value: 110 },
      { time: '2025-03-01', value: 105 },
      { time: '2025-04-01', value: 120 },
      { time: '2025-05-01', value: 100 },
      { time: '2025-06-01', value: 110 },
      { time: '2025-07-01', value: 105 },
      { time: '2025-08-01', value: 120 },
      { time: '2025-09-01', value: 100 },
      { time: '2025-10-01', value: 110 },
      { time: '2025-11-01', value: 105 },
      { time: '2025-12-01', value: 120 },
      { time: '2026-01-01', value: 100 },
      { time: '2026-02-01', value: 110 },
      { time: '2026-03-01', value: 105 },
      { time: '2026-04-01', value: 120 },
    ];

    const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('3개월'); // 기간 선택 상태 (예: '3개월', '1년', '3년', '10년')

    return (
        <div className="p-[24px] flex flex-col gap-[24px]">
            {/* 차트 컴포넌트들을 여기에 추가 */}
            <Selector selected={selectedPeriod} onSelect={setSelectedPeriod} />
            <SimpleChart chartData={chartData} />
        </div>
    )
}