'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ControlPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [isControlPressed, setIsControlPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        setIsControlPressed(true);
      }
    };

    const handleKeyUp = () => {
      setIsControlPressed(false);
      setShowPopup(false);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isControlPressed) return;

      const { clientX, clientY } = event;
      const { innerWidth, innerHeight } = globalThis;

      const isTopRight =
        clientX > innerWidth * 0.8 && clientY < innerHeight * 0.2;

      setShowPopup(isTopRight);
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    globalThis.addEventListener('keyup', handleKeyUp);
    globalThis.addEventListener('mousemove', handleMouseMove);

    return () => {
      globalThis.removeEventListener('keydown', handleKeyDown);
      globalThis.removeEventListener('keyup', handleKeyUp);
      globalThis.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isControlPressed]);

  if (!showPopup) return null;

  return (
    <div
      className="fixed top-5 right-5 max-w-[300px] p-5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] z-[9999] animate-slideIn"
      style={{
        backgroundColor: 'var(--white)',
        border: '2px solid var(--primary)',
      }}
    >
      <div className="flex flex-col gap-3 items-center">
        <div className="w-20 h-20 rounded-full overflow-hidden relative">
          <Image
            src="/dog.jpg"
            alt="Popup Image"
            width={80}
            height={80}
            className="object-cover w-full h-full"
          />
        </div>

        <div className="text-center">
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Un texte drôle
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
