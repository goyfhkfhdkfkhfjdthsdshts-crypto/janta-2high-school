'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react';

interface OfflineBannerProps {
  language: 'hi' | 'en';
}

export function OfflineBanner({ language }: OfflineBannerProps) {
  const [isOffline, setIsOffline] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    // Check initial online status
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);

      const handleOffline = () => {
        setIsOffline(true);
        setJustReconnected(false);
      };

      const handleOnline = () => {
        setIsOffline(false);
        setJustReconnected(true);
        const timer = setTimeout(() => setJustReconnected(false), 4000);
        return () => clearTimeout(timer);
      };

      window.addEventListener('offline', handleOffline);
      window.addEventListener('online', handleOnline);

      return () => {
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('online', handleOnline);
      };
    }
  }, []);

  if (justReconnected) {
    return (
      <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-300">
        <Wifi className="w-4 h-4" />
        <span>
          {language === 'hi'
            ? 'इंटरनेट कनेक्शन पुनः स्थापित हो गया है। सभी सुविधाएं ऑनलाइन हैं।'
            : 'Internet reconnected! All online features and live updates are active.'}
        </span>
      </div>
    );
  }

  if (!isOffline) return null;

  return (
    <div className="bg-amber-600 text-white px-4 py-2.5 text-xs font-medium flex items-center justify-between gap-3 shadow-md sticky top-0 z-40 animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 shrink-0 text-amber-200" />
        <span>
          {language === 'hi'
            ? 'ऑफ़लाइन मोड: केवल कैश्ड पाठ्यपुस्तकें और सहेजी गई सामग्री उपलब्ध है। लाइव कक्षा, उपस्थिति और परिणाम के लिए इंटरनेट से जुड़ें।'
            : 'Offline Mode: Browsing cached books & saved bookmarks. Real-time attendance, live class, and results require internet.'}
        </span>
      </div>
      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-black/20 text-white shrink-0">
        {language === 'hi' ? 'ऑफ़लाइन' : 'Offline'}
      </span>
    </div>
  );
}
