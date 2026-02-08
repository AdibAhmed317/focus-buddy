'use client';

import { useState } from 'react';
import Link from 'next/link';

const proFeatures = [
  {
    title: 'Focus History & Stats',
    benefit: 'See how much you actually focus with calm, clear summaries.',
    detail: 'Daily and weekly summaries, build focus streaks.',
  },
  {
    title: 'Website Blocking',
    benefit: 'Block distracting sites while focusing, without harsh limits.',
    detail: 'Unlimited blocklist, optional strict mode.',
  },
  {
    title: 'Focus Presets & Scheduling',
    benefit: 'Save your favorite focus setups and let them start on time.',
    detail: 'Auto-start focus sessions when you are ready.',
  },
  {
    title: 'Pro Extras',
    benefit: 'Priority future features and a way to support indie work.',
    detail: 'Help keep Focus Buddy sustainable.',
  },
];

export function PricingSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  const openModal = () => {
    setIsOpen(true);
    setStep(1);
  };

  const closeModal = () => {
    setIsOpen(false);
    setStep(1);
  };

  return (
    <section className='mx-auto w-full max-w-6xl px-6 pb-20' id='pricing'>
      <div className='rounded-3xl bg-gradient-to-br from-[#edf3ec] via-[#f6f8f3] to-[#eef3ec] p-10 shadow-[0_20px_50px_rgba(46,60,52,0.12)]'>
        <div className='flex flex-col gap-3 text-center'>
          <p className='text-sm uppercase tracking-[0.3em] text-[#7f9588]'>
            Pricing
          </p>
          <h2 className='text-3xl font-semibold text-[#2f3a34]'>
            Simple, fair, and low-risk.
          </h2>
          <p className='text-sm text-[#5a675f]'>
            Choose the calm that fits your focus style.
          </p>
        </div>
        <div className='mt-10 grid gap-6 md:grid-cols-2'>
          <div className='rounded-3xl bg-white p-8 shadow-[0_14px_28px_rgba(46,60,52,0.12)]'>
            <p className='text-sm font-semibold uppercase tracking-[0.2em] text-[#8ca096]'>
              Free
            </p>
            <p className='mt-4 text-4xl font-semibold text-[#2f3a34]'>$0</p>
            <p className='mt-2 text-sm text-[#6a766f]'>
              Everything you need to get started.
            </p>
            <ul className='mt-6 space-y-3 text-sm text-[#56645c]'>
              <li className='flex items-start gap-3'>
                <span className='mt-1 h-2 w-2 rounded-full bg-[#6f8c78]' />
                <span>Random focus reminders</span>
              </li>
              <li className='flex items-start gap-3'>
                <span className='mt-1 h-2 w-2 rounded-full bg-[#6f8c78]' />
                <span>Built-in focus sounds</span>
              </li>
              <li className='flex items-start gap-3'>
                <span className='mt-1 h-2 w-2 rounded-full bg-[#6f8c78]' />
                <span>Custom sound upload</span>
              </li>
              <li className='flex items-start gap-3'>
                <span className='mt-1 h-2 w-2 rounded-full bg-[#6f8c78]' />
                <span>Runs quietly in the background</span>
              </li>
            </ul>
            <Link
              href='https://chrome.google.com/webstore'
              target='_blank'
              rel='noreferrer'
              className='mt-6 inline-flex w-full items-center justify-center rounded-full border border-[#d5ddd6] bg-[#f6f8f4] px-6 py-3 text-base font-semibold text-[#4f6d5a] transition hover:bg-[#eef2ec]'
            >
              Add to Chrome
            </Link>
          </div>
          <div className='rounded-3xl border border-[#d7e2d8] bg-white p-8 shadow-[0_18px_36px_rgba(46,60,52,0.18)]'>
            <div className='flex items-center justify-between gap-4'>
              <p className='text-sm font-semibold uppercase tracking-[0.2em] text-[#8ca096]'>
                Focus Buddy Pro
              </p>
              <span className='rounded-full bg-[#e6efe7] px-3 py-1 text-xs font-semibold text-[#5f7f6a]'>
                Indie-built · Privacy-first
              </span>
            </div>
            <p className='mt-4 text-4xl font-semibold text-[#2f3a34]'>
              $4.99 one-time
            </p>
            <p className='mt-2 text-sm text-[#6a766f]'>
              Pay once. Use forever. No subscriptions.
            </p>
            <ul className='mt-6 space-y-3 text-sm text-[#56645c]'>
              <li className='flex items-start gap-3'>
                <span className='mt-1 h-2 w-2 rounded-full bg-[#6f8c78]' />
                <span>Focus history and productivity stats</span>
              </li>
              <li className='flex items-start gap-3'>
                <span className='mt-1 h-2 w-2 rounded-full bg-[#6f8c78]' />
                <span>Website blocking during focus</span>
              </li>
              <li className='flex items-start gap-3'>
                <span className='mt-1 h-2 w-2 rounded-full bg-[#6f8c78]' />
                <span>Focus presets and scheduling</span>
              </li>
              <li className='flex items-start gap-3'>
                <span className='mt-1 h-2 w-2 rounded-full bg-[#6f8c78]' />
                <span>Priority future features</span>
              </li>
            </ul>
            <button
              type='button'
              onClick={openModal}
              className='mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#4f6d5a] px-6 py-3 text-base font-semibold text-white shadow-[0_10px_24px_rgba(63,95,76,0.28)] transition hover:bg-[#3f5f4c]'
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
        <p className='mt-8 text-center text-sm text-[#6a766f]'>
          No ads. No tracking. Your data stays in your browser.
        </p>
      </div>

      {isOpen ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-[#1b221f]/40 px-6 py-10 backdrop-blur-sm'>
          <div className='w-full max-w-3xl rounded-3xl bg-white p-8 shadow-[0_24px_60px_rgba(46,60,52,0.24)]'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <p className='text-sm uppercase tracking-[0.3em] text-[#8ca096]'>
                  Focus Buddy Pro
                </p>
                <h3 className='mt-3 text-2xl font-semibold text-[#2f3a34]'>
                  {step === 1 && 'Unlock Focus Buddy Pro'}
                  {step === 2 && 'Confirm pricing'}
                  {step === 3 && 'Secure checkout'}
                  {step === 4 && 'All set'}
                </h3>
              </div>
              <button
                type='button'
                onClick={closeModal}
                className='rounded-full border border-[#e3e8e0] px-3 py-1 text-xs font-semibold text-[#6a766f] transition hover:bg-[#f2f4ef]'
              >
                Close
              </button>
            </div>

            {step === 1 ? (
              <div className='mt-8 space-y-6'>
                <p className='text-sm text-[#66746b]'>
                  Powerful tools to protect your focus — without adding stress.
                </p>
                <div className='grid gap-4 md:grid-cols-2'>
                  {proFeatures.map((feature) => (
                    <div
                      key={feature.title}
                      className='rounded-2xl border border-[#e6ece4] bg-[#fbfcfa] p-5'
                    >
                      <div className='flex items-start gap-3'>
                        <span className='mt-1 flex h-9 w-9 items-center justify-center rounded-2xl bg-[#e6efe7] text-[#5f7f6a]'>
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
                        </span>
                        <div>
                          <p className='text-sm font-semibold text-[#2f3a34]'>
                            {feature.title}
                          </p>
                          <p className='mt-1 text-sm text-[#6a766f]'>
                            {feature.benefit}
                          </p>
                          <p className='mt-2 text-xs text-[#8a968f]'>
                            {feature.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <button
                    type='button'
                    onClick={() => setStep(2)}
                    className='inline-flex items-center justify-center rounded-full bg-[#4f6d5a] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(63,95,76,0.22)] transition hover:bg-[#3f5f4c]'
                  >
                    Continue to pricing
                  </button>
                  <button
                    type='button'
                    onClick={closeModal}
                    className='text-sm font-semibold text-[#6a766f] transition hover:text-[#3f5f4c]'
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className='mt-8 space-y-6'>
                <div className='rounded-2xl bg-[#f7f9f4] p-6'>
                  <p className='text-3xl font-semibold text-[#2f3a34]'>
                    $4.99 one-time
                  </p>
                  <p className='mt-2 text-sm text-[#6a766f]'>
                    Pay once. Use forever. No subscriptions.
                  </p>
                </div>
                <p className='text-sm text-[#7b887f]'>
                  Indie-built · Privacy-first · No ads
                </p>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <button
                    type='button'
                    onClick={() => setStep(3)}
                    className='inline-flex items-center justify-center rounded-full bg-[#4f6d5a] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(63,95,76,0.22)] transition hover:bg-[#3f5f4c]'
                  >
                    Upgrade to Pro
                  </button>
                  <button
                    type='button'
                    onClick={closeModal}
                    className='text-sm font-semibold text-[#6a766f] transition hover:text-[#3f5f4c]'
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className='mt-8 space-y-6'>
                <div className='rounded-2xl border border-[#e1e7df] bg-[#fbfcfa] p-6'>
                  <p className='text-sm font-semibold text-[#2f3a34]'>
                    Focus Buddy Pro
                  </p>
                  <p className='mt-2 text-2xl font-semibold text-[#2f3a34]'>
                    $4.99 one-time
                  </p>
                  <p className='mt-2 text-sm text-[#6a766f]'>
                    Payment methods and secure checkout live here.
                  </p>
                </div>
                <p className='text-sm text-[#6a766f]'>
                  No surprises. You will see everything before paying.
                </p>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <button
                    type='button'
                    onClick={() => setStep(4)}
                    className='inline-flex items-center justify-center rounded-full bg-[#4f6d5a] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(63,95,76,0.22)] transition hover:bg-[#3f5f4c]'
                  >
                    Open secure checkout
                  </button>
                  <button
                    type='button'
                    onClick={() => setStep(2)}
                    className='text-sm font-semibold text-[#6a766f] transition hover:text-[#3f5f4c]'
                  >
                    Back
                  </button>
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div className='mt-8 space-y-5'>
                <div className='rounded-2xl bg-[#f2f6ef] p-6'>
                  <p className='text-xl font-semibold text-[#2f3a34]'>
                    You are now using Focus Buddy Pro.
                  </p>
                  <p className='mt-2 text-sm text-[#6a766f]'>
                    Pro features unlock instantly.
                  </p>
                </div>
                <div className='rounded-2xl border border-[#dbe4dc] bg-white p-4 text-sm text-[#5f7f6a]'>
                  Thanks for supporting Focus Buddy.
                </div>
                <button
                  type='button'
                  onClick={closeModal}
                  className='inline-flex items-center justify-center rounded-full bg-[#4f6d5a] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(63,95,76,0.22)] transition hover:bg-[#3f5f4c]'
                >
                  Done
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
