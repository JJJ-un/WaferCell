import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/shared/styles/theme.css'
import { DashBoard } from './pages/DashBoard'
import { StompProvider } from './shared/model/contexts/StompContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 

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
          <div className="h-20 bg-primary flex items-center py-4"> 상단 메뉴바</div>
          <div className="flex min-h-screen h-full">
            <div className="w-[80px] bg-primary flex items-center h-screen px-6 justify-between sticky"> 사이드바</div>
            <DashBoard/>
            <div className="w-[360px] bg-primary flex items-center h-screen px-6 justify-between sticky ml-auto"> 뉴스 및 상태</div>
          </div>
        </div>
      </StompProvider>
    </QueryClientProvider>
  </StrictMode>,
)
