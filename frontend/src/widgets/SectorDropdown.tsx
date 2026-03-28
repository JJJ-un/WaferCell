import { Dropdown } from "@/shared/ui/dropdown/Dropdown"
import { type SectorName } from "@/shared/types/Semiconductor";

export interface SectorDropdownProps {
    onSectorChange: (sector: SectorName) => void;
}

export const SectorDropdown = ({ onSectorChange }: SectorDropdownProps) => {
    // 실제 반도체 섹터 리스트
    const sectors: { id: SectorName; label: string }[] = [
        { id: '전체', label: '전체 보기' },
        { id: '팹리스', label: '팹리스 (Fabless)' },
        { id: '파운드리', label: '파운드리 (Foundry)' },
        { id: '소부장', label: '소부장 (Equip/Mat)' },
        { id: '메모리', label: '메모리 (Memory)' },
        { id: 'IDM', label: '종합 반도체 (IDM)' },
        { id: 'IP', label: '설계 자산 (IP)' },
    ];

    return (
        <Dropdown onSelect={(id) => onSectorChange(id as SectorName)} className="mb-[24px] gap-[8px]">
            <Dropdown.Trigger className="bg-secondary w-[300px] h-[56px] rounded-[8px]">
                <Dropdown.Value>
                    {({ selectedOption }) =>
                        // selectedOption은 Dropdown.Option의 children(label)을 그대로 물고 옵니다.
                        selectedOption ? selectedOption : "섹터를 선택하세요"
                    }
                </Dropdown.Value>
            </Dropdown.Trigger>
            <Dropdown.Menu className="fixed bg-tertiary w-[300px] rounded-[8px] z-100">
                {sectors.map((sector) => (
                    <Dropdown.Option key={sector.id} optionId={sector.id} className="p-[16px]">
                        {sector.label}
                    </Dropdown.Option>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
}
