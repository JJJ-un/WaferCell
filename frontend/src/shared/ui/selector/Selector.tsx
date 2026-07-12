export interface SelectorOption<T> {
  value: T;
  label: string;
}

interface SelectorProps<T> {
  options: SelectorOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
  className?: string;
  itemClassName?: string;
}

const Selector = <T extends string | number>({ 
  options, 
  selected, 
  onSelect,
  className = '',
  itemClassName = ''
}: SelectorProps<T>) => {
  return (
    <div className={`flex p-1 space-x-1 bg-gray-100 rounded-lg w-fit ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          className={`
            px-4 py-1.5 text-sm font-medium transition-all duration-200 rounded-md cursor-pointer
            ${selected === option.value 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-500 hover:text-slate-600 hover:bg-slate-200/50'
            }
            ${itemClassName}
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default Selector;