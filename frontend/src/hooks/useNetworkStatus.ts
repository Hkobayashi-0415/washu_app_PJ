import { useEffect, useState } from 'react';

type NetworkStatus = {
  isOnline: boolean;
  lastChangedAt: number | null;
};

export const useNetworkStatus = (): NetworkStatus => {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [lastChangedAt, setLastChangedAt] = useState<number | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      setLastChangedAt(Date.now());
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return { isOnline, lastChangedAt };
};
