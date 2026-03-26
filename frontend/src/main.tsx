import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { DashBoard } from './pages/DashBoard'
import { StompProvider } from './shared/model/contexts/StompContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 

const WEBSOCKET_URL = import.meta.env.VITE_WS_URL;

const queryClient = new QueryClient({
  defaultOptions: {
      queries: {
        refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 리페치 방지 (선택 사항)
        retry: 1, // 실패 시 재시도 횟수
      },
    },
  });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <StompProvider url={WEBSOCKET_URL}>
        <DashBoard/>
      </StompProvider>
    </QueryClientProvider>
  </StrictMode>,
)
