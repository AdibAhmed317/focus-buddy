import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProBadge } from '@/components/ProBadge';
import { usePro } from '@/contexts/ProContext';
import {
  Check,
  Crown,
  Sparkles,
  Timer,
  BarChart3,
  Shield,
  Save,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: BarChart3,
    title: 'Unlimited Analytics',
    description:
      'Track all your focus sessions with detailed statistics, charts, and insights.',
    free: 'No access',
    pro: 'Unlimited history',
  },
  {
    icon: Shield,
    title: 'Website Blocking',
    description:
      'Block distracting websites during focus sessions to stay on track.',
    free: 'Up to 3 sites',
    pro: 'Unlimited sites',
  },
  {
    icon: Save,
    title: 'Focus Presets',
    description: 'Save and quickly apply your favorite focus configurations.',
    free: 'Up to 2 presets',
    pro: 'Unlimited presets',
  },
  {
    icon: Sparkles,
    title: 'Priority Support',
    description: 'Get fast responses and help from our dedicated support team.',
    free: 'Community support',
    pro: 'Priority email support',
  },
];

export default function Upgrade() {
  const navigate = useNavigate();
  const { isPro, setProStatus } = usePro();

  const handleUpgrade = async () => {
    // TODO: Integrate with payment provider (ExtensionPay or Paddle)
    // For now, just enable Pro locally for testing
    await setProStatus(true);
    navigate('/');
  };

  const handleManageLicense = () => {
    // TODO: Open license management page
    console.log('Manage license clicked');
  };

  if (isPro) {
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
                onClick={() => navigate('/')}
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

        <div className='w-full flex-1 overflow-auto text-center py-6'>
          <div className='inline-flex items-center justify-center p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full mb-4'>
            <Crown className='w-8 h-8 text-orange-600' />
          </div>
          <h1 className='text-xl font-bold mb-2'>You're a Pro! 🎉</h1>
          <p className='text-sm text-muted-foreground mb-6'>
            Thank you for supporting Focus Buddy. You have access to all premium
            features.
          </p>
          <div className='flex gap-4 justify-center'>
            <Button onClick={() => navigate('/')} variant='outline'>
              Back to Focus
            </Button>
            <Button onClick={handleManageLicense} variant='outline'>
              Manage License
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
              onClick={() => navigate('/')}
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

      <div className='w-full flex-1 overflow-auto'>
        {/* Hero Section */}
        <div className='text-center mb-8'>
          <ProBadge className='mx-auto mb-3' />
          <h1 className='text-2xl font-bold mb-3'>
            Upgrade to Focus Buddy Pro
          </h1>
          <p className='text-base text-muted-foreground mb-6'>
            Unlock powerful features to supercharge your productivity
          </p>

          {/* Pricing Card */}
          <Card className='max-w-md mx-auto w-full bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-orange-200'>
            <CardHeader>
              <CardTitle className='text-2xl'>$4.99</CardTitle>
              <CardDescription className='text-sm'>
                One-time payment • Lifetime access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleUpgrade}
                className='w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-base py-5'
              >
                <Crown className='w-5 h-5 mr-2' />
                Upgrade Now
              </Button>
              <p className='text-xs text-muted-foreground mt-3'>
                30-day money-back guarantee
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Comparison */}
        <div className='mb-8'>
          <h2 className='text-lg font-bold text-center mb-6'>
            What's Included
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className='hover:shadow-lg transition-shadow'>
                  <CardHeader>
                    <div className='flex items-start gap-3'>
                      <div className='p-2 bg-primary/10 rounded-lg flex-shrink-0'>
                        <Icon className='w-5 h-5' />
                      </div>
                      <div className='flex-1'>
                        <CardTitle className='text-base mb-1'>
                          {feature.title}
                        </CardTitle>
                        <CardDescription className='text-xs'>
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between text-xs'>
                        <span className='text-muted-foreground'>Free:</span>
                        <Badge variant='secondary' className='text-xs'>
                          {feature.free}
                        </Badge>
                      </div>
                      <div className='flex items-center justify-between text-xs'>
                        <span className='text-muted-foreground'>Pro:</span>
                        <Badge className='bg-gradient-to-r from-amber-500 to-orange-500 text-xs'>
                          {feature.pro}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <Card className='bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0'>
          <CardContent className='py-8 text-center'>
            <h2 className='text-xl font-bold mb-3'>
              Ready to level up your focus?
            </h2>
            <p className='text-sm text-slate-300 mb-6 max-w-2xl mx-auto'>
              Join thousands of productive users who upgraded to Pro and
              transformed their workflow.
            </p>
            <Button
              onClick={handleUpgrade}
              size='lg'
              className='bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-base px-8'
            >
              <Crown className='w-5 h-5 mr-2' />
              Get Pro for $4.99
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
