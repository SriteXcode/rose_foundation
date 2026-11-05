import { useState, useEffect } from 'react';
import axiosInstance from '../utils/api';

const DEFAULT_UPI_ID = '251908200515@indus';
const DEFAULT_PAYEE_NAME = 'Blackrose Foundation';
const STORAGE_KEY = 'foundation_settings_cache';

export const useFoundationSettings = () => {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Fallback
    }
    return {
      upiId: DEFAULT_UPI_ID,
      upiPayeeName: DEFAULT_PAYEE_NAME,
      qrCodeUrl: '',
      siteName: 'Blackrose Foundation'
    };
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/settings');
        const data = response.data;
        if (isMounted && data) {
          const updated = {
            upiId: (data.upiId && data.upiId.trim()) || DEFAULT_UPI_ID,
            upiPayeeName: (data.upiPayeeName && data.upiPayeeName.trim()) || DEFAULT_PAYEE_NAME,
            qrCodeUrl: data.qrCodeUrl || '',
            siteName: data.siteName || 'Blackrose Foundation'
          };
          setSettings(updated);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          } catch {
            // Ignore storage errors
          }
        }
      } catch (err) {
        console.warn('Could not load dynamic settings, using defaults:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSettings();

    const handleSettingsUpdated = () => {
      fetchSettings();
    };

    window.addEventListener('foundationSettingsUpdated', handleSettingsUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('foundationSettingsUpdated', handleSettingsUpdated);
    };
  }, []);

  return {
    upiId: settings.upiId || DEFAULT_UPI_ID,
    upiPayeeName: settings.upiPayeeName || DEFAULT_PAYEE_NAME,
    qrCodeUrl: settings.qrCodeUrl || '',
    siteName: settings.siteName || 'Blackrose Foundation',
    loading
  };
};

export default useFoundationSettings;
