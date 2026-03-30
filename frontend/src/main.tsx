import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/shared/styles/theme.css'
import { DashBoard } from './pages/DashBoard'
import { StompProvider } from './shared/model/contexts/StompContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 
import { NewsFeed } from './widgets/NewsFeed'

const WEBSOCKET_URL = import.meta.env.VITE_WS_URL;

const queryClient = new QueryClient({
  defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

// 레이아웃 임시 배치
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <StompProvider url={WEBSOCKET_URL}>
        <div className="flex flex-col bg-dashboard-bg text-ink-main">
          <div className="h-20 bg-primary flex items-center py-4 top-0 sticky"> 상단 메뉴바</div>
          <div className="flex min-h-screen h-full">
            <DashBoard/>
            <div className="w-[360px] bg-primary flex items-center h-screen px-6 justify-between ml-auto">
              <NewsFeed/>
            </div>
          </div>
        </div>
      </StompProvider>
    </QueryClientProvider>
  </StrictMode>,
)
