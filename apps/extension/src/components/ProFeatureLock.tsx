import { Lock, Crown } from 'lucide-react';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { ProBadge } from './ProBadge';

interface ProFeatureLockProps {
  featureName: string;
  description: string;
  onUpgrade: () => void;
  children?: React.ReactNode;
  isLocked: boolean;
}

export function ProFeatureLock({
  featureName,
  description,
  onUpgrade,
  children,
  isLocked,
}: ProFeatureLockProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <Card className='relative overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50 backdrop-blur-sm z-10' />
      <CardHeader className='relative z-20'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <Lock className='w-5 h-5 text-amber-600' />
            {featureName}
          </CardTitle>
          <ProBadge />
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='relative z-20'>
        <Button
          onClick={onUpgrade}
          className='w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
        >
          <Crown className='w-4 h-4 mr-2' />
          Upgrade to Pro
        </Button>
      </CardContent>
    </Card>
  );
}
