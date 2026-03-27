import { type ReactNode } from 'react';

// 1. Props 타입 정의
interface CardProps {
  children: ReactNode;                  // React 요소 타입
  width?: string;                       // 선택적 prop
  variant?: 'secondary' | 'transparent'; // 허용된 문자열만 가능하도록 제한
  hasBorder?: boolean;
  className?: string;
}

const Card = ({ 
  children, 
  width = "w-full", 
  variant = "secondary", 
  hasBorder = true, 
  className = "" 
}: CardProps) => {
  
  // 2. 배경색 스타일 객체 (Key를 variant 타입으로 제한)
  const bgStyles: Record<'secondary' | 'transparent', string> = {
    secondary: "bg-slate-100",
    transparent: "bg-transparent"
  };

  const borderStyles = hasBorder ? "border border-slate-200" : "border-none";

  return (
    <div className={`
      ${width}
      ${bgStyles[variant]}
      ${borderStyles}
      p-6
      rounded-2xl
      overflow-hidden
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;