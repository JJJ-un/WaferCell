import { type ComponentProps } from 'react';
import { DropdownContextProvider } from '@/shared/model/contexts/DropdownContextProvider';
import { DropdownWrapper } from './DropdownWrapper';
import { DropdownTrigger } from './DropdownTrigger';
import { DropdownMenu } from './DropdownMenu';
import { DropdownOption } from './DropdownOption';
import { DropdownIcon } from './DropdownIcon';
import { DropdownValue } from './DropdownValue';

interface DropdownRootProps extends Omit<ComponentProps<typeof DropdownWrapper>, 'onSelect'> {
  onSelect?: (id: string | number) => void;
}

export default function DropdownRoot({ children, onSelect, ...props }: DropdownRootProps) {
  return (
    <DropdownContextProvider onSelect={onSelect}>
      <DropdownWrapper {...props}>{children}</DropdownWrapper>
    </DropdownContextProvider>
  );
}

DropdownRoot.displayName = 'Dropdown';

export const Dropdown = Object.assign(DropdownRoot, {
  Trigger: DropdownTrigger,
  Menu: DropdownMenu,
  Option: DropdownOption,
  Icon: DropdownIcon,
  Value: DropdownValue,
});
