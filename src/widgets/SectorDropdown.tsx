import { Dropdown } from "@/shared/ui/dropdown/Dropdown"
import { type SectorName } from "@/shared/types/Semiconductor";

export interface SectorDropdownProps {
    onSectorChange: (sector: SectorName) => void;
}

export const SectorDropdown = ({onSectorChange}:SectorDropdownProps) => {
    // 이거 위에서 

    return (
        <Dropdown onSelect={(id) => onSectorChange(id as SectorName)}>
            <Dropdown.Trigger>
                <Dropdown.Value>
                    {({ selectedOption }) =>
                      selectedOption ? selectedOption : "선택해주세요"
                    }
                </Dropdown.Value>
            </Dropdown.Trigger>
            <Dropdown.Menu>
                <Dropdown.Option optionId="EDA/IP">
                    EDA/IP
                </Dropdown.Option>
                <Dropdown.Option optionId="파운드리">
                    파운드리
                </Dropdown.Option>
            </Dropdown.Menu>
        </Dropdown>
    )
}