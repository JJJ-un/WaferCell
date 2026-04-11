import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/shared/styles/theme.css'
import { DashBoard } from './pages/DashBoard'
import { StompProvider } from './shared/model/contexts/StompContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 
import { NewsFeed } from './widgets/news-feed/NewsFeed'
import { Chart } from './pages/Chart'

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
        <div className="flex flex-col bg-dashboard-bg text-ink-main ">
          <div className="h-16 bg-primary flex items-center p-[24px] top-0 sticky z-200">
             <span className='text-[20px] font-semibold text-text-primary '>WaferCell</span>
          </div>
          <div className="flex">
            <Chart/>
            <div className="w-[340px] bg-primary flex flex-col items-center h-[800px] p-6 mt-[24px] rounded-xl">
              <NewsFeed/>
            </div>
          </div>
        </div>
      </StompProvider>
    </QueryClientProvider>
  </StrictMode>,
)
