'use client';

import { useEffect, useState } from 'react';

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="preloader-container">
      <div className="preloader-content">
        <div className="logo-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="128"
            height="128"
            viewBox="0 0 215 48"
            className="logo-animated"
            fill="none"
          >
            <path fill="#BE123C" d="M57.588 9.6h6L73.828 38h-5.2l-2.36-6.88h-11.36L52.548 38h-5.2l10.24-28.4Zm7.16 17.16-4.16-12.16-4.16 12.16h8.32Zm23.694-2.24c-.186-1.307-.706-2.32-1.56-3.04-.853-.72-1.866-1.08-3.04-1.08-1.68 0-2.986.613-3.92 1.84-.906 1.227-1.36 2.947-1.36 5.16s.454 3.933 1.36 5.16c.934 1.227 2.24 1.84 3.92 1.84 1.254 0 2.307-.373 3.16-1.12.854-.773 1.387-1.867 1.6-3.28l5.12.24c-.186 1.68-.733 3.147-1.64 4.4-.906 1.227-2.08 2.173-3.52 2.84-1.413.667-2.986 1-4.72 1-2.08 0-3.906-.453-5.48-1.36-1.546-.907-2.76-2.2-3.64-3.88-.853-1.68-1.28-3.627-1.28-5.84 0-2.24.427-4.187 1.28-5.84.88-1.68 2.094-2.973 3.64-3.88 1.574-.907 3.4-1.36 5.48-1.36 1.68 0 3.227.32 4.64.96 1.414.64 2.56 1.56 3.44 2.76.907 1.2 1.454 2.6 1.64 4.2l-5.12.28Z" />
          </svg>
        </div>

        <div className="business-name">
          <span className="letter" style={{ animationDelay: '0.1s' }}>B</span>
          <span className="letter" style={{ animationDelay: '0.15s' }}>u</span>
          <span className="letter" style={{ animationDelay: '0.2s' }}>s</span>
          <span className="letter" style={{ animationDelay: '0.25s' }}>c</span>
          <span className="letter" style={{ animationDelay: '0.3s' }}>a</span>
          <span className="letter" style={{ animationDelay: '0.35s' }}>n</span>
          <span className="letter" style={{ animationDelay: '0.4s' }}>d</span>
          <span className="letter" style={{ animationDelay: '0.45s' }}>o</span>
          <span className="letter-space" style={{ animationDelay: '0.5s' }}> </span>
          <span className="letter" style={{ animationDelay: '0.55s' }}>A</span>
          <span className="letter" style={{ animationDelay: '0.6s' }}>m</span>
          <span className="letter" style={{ animationDelay: '0.65s' }}>o</span>
          <span className="letter" style={{ animationDelay: '0.7s' }}>r</span>
          <span className="letter" style={{ animationDelay: '0.75s' }}> </span>
          <span className="letter" style={{ animationDelay: '0.8s' }}>E</span>
          <span className="letter" style={{ animationDelay: '0.85s' }}>t</span>
          <span className="letter" style={{ animationDelay: '0.9s' }}>e</span>
          <span className="letter" style={{ animationDelay: '0.95s' }}>r</span>
          <span className="letter" style={{ animationDelay: '1s' }}>n</span>
          <span className="letter" style={{ animationDelay: '1.05s' }}>o</span>
        </div>

        <div className="loading-indicator">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>

      <style jsx>{`
        .preloader-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #ffffff 0%, #fff5f8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeOut 0.6s ease-in-out forwards 2.7s;
        }

        .preloader-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2.5rem;
        }

        .logo-wrapper {
          position: relative;
          width: 128px;
          height: 128px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse-scale 2.5s ease-in-out infinite;
        }

        .logo-animated {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 8px 24px rgba(190, 18, 60, 0.15));
          animation: subtle-glow 2.5s ease-in-out infinite;
        }

        .business-name {
          font-family: var(--font-playfair, 'Playfair Display', serif);
          font-size: 1.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: #BE123C;
          text-align: center;
          line-height: 1.2;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0;
          max-width: 320px;
        }

        .letter {
          display: inline-block;
          animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
        }

        .letter-space {
          width: 0.2em;
          animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
        }

        .loading-indicator {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .dot {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          background-color: #BE123C;
          animation: bounce 1.4s infinite;
        }

        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes fadeOut {
          0% {
            opacity: 1;
            visibility: visible;
          }
          100% {
            opacity: 0;
            visibility: hidden;
          }
        }

        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes subtle-glow {
          0%, 100% {
            filter: drop-shadow(0 8px 24px rgba(190, 18, 60, 0.15));
          }
          50% {
            filter: drop-shadow(0 12px 32px rgba(190, 18, 60, 0.25));
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            opacity: 0.5;
            transform: translateY(0);
          }
          40% {
            opacity: 1;
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}
