import { useContext, type ReactNode } from "react";
import { DropdownContext } from "@/shared/model/contexts/DropdownContextProvider";

/**

 * 드롭다운 트리거 안에서 현재 선택된 옵션을 렌더링할 때 사용합니다.  
 * `children`은 render prop로 전달되며, `selectedOption`을 인자로 받습니다.
 *
 * @param {(props: { selectedOption: ReactNode | null }) => ReactNode} children  
 * - 렌더링할 함수를 전달합니다.  
 * - `selectedOption`이 `null`이면 아직 선택된 옵션이 없는 상태입니다.
 */

interface DropdownValueProps {
  children: (props: { selectedOption: ReactNode | null }) => ReactNode;
}

function DropdownValue({ children }: DropdownValueProps) {
  const { selectedOption } = useContext(DropdownContext);

  return (
    <div
    >
      {children({ selectedOption })}
    </div>
  );
}

export { DropdownValue };
