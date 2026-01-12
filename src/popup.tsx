import { createRoot } from 'react-dom/client';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RandomFocusSound from '@/components/RandomFocusSound';
import './index.css';

const queryClient = new QueryClient();

const Popup = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className='bg-background flex items-center justify-center p-4'>
        <RandomFocusSound />
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById('root')!).render(<Popup />);
