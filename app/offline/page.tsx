'use client';

export default function Offline() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50">
      <svg className="w-20 h-20 text-pink-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
      </svg>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Connection Lost</h1>
      <p className="text-center text-gray-600 px-8 mb-8">
        The app was idle too long. Tap refresh to reconnect.
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all"
      >
        Refresh App
      </button>
    </div>
  );
}
