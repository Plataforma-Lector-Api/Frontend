import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { AdminContentsPage } from '@/pages/admin-contents'
import { AdminDashboardPage } from '@/pages/admin-dashboard'
import { AdminUsersPage } from '@/pages/admin-users'
import { CatalogPage } from '@/pages/catalog'
import { ContentDetailPage } from '@/pages/content-detail'
import { HomePage } from '@/pages/home'
import { LibraryPage } from '@/pages/library'
import { LoginPage } from '@/pages/login'
import { NotFoundPage } from '@/pages/not-found'
import { ProfilePage } from '@/pages/profile'
import { QueriesPage } from '@/pages/queries'
import { ReaderPage } from '@/pages/reader'
import { RegisterPage } from '@/pages/register'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return null
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/contenido/:contentId" element={<ContentDetailPage />} />
          <Route path="/consultas" element={<QueriesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />

          <Route
            path="/biblioteca"
            element={
              <ProtectedRoute>
                <LibraryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leer/:contentId"
            element={
              <ProtectedRoute>
                <ReaderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/contenidos"
            element={
              <ProtectedRoute adminOnly>
                <AdminContentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute adminOnly>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      <Footer />
    </div>
  )
}
