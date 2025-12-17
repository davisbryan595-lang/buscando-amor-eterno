'use client'

export default function Features() {
  return (
    <section className="py-16 md:py-20 px-4 bg-white border-4 border-red-500">
      <div className="w-full max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-center mb-3 md:mb-4 text-slate-900">
          Why Choose Buscando Amor Eterno
        </h2>
        <p className="text-center text-slate-600 mb-10 md:mb-12 text-base md:text-lg">
          The platform designed to help you find your soulmate
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          <div className="p-6 md:p-8 rounded-xl bg-gradient-to-br from-white to-rose-50 border border-rose-100 hover:soft-glow transition">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 text-white">❤️</div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Smart Matching</h3>
            <p className="text-sm md:text-base text-slate-600">Our algorithm finds compatible partners based on your values and interests.</p>
          </div>
          <div className="p-6 md:p-8 rounded-xl bg-gradient-to-br from-white to-rose-50 border border-rose-100 hover:soft-glow transition">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 text-white">💬</div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Real Conversations</h3>
            <p className="text-sm md:text-base text-slate-600">Chat with matches instantly and build meaningful connections.</p>
          </div>
          <div className="p-6 md:p-8 rounded-xl bg-gradient-to-br from-white to-rose-50 border border-rose-100 hover:soft-glow transition">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 text-white">📹</div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Video Dates</h3>
            <p className="text-sm md:text-base text-slate-600">Meet face-to-face virtually before deciding to meet in person.</p>
          </div>
          <div className="p-6 md:p-8 rounded-xl bg-gradient-to-br from-white to-rose-50 border border-rose-100 hover:soft-glow transition">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 text-white">👥</div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Global Community</h3>
            <p className="text-sm md:text-base text-slate-600">Connect with singles from over 100 countries worldwide.</p>
          </div>
          <div className="p-6 md:p-8 rounded-xl bg-gradient-to-br from-white to-rose-50 border border-rose-100 hover:soft-glow transition">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 text-white">🔒</div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Verified Profiles</h3>
            <p className="text-sm md:text-base text-slate-600">All members are verified to ensure authenticity and safety.</p>
          </div>
          <div className="p-6 md:p-8 rounded-xl bg-gradient-to-br from-white to-rose-50 border border-rose-100 hover:soft-glow transition">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 text-white">⚡</div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Instant Notifications</h3>
            <p className="text-sm md:text-base text-slate-600">Never miss a message with real-time notifications.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
