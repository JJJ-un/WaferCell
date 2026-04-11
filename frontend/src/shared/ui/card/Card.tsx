import { type ReactNode } from 'react';

// 1. Props 타입 정의
interface CardProps {
  children: ReactNode;                  // React 요소 타입           
  className?: string;
}

const Card = ({ 
  children, 
  className,
}: CardProps) => {
  
  return (
    <div className={`
      bg-primary
      border-none
      p-6
      rounded-lg
      overflow-hidden
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;