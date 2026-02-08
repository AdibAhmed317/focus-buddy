import Image from 'next/image';
import Link from 'next/link';
import { PricingSection } from './components/PricingSection';

const steps = [
  {
    title: 'Choose a sound',
    description: 'Pick a gentle tone that feels calming and familiar.',
  },
  {
    title: 'Set a focus range',
    description: 'Decide how often you want the soft nudges to appear.',
  },
  {
    title: 'Get gentle reminders',
    description: 'A quiet cue helps you drift back without breaking flow.',
  },
];

const features = [
  'Random focus reminders',
  'Custom sound uploads',
  'Runs quietly in the background',
  'No tracking, no ads',
  'Works even when popup is closed',
];

export default function Home() {
  return (
    <main className='min-h-screen' id='main'>
      <a
        href='#main'
        className='sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:z-50 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#3f5f4c] shadow'
      >
        Skip to content
      </a>
      <div className='relative overflow-hidden'>
        <div className='absolute -top-24 right-0 h-72 w-72 rounded-full bg-[#d7e3d4] blur-3xl opacity-70' />
        <div className='absolute -bottom-32 left-0 h-72 w-72 rounded-full bg-[#cfe0d3] blur-3xl opacity-70' />

        <header className='relative z-10'>
          <nav
            className='mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6'
            aria-label='Primary'
          >
            <div className='flex items-center gap-3'>
              <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-[0_6px_20px_rgba(46,60,52,0.12)]'>
                <Image
                  src='/logo.png'
                  alt='Focus Buddy logo'
                  width={28}
                  height={28}
                  priority
                />
              </div>
              <span className='text-lg font-semibold text-[#2f3a34]'>
                Focus Buddy
              </span>
            </div>
            <div className='hidden items-center gap-8 text-sm text-[#56645c] md:flex'>
              <Link
                href='#features'
                className='transition hover:text-[#3f5f4c]'
              >
                Features
              </Link>
              <Link href='#pricing' className='transition hover:text-[#3f5f4c]'>
                Pricing
              </Link>
              <Link href='#privacy' className='transition hover:text-[#3f5f4c]'>
                Privacy
              </Link>
              <Link
                href='#cta'
                className='rounded-full bg-[#5f7f6a] px-5 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(63,95,76,0.28)] transition hover:bg-[#4f6d5a]'
              >
                Add to Chrome
              </Link>
            </div>
            <Link
              href='#cta'
              className='inline-flex items-center rounded-full bg-[#5f7f6a] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(63,95,76,0.28)] transition hover:bg-[#4f6d5a] md:hidden'
            >
              Add to Chrome
            </Link>
          </nav>
        </header>

        <section className='relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-16 pt-10 md:grid-cols-[1.1fr_0.9fr] md:pt-16'>
          <div className='fade-up'>
            <p className='mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#5f7f6a] shadow-[0_8px_16px_rgba(63,95,76,0.12)]'>
              Calm focus companion
            </p>
            <h1 className='text-4xl font-semibold leading-tight text-[#2f3a34] md:text-5xl'>
              Gentle reminders to bring you back to focus.
            </h1>
            <p className='mt-4 text-lg leading-relaxed text-[#56645c] md:text-xl'>
              Focus Buddy plays soft, random sounds to nudge you back on task —
              without breaking your flow.
            </p>
            <div className='mt-8 flex flex-wrap items-center gap-4'>
              <Link
                href='#cta'
                className='rounded-full bg-[#4f6d5a] px-6 py-3 text-base font-semibold text-white shadow-[0_10px_24px_rgba(63,95,76,0.28)] transition hover:bg-[#3f5f4c]'
              >
                Add to Chrome — It&apos;s Free
              </Link>
              <span className='text-sm text-[#6a766f]'>
                No sign-up required. Lightweight. Privacy-first.
              </span>
            </div>
          </div>

          <div className='fade-up-delayed relative'>
            <div className='float-soft relative rounded-3xl bg-white p-6 shadow-[0_20px_50px_rgba(46,60,52,0.16)]'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-semibold text-[#5f7f6a]'>
                  Now playing
                </span>
                <span className='text-xs text-[#93a29a]'>Soft chime</span>
              </div>
              <div className='mt-6 h-32 rounded-2xl bg-gradient-to-r from-[#cfe0d3] via-[#dfe9dd] to-[#cfe0d3]' />
              <div className='mt-6 space-y-3'>
                <div className='h-3 w-3/4 rounded-full bg-[#d9e3da]' />
                <div className='h-3 w-2/3 rounded-full bg-[#e4ece5]' />
              </div>
              <div className='mt-6 flex items-center gap-4 rounded-2xl bg-[#f5f7f2] px-4 py-3'>
                <div className='h-3 w-3 rounded-full bg-[#6f8c78]' />
                <div className='h-3 w-5 rounded-full bg-[#90a696]' />
                <div className='h-3 w-7 rounded-full bg-[#b1c2b6]' />
                <span className='ml-auto text-xs text-[#748278]'>00:24</span>
              </div>
            </div>
            <div className='absolute -bottom-8 -right-8 hidden w-40 rounded-3xl bg-white p-4 shadow-[0_16px_34px_rgba(46,60,52,0.14)] md:block'>
              <p className='text-xs font-semibold text-[#5f7f6a]'>
                Focus range
              </p>
              <p className='mt-2 text-sm text-[#56645c]'>Every 6-10 min</p>
              <div className='mt-3 h-2 rounded-full bg-[#d8e2da]'>
                <div className='h-2 w-2/3 rounded-full bg-[#7a9784]' />
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className='mx-auto w-full max-w-6xl px-6 py-16' id='features'>
        <div className='mb-10 flex flex-col gap-3 text-center'>
          <p className='text-sm uppercase tracking-[0.3em] text-[#8ca096]'>
            How it works
          </p>
          <h2 className='text-3xl font-semibold text-[#2f3a34]'>
            A small ritual for steady focus.
          </h2>
        </div>
        <div className='grid gap-6 md:grid-cols-3'>
          {steps.map((step) => (
            <div
              key={step.title}
              className='rounded-3xl bg-white p-6 shadow-[0_14px_30px_rgba(46,60,52,0.12)]'
            >
              <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e5eee6] text-[#5f7f6a]'>
                <svg
                  viewBox='0 0 24 24'
                  className='h-5 w-5'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.6'
                  aria-hidden='true'
                >
                  <path d='M12 4v16m8-8H4' strokeLinecap='round' />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-[#2f3a34]'>
                {step.title}
              </h3>
              <p className='mt-2 text-sm leading-relaxed text-[#66746b]'>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className='mx-auto w-full max-w-6xl px-6 pb-20'>
        <div className='grid gap-10 md:grid-cols-[0.9fr_1.1fr]'>
          <div className='rounded-3xl bg-white p-8 shadow-[0_16px_36px_rgba(46,60,52,0.14)]'>
            <h3 className='text-2xl font-semibold text-[#2f3a34]'>
              Designed to stay out of the way.
            </h3>
            <p className='mt-3 text-sm text-[#66746b]'>
              Focus Buddy keeps you centered with soft prompts, never
              interruptions. Let it hum in the background while you work.
            </p>
            <ul className='mt-6 space-y-3 text-sm text-[#56645c]'>
              {features.map((feature) => (
                <li key={feature} className='flex items-start gap-3'>
                  <span className='mt-1 h-2 w-2 rounded-full bg-[#6f8c78]' />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className='grid gap-4'>
            <div className='rounded-3xl border border-[#e1e7df] bg-[#fdfdfc] p-6'>
              <h4 className='text-sm font-semibold uppercase tracking-[0.2em] text-[#8ca096]'>
                Built for calm
              </h4>
              <p className='mt-3 text-lg text-[#2f3a34]'>
                Soft sounds, gentle intervals, and friendly visuals.
              </p>
            </div>
            <div className='rounded-3xl border border-[#e1e7df] bg-[#fdfdfc] p-6'>
              <h4 className='text-sm font-semibold uppercase tracking-[0.2em] text-[#8ca096]'>
                Lightweight
              </h4>
              <p className='mt-3 text-lg text-[#2f3a34]'>
                No clutter, no heavy dashboards, just focus support.
              </p>
            </div>
            <div className='rounded-3xl border border-[#e1e7df] bg-[#fdfdfc] p-6'>
              <h4 className='text-sm font-semibold uppercase tracking-[0.2em] text-[#8ca096]'>
                Private
              </h4>
              <p className='mt-3 text-lg text-[#2f3a34]'>
                Focus Buddy never tracks you. Your data stays yours.
              </p>
            </div>
          </div>
        </div>
      </section>

      <PricingSection />

      <section className='mx-auto w-full max-w-6xl px-6 pb-20'>
        <div className='rounded-3xl bg-white p-10 shadow-[0_18px_40px_rgba(46,60,52,0.12)]'>
          <p className='text-sm uppercase tracking-[0.3em] text-[#8ca096]'>
            Personal story
          </p>
          <p className='mt-4 text-2xl font-semibold text-[#2f3a34]'>
            “I built Focus Buddy after losing an hour to Instagram without
            realizing it.”
          </p>
          <p className='mt-4 text-sm text-[#66746b]'>
            Built by an indie developer who wanted a gentle, trustworthy
            companion for focus.
          </p>
        </div>
      </section>

      <section id='cta' className='mx-auto w-full max-w-6xl px-6 pb-20'>
        <div className='rounded-3xl bg-[#4f6d5a] px-8 py-12 text-white shadow-[0_24px_50px_rgba(63,95,76,0.25)]'>
          <div className='flex flex-col gap-6 md:flex-row md:items-center md:justify-between'>
            <div>
              <h2 className='text-3xl font-semibold'>
                Stay in the flow with Focus Buddy.
              </h2>
              <p className='mt-3 text-sm text-[#dbe7df]'>
                Gentle reminders, light footprint, calm support for focused
                minds.
              </p>
            </div>
            <Link
              href='https://chrome.google.com/webstore'
              target='_blank'
              rel='noreferrer'
              className='inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-[#3f5f4c] shadow-[0_10px_24px_rgba(0,0,0,0.12)] transition hover:opacity-90'
            >
              Add to Chrome — It&apos;s Free
            </Link>
          </div>
        </div>
      </section>

      <footer className='border-t border-[#e0e6de] bg-[#f2f4ef]' id='privacy'>
        <div className='mx-auto w-full max-w-6xl px-6 py-10'>
          <div className='flex flex-col gap-6 md:flex-row md:items-center md:justify-between'>
            <div className='space-y-2 text-sm text-[#66746b]'>
              <p className='font-semibold text-[#2f3a34]'>Focus Buddy</p>
              <p>Built with care for focused minds.</p>
            </div>
            <div className='flex flex-wrap gap-6 text-sm text-[#5b6860]'>
              <Link
                href='/privacy-policy'
                className='transition hover:text-[#3f5f4c]'
              >
                Privacy Policy
              </Link>
              <Link
                href='https://chrome.google.com/webstore'
                target='_blank'
                rel='noreferrer'
                className='transition hover:text-[#3f5f4c]'
              >
                Chrome Web Store
              </Link>
            </div>
          </div>
          <p className='mt-6 text-xs text-[#8a968f]'>
            © 2026 Focus Buddy. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
