import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Focus Buddy</h1>
          <div className="space-x-6">
            <Link href="#features" className="hover:text-blue-600">Features</Link>
            <Link href="#pricing" className="hover:text-blue-600">Pricing</Link>
            <Link href="#contact" className="hover:text-blue-600">Contact</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">Stay Focused, Boost Productivity</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Focus Buddy is your personal attention coach. Stay on track, eliminate distractions, and achieve more with less effort.
        </p>
        <div className="space-x-4">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700">
            Get Started Free
          </button>
          <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50">
            Learn More
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">Why Focus Buddy?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Smart Focus Tracking',
              description: 'Real-time monitoring of your focus sessions with detailed analytics.'
            },
            {
              title: 'Distraction Blocking',
              description: 'Intelligent detection and blocking of distracting websites and apps.'
            },
            {
              title: 'Productivity Insights',
              description: 'Understand your work patterns and optimize your productivity.'
            }
          ].map((feature, idx) => (
            <div key={idx} className="p-6 bg-white rounded-lg shadow">
              <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">Ready to transform your focus?</h3>
          <p className="text-lg mb-8 opacity-90">Join thousands of focused professionals worldwide.</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100">
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Focus Buddy</h4>
              <p className="text-gray-400">Helping you stay focused since 2024.</p>
            </div>
            <div>
              <h5 className="font-bold mb-4">Product</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Features</Link></li>
                <li><Link href="#" className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Company</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">About</Link></li>
                <li><Link href="#" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Legal</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Focus Buddy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
