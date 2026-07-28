import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Header } from '@/shared/ui/header/Header'

const RootComponent = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-ink-main">
      <Header />
      <main className="flex-1 h-full min-h-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
