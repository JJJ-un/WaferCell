import { createRootRoute, Outlet } from '@tanstack/react-router'
import { NewsFeed } from '../widgets/news-feed/NewsFeed'

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="flex flex-col bg-dashboard-bg text-ink-main min-h-screen">
        <div className="h-16 bg-primary flex items-center p-[24px] top-0 sticky z-[200]">
           <span className='text-[20px] font-semibold text-text-primary '>WaferCell</span>
        </div>
        <div className="flex">
          <div className="flex-1">
            <Outlet />
          </div>
          <div className="w-[340px] bg-primary flex flex-col items-center h-[800px] p-6 mt-[24px] mr-[24px] rounded-xl">
            <NewsFeed/>
          </div>
        </div>
      </div>
    </>
  ),
})
