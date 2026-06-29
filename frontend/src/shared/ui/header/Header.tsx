import { Link } from "@tanstack/react-router";

export const Header= () => {
    return (
        <div className="h-[80px] bg-header flex items-center px-[40px] top-0 sticky z-[200]">
          <div className="flex-1">
            <Link to="/" className="cursor-pointer hover:opacity-90 transition-opacity">
              <span className='text-[24px] font-semibold text-foreground'>WaferCell</span>
            </Link>
          </div>
          <div className="flex items-center gap-8">
            <Link to="/" className="text-[16px] text-foreground hover:text-text-primary transition-colors">Home</Link>
            <Link to="/diary" className="text-[16px] text-foreground hover:text-text-primary transition-colors">My Diary</Link>
          </div>
        </div>
    );
}