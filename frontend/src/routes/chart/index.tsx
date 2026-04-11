import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/chart/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>개발 진행 중입니다.</div>
}


