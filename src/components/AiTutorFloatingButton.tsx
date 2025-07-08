import React, { useState } from 'react';
import AiTutorChat from './AiTutorChat';
import { GraduationCap, Maximize2, Minimize2 } from 'lucide-react';

const AiTutorFloatingButton: React.FC<{ onLeadCreated: (q: string, a: string) => void }> = ({ onLeadCreated }) => {
  const [open, setOpen] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        className="fixed z-50 bottom-6 right-6 bg-gradient-to-br from-pink-500 via-yellow-400 to-blue-500 text-white rounded-full shadow-xl p-4 flex items-center justify-center hover:scale-110 focus:outline-none animate-bounce hover:animate-none transition-transform duration-200 border-4 border-white"
        style={{ boxShadow: '0 6px 32px rgba(80,80,200,0.18)' }}
        onClick={() => setOpen(true)}
        aria-label="Open AI Tutor Chat"
      >
        <GraduationCap className="h-8 w-8 drop-shadow-lg" />
      </button>

      {/* Modal Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black bg-opacity-40 animate-fadeInUp" onClick={() => setOpen(false)}>
          <div
            className={`w-full ${fullScreen ? 'h-full max-w-full md:max-w-full rounded-none' : 'max-w-md md:max-w-lg'} bg-gradient-to-br from-blue-50 to-green-50 md:rounded-2xl rounded-t-2xl shadow-2xl p-0 md:p-4 relative flex flex-col transition-all duration-300`}
            style={{ minHeight: 400, maxHeight: fullScreen ? '100vh' : '80vh', overflow: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Controls */}
            <div className="absolute top-3 right-3 flex gap-2 z-10">
              <button
                className="text-gray-400 hover:text-blue-600 text-2xl font-bold focus:outline-none"
                onClick={() => setOpen(false)}
                aria-label="Close AI Tutor Chat"
              >
                ×
              </button>
              <button
                className="text-gray-400 hover:text-blue-600 text-xl font-bold focus:outline-none bg-white/80 rounded-full p-1 border border-blue-100 shadow"
                onClick={() => setFullScreen(f => !f)}
                aria-label={fullScreen ? 'Exit Full Screen' : 'Full Screen'}
              >
                {fullScreen ? <Minimize2 className="h-6 w-6" /> : <Maximize2 className="h-6 w-6" />}
              </button>
            </div>
            <div className={`flex-1 flex flex-col ${fullScreen ? 'h-full' : ''} pt-8 md:pt-0`}>
              <AiTutorChat onLeadCreated={onLeadCreated} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiTutorFloatingButton; 