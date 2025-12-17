'use client';

import { useEffect, useState } from 'react';

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Don't render anything until mounted on client to avoid hydration mismatch
  if (!isMounted || !isLoading) return null;

  return (
    <div className="preloader-container">
      <div className="preloader-content">
        <div className="logo-wrapper">
          <div className="glow-background"></div>
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Fc70ebb3e5225486399c19406cd27bb43%2F59a2eada7b8c4e53bd373097c8e4162d?format=webp&width=800"
            alt="Buscando Amor Eterno"
            className="rose-image"
          />
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
          width: 160px;
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse-scale 2.5s ease-in-out infinite;
        }

        .glow-background {
          position: absolute;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(190, 18, 60, 0.3) 0%, rgba(190, 18, 60, 0.1) 100%);
          animation: glow-pulse 2.5s ease-in-out infinite;
          z-index: 1;
        }

        .rose-image {
          position: relative;
          width: 140px;
          height: 140px;
          object-fit: contain;
          z-index: 2;
          filter: drop-shadow(0 0 20px rgba(190, 18, 60, 0.4)) drop-shadow(0 0 40px rgba(255, 105, 180, 0.3));
          animation: rose-glow 2.5s ease-in-out infinite;
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

        @keyframes rose-glow {
          0%, 100% {
            filter: drop-shadow(0 0 20px rgba(190, 18, 60, 0.4)) drop-shadow(0 0 40px rgba(255, 105, 180, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 30px rgba(190, 18, 60, 0.6)) drop-shadow(0 0 60px rgba(255, 105, 180, 0.4));
          }
        }

        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 30px rgba(190, 18, 60, 0.3), 0 0 60px rgba(255, 105, 180, 0.2);
          }
          50% {
            box-shadow: 0 0 50px rgba(190, 18, 60, 0.5), 0 0 80px rgba(255, 105, 180, 0.3);
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
