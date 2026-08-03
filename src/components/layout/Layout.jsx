import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'

export function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-bg">
      {/* Mobile Top-Bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-bg px-4 md:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-text-sub hover:bg-surface-2"
          aria-label="Menü öffnen"
        >
          <Menu className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary font-display text-[12px] font-extrabold text-white">
          A
        </div>
        <span className="font-display text-[14px] font-bold text-text">Albatros Intranet</span>
      </div>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[240px] border-r border-border md:block">
        <Sidebar />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-y-0 left-0 z-50 w-[240px] border-r border-border md:hidden"
            >
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md text-text-sub hover:bg-surface-2"
                aria-label="Menü schließen"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <Sidebar onNavigate={() => setDrawerOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <main className="pt-14 md:ml-[240px] md:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
