interface TabItem {
    id: string;
    label: string;
}

interface TabMenuProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

export const TabMenu = ({ tabs, activeTab, onTabChange }: TabMenuProps) => {
    return (
        <div className="flex border-b border-slate-100 pb-[8px] gap-[16px] mb-4 w-full justify-start">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`text-sm font-bold pb-[4px] transition-all duration-200 cursor-pointer ${activeTab === tab.id
                            ? "text-slate-800 border-b-2 border-slate-800"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};
