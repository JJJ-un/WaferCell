import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({
      to: '/dashboard',
      replace: true, // 히스토리에 남지 않게 교체 (뒤로가기 시 무한 루프 방지)
    })
  },
})
