import React, { useEffect, useState } from 'react';
import { DisconnectOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { message } from '../services/toastMessage';

const NETWORK_STATUS_TOAST_KEY = 'network-status-toast';

export const NetworkStatusNotifier: React.FC = () => {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(() => {
    return typeof navigator === 'undefined' ? true : navigator.onLine;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return undefined;
    }

    const showOffline = () => {
      setIsOnline(false);
      message.warning({
        title: t('network_offline_title'),
        description: t('network_offline_description'),
        key: NETWORK_STATUS_TOAST_KEY,
        duration: 8,
      });
    };

    const showOnline = () => {
      setIsOnline(true);
      message.destroy(NETWORK_STATUS_TOAST_KEY);
      message.success({
        title: t('network_online_title'),
        description: t('network_online_description'),
        key: NETWORK_STATUS_TOAST_KEY,
        duration: 4,
      });
    };

    window.addEventListener('offline', showOffline);
    window.addEventListener('online', showOnline);

    if (!navigator.onLine) {
      showOffline();
    }

    return () => {
      window.removeEventListener('offline', showOffline);
      window.removeEventListener('online', showOnline);
    };
  }, [t]);

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-[1200] flex w-[calc(100%-32px)] max-w-lg -translate-x-1/2 items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-lg"
    >
      <DisconnectOutlined className="text-base text-amber-600" />
      <span className="min-w-0 flex-1 font-medium">{t('network_offline_banner')}</span>
    </div>
  );
};

export default NetworkStatusNotifier;
