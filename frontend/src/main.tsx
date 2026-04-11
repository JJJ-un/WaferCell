import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/shared/styles/theme.css'
import { StompProvider } from './shared/model/contexts/StompContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen';

const WEBSOCKET_URL = import.meta.env.VITE_WS_URL;

const queryClient = new QueryClient({
  defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <StompProvider url={WEBSOCKET_URL}>
        <RouterProvider router={router} />
      </StompProvider>
    </QueryClientProvider>
  </StrictMode>,
)
