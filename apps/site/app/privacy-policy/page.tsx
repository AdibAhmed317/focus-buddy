import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <main className='min-h-screen bg-[#f7f5f0] px-6 py-16'>
      <div className='mx-auto w-full max-w-3xl rounded-3xl bg-white p-10 shadow-[0_16px_36px_rgba(46,60,52,0.12)]'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <p className='text-sm uppercase tracking-[0.3em] text-[#8ca096]'>
            Privacy policy
          </p>
          <Link
            href='/'
            className='rounded-full bg-[#eef3ed] px-4 py-2 text-sm font-semibold text-[#5f7f6a] transition hover:bg-[#e3ede5] hover:text-[#3f5f4c]'
          >
            Back to home
          </Link>
        </div>
        <h1 className='mt-4 text-3xl font-semibold text-[#2f3a34]'>
          Your focus stays private.
        </h1>
        <p className='mt-4 text-sm leading-relaxed text-[#66746b]'>
          Focus Buddy is designed to be lightweight and respectful. We do not
          collect, sell, or share personal data. The extension works entirely on
          your device and does not track your browsing history or activity.
        </p>
        <div className='mt-8 space-y-6 text-sm text-[#66746b]'>
          <section>
            <h2 className='text-lg font-semibold text-[#2f3a34]'>
              Data we collect
            </h2>
            <p className='mt-2'>
              Focus Buddy does not collect personal information, analytics, or
              usage data. There is no account or sign-up required.
            </p>
          </section>
          <section>
            <h2 className='text-lg font-semibold text-[#2f3a34]'>
              Local storage
            </h2>
            <p className='mt-2'>
              Settings like sound choice and focus range are stored locally on
              your device so the extension can remember your preferences.
            </p>
          </section>
          <section>
            <h2 className='text-lg font-semibold text-[#2f3a34]'>Contact</h2>
            <p className='mt-2'>
              If you have questions, reach out at support@focusbuddy.app and I
              will be happy to help.
            </p>
          </section>
        </div>
        <p className='mt-10 text-xs text-[#8a968f]'>
          Last updated: February 5, 2026
        </p>
      </div>
    </main>
  );
}
