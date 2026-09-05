import React from 'react';
import { Button, Result, Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEYS } from '../../constants/storageKeys';

export const Error401: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBackToLogin = () => {
    localStorage.removeItem(STORAGE_KEYS.PORTAL_SESSION);
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Result
        status="403"
        title="401 - Unauthorized (Token Hết Hạn)"
        subTitle={t('error_401_subtitle', 'Phiên làm việc JWT đã HẾT HẠN hoặc không tìm thấy Bearer Token hợp lệ. Vui lòng đăng nhập lại để tiếp tục.')}
        extra={[
          <Button type="primary" key="login" onClick={handleBackToLogin} className="bg-blue-600 font-bold px-6">
            {t('back_to_login', 'Xác nhận & Đăng nhập lại')}
          </Button>
        ]}
      />
    </div>
  );
};

export const Error403: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Result
        status="403"
        title="403 - Forbidden Access"
        subTitle={t('error_403_subtitle', 'Tài khoản của bạn không có Quyền hạn (Scope / Button Permission) để truy cập hoặc thao tác trên URL/tính năng này.')}
        extra={[
          <Button type="primary" key="home" onClick={() => navigate('/')} className="bg-blue-600">
            {t('back_home', 'Quay lại Trang chủ')}
          </Button>,
          <Button key="access-control" onClick={() => navigate('/system/access-control')}>
            Xem danh sách quyền
          </Button>
        ]}
      />
    </div>
  );
};

export const Error404: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <Result
      status="404"
      title="404"
      subTitle={t('error_404_subtitle', 'Xin lỗi, trang bạn truy cập không tồn tại.')}
      extra={<Button type="primary" onClick={() => navigate('/')}>{t('back_home', 'Quay lại trang chủ')}</Button>}
    />
  );
};

export const Error500: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <Result
      status="500"
      title="500"
      subTitle={t('error_500_subtitle', 'Xin lỗi, có lỗi xảy ra từ phía máy chủ.')}
      extra={<Button type="primary" onClick={() => navigate('/')}>{t('back_home', 'Quay lại trang chủ')}</Button>}
    />
  );
};

export const Error503: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <Result
      status="500" // Result doesn't have 503 status, using 500
      title="503"
      subTitle={t('error_503_subtitle', 'Hệ thống đang quá tải hoặc đang bảo trì.')}
      extra={<Button type="primary" onClick={() => window.location.reload()}>{t('retry', 'Thử lại')}</Button>}
    />
  );
};

export const Maintenance: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Layout style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
      <Result
        status="info"
        title={t('maintenance_title', 'Hệ thống đang bảo trì')}
        subTitle={t('maintenance_subtitle', 'Chúng tôi đang nâng cấp hệ thống để phục vụ bạn tốt hơn. Vui lòng quay lại sau.')}
      />
    </Layout>
  );
};

export const Upgrading: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Layout style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
      <Result
        status="warning"
        title={t('upgrading_title', 'Đang nâng cấp hệ thống')}
        subTitle={t('upgrading_subtitle', 'Vui lòng không tắt trình duyệt trong quá trình nâng cấp.')}
      />
    </Layout>
  );
};
