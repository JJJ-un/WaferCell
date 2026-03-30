import { type ComponentProps } from 'react';
import { DropdownContextProvider } from '@/shared/model/contexts/DropdownContextProvider';
import { DropdownWrapper } from './DropdownWrapper';
import { DropdownTrigger } from './DropdownTrigger';
import { DropdownMenu } from './DropdownMenu';
import { DropdownOption } from './DropdownOption';
import { DropdownIcon } from './DropdownIcon';
import { DropdownValue } from './DropdownValue';

interface DropdownRootProps extends ComponentProps<typeof DropdownWrapper> {
}

export default function DropdownRoot({ children, className, ...props }: DropdownRootProps) {
  return (
    <DropdownContextProvider>
      <DropdownWrapper className={className} {...props}>{children}</DropdownWrapper>
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