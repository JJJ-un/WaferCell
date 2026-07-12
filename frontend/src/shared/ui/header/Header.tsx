import { Link } from "@tanstack/react-router";
import UserIcon from "@/shared/asset/icons/user.svg?react";

const NAV_ITEMS = [
  { to: "/diary", label: "Diary", icon: UserIcon },
];

export const Header = () => {
  return (
    <div className="h-[65px] bg-header flex items-center px-[40px] top-0 sticky z-[200]">
      <div className="flex-1">
        <Link to="/" className="cursor-pointer hover:opacity-90 transition-opacity">
          <span className='text-[24px] font-semibold text-foreground'>WaferCell</span>
        </Link>
      </div>
      <div className="flex items-center gap-8">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="text-foreground hover:text-text-primary transition-colors flex items-center justify-center cursor-pointer"
          >
            {item.icon ? (
              <item.icon className="w-8 h-8 stroke-current" />
            ) : (
              item.label
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}