import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from '@/components/ui/toaster'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AdminRoute } from '@/components/layout/AdminRoute'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ResetPassword from '@/pages/ResetPassword'
import Home from '@/pages/Home'
import News from '@/pages/News'
import Documents from '@/pages/Documents'
import Products from '@/pages/Products'
import ProductNew from '@/pages/ProductNew'
import ProductDetail from '@/pages/ProductDetail'
import Onboarding from '@/pages/Onboarding'
import Contacts from '@/pages/Contacts'
import Ideas from '@/pages/Ideas'
import PollDetail from '@/pages/PollDetail'
import Team from '@/pages/Team'
import Admin from '@/pages/Admin'
import Profile from '@/pages/Profile'

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/news" element={<News />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/new" element={<ProductNew />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/ideas" element={<Ideas />} />
              <Route path="/polls/:id" element={<PollDetail />} />
              <Route path="/team" element={<Team />} />
              <Route path="/profile" element={<Profile />} />

              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </HashRouter>
      <Toaster />
    </AuthProvider>
  )
}
