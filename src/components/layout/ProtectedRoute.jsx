import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AppShellSkeleton } from '@/components/layout/AppShellSkeleton'

export function ProtectedRoute() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <AppShellSkeleton />
  }

  if (!user || !profile || profile.status !== 'active') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
