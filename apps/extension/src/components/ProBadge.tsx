import { Crown } from 'lucide-react';
import { Badge } from './ui/badge';

export function ProBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant='default'
      className={`bg-gradient-to-r from-amber-500 to-orange-500 text-white ${className}`}
    >
      <Crown className='w-3 h-3 mr-1' />
      PRO
    </Badge>
  );
}
