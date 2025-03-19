import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { QuantumThemeProvider } from './components/theme/QuantumThemeProvider';
import { DatabaseProvider } from './providers/DatabaseProvider';
import { Dashboard } from './components/dashboard/Dashboard';
import { AppErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      suspense: true
    },
    mutations: {
      retry: 1
    }
  }
});

function App() {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <DatabaseProvider>
          <ThemeProvider>
            <QuantumThemeProvider>
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#333',
                    color: '#fff',
                  },
                }} 
              />
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </QuantumThemeProvider>
          </ThemeProvider>
        </DatabaseProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

export default App;