import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import '@fontsource-variable/inter'
import '@fontsource-variable/fraunces'
import './index.css'

import App from './App'
import { AuthProvider } from '@/hooks/use-auth'
import { ThemeProvider, useTheme } from '@/hooks/use-theme'
import { TooltipProvider } from '@/components/ui/tooltip'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function ThemedToaster() {
  const { theme } = useTheme()
  return (
    <Toaster
      richColors
      position="top-right"
      closeButton
      theme={theme === 'dark' ? 'dark' : 'light'}
    />
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('No se encontró el elemento #root')

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider delayDuration={200}>
              <App />
              <ThemedToaster />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
