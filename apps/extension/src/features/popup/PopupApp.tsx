import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

export const PopupApp = () => {
  const handleOpen = () => {
    try {
      const url =
        typeof chrome !== 'undefined' && chrome.runtime?.getURL
          ? chrome.runtime.getURL('index.html')
          : '/index.html';

      if (typeof chrome !== 'undefined' && (chrome as any).windows) {
        (chrome as any).windows.create(
          {
            url: url,
            type: 'popup',
            width: 420,
            height: 520,
            focused: true,
          },
          (createdWindow: any) => {
            if (createdWindow?.id) {
              chrome.runtime.sendMessage({
                type: 'REGISTER_FOCUS_WINDOW',
                windowId: createdWindow.id,
                width: 420,
                height: 520,
              });
            }
          },
        );
      } else if (typeof chrome !== 'undefined' && (chrome as any).tabs) {
        (chrome as any).tabs.create({ url });
      } else {
        window.open(url, '_blank', 'width=420,height=520');
      }
    } catch (error) {
      console.error('Error opening focus window:', error);
    }
  };

  return (
    <div className='bg-background p-3'>
      <Toaster />
      <Sonner />
      <div className='flex flex-col items-center gap-3'>
        <img
          src='/logo.png'
          alt='Focus Buddy'
          className='h-12 w-12 rounded-lg'
        />
        <button
          onClick={handleOpen}
          className='h-10 w-full rounded-lg bg-success text-success-foreground shadow-button transition-all hover:opacity-90 active:scale-[0.98]'
        >
          Open Focus Buddy
        </button>
      </div>
    </div>
  );
};
