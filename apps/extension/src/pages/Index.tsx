import RandomFocusSound from '@/components/RandomFocusSound';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Timer, Settings, List, Shield, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-background p-2 md:p-4 flex flex-col'>
      {/* Navigation Bar */}
      <div className='w-full mb-4'>
        <div className='flex items-center justify-center bg-card rounded-lg px-2 py-2 border border-border overflow-x-auto'>
          <div className='flex gap-2 md:gap-3 flex-shrink-0'>
            <Button
              variant='ghost'
              size='sm'
              className='gap-1.5 md:gap-2 text-xs md:text-sm px-3 py-2 h-10 justify-center'
            >
              <Timer className='w-3 h-3 md:w-4 md:h-4' />
              <span className='hidden sm:inline'>Focus</span>
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='gap-1.5 md:gap-2 text-xs md:text-sm px-3 py-2 h-9 justify-center'
              onClick={() => navigate('/analytics')}
            >
              <BarChart3 className='w-3 h-3 md:w-4 md:h-4' />
              <span className='hidden sm:inline'>Analytics</span>
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='gap-1.5 md:gap-2 text-xs md:text-sm px-3 py-2 h-9 justify-center'
              onClick={() => navigate('/blocking')}
            >
              <Shield className='w-3 h-3 md:w-4 md:h-4' />
              <span className='hidden sm:inline'>Blocking</span>
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='gap-1.5 md:gap-2 text-xs md:text-sm px-3 py-2 h-9 justify-center'
              onClick={() => navigate('/presets')}
            >
              <Save className='w-3 h-3 md:w-4 md:h-4' />
              <span className='hidden sm:inline'>Presets</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='w-full flex-1 overflow-auto'>
        <div className='rounded-2xl shadow-medium overflow-hidden border border-border bg-card'>
          <RandomFocusSound />
        </div>
      </div>
    </div>
  );
};

export default Index;
