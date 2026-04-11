import { SimpleChart } from "@/widgets/SimpleChart"
import Selector from "@/shared/ui/selector/Selector"
import { type ChartPeriod } from "@/shared/type/period.type"
import { useState } from "react";
import { DailyPriceList } from "@/widgets/DailyPriceList";
import { useParams } from "@tanstack/react-router";
import { useChartData } from "@/features/stock-chart/hook/useChartData";
import { createFileRoute } from "@tanstack/react-router";

export const Chart = () => {
    const { ticker } = useParams({ from: '/chart/$ticker' });
    const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('3개월');

    const { data, isLoading } = useChartData(ticker, selectedPeriod);

    if (isLoading) return <div className="p-24">차트 데이터를 불러오는 중...</div>;
    if (!data) return <div className="p-24">데이터가 없습니다.</div>;

    return (
        <div className="p-[24px] flex flex-col gap-[24px]">
            <Selector selected={selectedPeriod} onSelect={setSelectedPeriod} />
            <SimpleChart chartData={data.chartData} />
            <DailyPriceList dailyPrices={data.dailyPrices} />
        </div>
    )
}

export const Route = createFileRoute('/chart/$ticker')({
  component: Chart,
});
