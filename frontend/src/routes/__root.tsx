import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Heaader } from '@/shared/ui/header/Header'
import { NewsFeed } from '../widgets/news-feed/NewsFeed'

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="flex flex-col bg-background text-ink-main min-h-screen">
        <Heaader />
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
