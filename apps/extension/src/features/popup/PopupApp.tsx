import { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ProProvider } from '../../contexts/ProContext';
import RandomFocusSound from '../../components/RandomFocusSound';
import Analytics from '../../pages/Analytics';
import Blocking from '../../pages/Blocking';
import Presets from '../../pages/Presets';
import { BarChart3, Timer, Shield, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

const queryClient = new QueryClient();

const PopupNav = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('focus');

  return (
    <div className='w-full h-full flex flex-col bg-background overflow-hidden'>
      {/* Header */}
      <div className='flex items-center gap-2 px-3 py-2 border-b border-border'>
        <img src='/logo.png' alt='Focus Buddy' className='w-5 h-5 rounded' />
        <div>
          <h1 className='text-xs font-semibold text-foreground leading-tight'>
            Focus Buddy
          </h1>
          <p className='text-xs text-muted-foreground leading-tight'>
            Stay focused with random reminders
          </p>
        </div>
      </div>

      {/* Tabs - Much smaller */}
      <div className='flex items-center gap-0.5 px-2 py-1 border-b border-border bg-card overflow-x-auto'>
        <Button
          variant={currentPage === 'focus' ? 'default' : 'ghost'}
          size='sm'
          className='gap-0.5 text-[10px] px-1.5 py-1 h-6 min-w-fit justify-center flex-shrink-0 whitespace-nowrap'
          onClick={() => {
            setCurrentPage('focus');
            navigate('/');
          }}
        >
          <Timer className='w-3 h-3' />
          <span>Focus</span>
        </Button>
        <Button
          variant={currentPage === 'blocking' ? 'default' : 'ghost'}
          size='sm'
          className='gap-0.5 text-[10px] px-1.5 py-1 h-6 min-w-fit justify-center flex-shrink-0 whitespace-nowrap'
          onClick={() => {
            setCurrentPage('blocking');
            navigate('/blocking');
          }}
        >
          <Shield className='w-3 h-3' />
          <span>Blocking</span>
        </Button>
        <Button
          variant={currentPage === 'analytics' ? 'default' : 'ghost'}
          size='sm'
          className='gap-0.5 text-[10px] px-1.5 py-1 h-6 min-w-fit justify-center flex-shrink-0 whitespace-nowrap'
          onClick={() => {
            setCurrentPage('analytics');
            navigate('/analytics');
          }}
        >
          <BarChart3 className='w-3 h-3' />
          <span>Analytics</span>
        </Button>
        <Button
          variant={currentPage === 'presets' ? 'default' : 'ghost'}
          size='sm'
          className='gap-0.5 text-[10px] px-1.5 py-1 h-6 min-w-fit justify-center flex-shrink-0 whitespace-nowrap'
          onClick={() => {
            setCurrentPage('presets');
            navigate('/presets');
          }}
        >
          <Save className='w-3 h-3' />
          <span>Presets</span>
        </Button>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto'>
        <Routes>
          <Route path='/' element={<RandomFocusSound />} />
          <Route path='/analytics' element={<Analytics />} />
          <Route path='/blocking' element={<Blocking />} />
          <Route path='/presets' element={<Presets />} />
        </Routes>
      </div>
    </div>
  );
};

export const PopupApp = () => {
  return (
    <div className='bg-background w-full h-full'>
      <QueryClientProvider client={queryClient}>
        <ProProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <MemoryRouter>
              <PopupNav />
            </MemoryRouter>
          </TooltipProvider>
        </ProProvider>
      </QueryClientProvider>
    </div>
  );
};
