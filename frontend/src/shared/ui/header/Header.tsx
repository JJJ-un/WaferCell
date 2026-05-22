import { Link } from "@tanstack/react-router";

export const Header= () => {
    return (
        <div className="h-[80px] bg-header flex items-center px-[40px] top-0 sticky z-[200]">
          <div className="flex-1">
            <span className='text-[24px] font-semibold text-foreground'>WaferCell</span>
          </div>
          <div className="flex items-center gap-8">
            <Link to="/" className="text-[16px] text-foreground hover:text-text-primary transition-colors">Home</Link>
            <Link to="/chart" className="text-[16px] text-foreground hover:text-text-primary transition-colors">Chart</Link>
          </div>
        </div>
    );
}