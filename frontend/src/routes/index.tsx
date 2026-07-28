import { createFileRoute } from '@tanstack/react-router'
import { DashBoard } from './dashboard/index'

export const Route = createFileRoute('/')({
  component: DashBoard,
})
