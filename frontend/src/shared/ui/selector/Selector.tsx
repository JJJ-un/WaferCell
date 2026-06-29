import { type ChartPeriod } from '@/shared/type/period.type';

interface SelectorProps {
  selected: ChartPeriod;
  onSelect: (period: ChartPeriod) => void;
}


const periods: ChartPeriod[] = ['1분', '5분', '일', '주', '월', '년'];


const Selector = ({ selected, onSelect }: SelectorProps) => {
  return (
    <div className="flex p-1 space-x-1 bg-gray-100 rounded-lg w-fit">
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onSelect(period)}
          className={`
            px-4 py-1.5 text-sm font-medium transition-all duration-200 rounded-md
            ${selected === period 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          {period}
        </button>
      ))}
    </div>
  );
};

export default Selector;