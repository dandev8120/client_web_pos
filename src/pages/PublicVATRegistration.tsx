import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form, Input, Select, Button, Card, Alert, Result, Spin, Typography, Divider, Badge, Descriptions, Radio, Segmented, Checkbox } from 'antd';
import { FileTextOutlined, DownloadOutlined, SafetyCertificateOutlined, InfoCircleOutlined, ShopOutlined, TransactionOutlined, UserOutlined, BuildOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

export default function PublicVATRegistration() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [form] = Form.useForm();

  // Query parameters
  const oid = searchParams.get('oid');
  const sid = searchParams.get('sid');
  const rid = searchParams.get('rid');
  const o = searchParams.get('o');
  const sig = searchParams.get('sig');
  const a = searchParams.get('a');
  const ct = searchParams.get('ct');

  // Page states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending' | 'issued' | null>(null);
  const [formConfig, setFormConfig] = useState<any>(null);
  const [invoiceType, setInvoiceType] = useState<'enterprise' | 'individual'>('enterprise');
  const [issuedData, setIssuedData] = useState<any>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Helper to format currency
  const formatVND = (value: string | number | null) => {
    if (!value) return '0 VNĐ';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('vi-VN') + ' VNĐ';
  };

  // Check and fetch VAT state
  useEffect(() => {
    if (!oid || !sid || !rid || !sig) {
      // If URL parameters are missing, we don't fetch but don't show full error immediately
      // so the user can use the Demo Testing Panel
      return;
    }

    const fetchVATState = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('/api/vat/verify', {
          params: { oid, sid, rid, o, sig, a, ct }
        });

        const data = response.data;
        if (data.valid) {
          setStatus(data.status);
          if (data.status === 'pending') {
            setFormConfig(data.formConfig);
            if (data.formConfig) {
              if (data.formConfig.enterprise && !data.formConfig.enterprise.enabled && data.formConfig.individual && data.formConfig.individual.enabled) {
                setInvoiceType('individual');
              } else {
                setInvoiceType('enterprise');
              }
            }
          } else if (data.status === 'issued') {
            setIssuedData(data);
          }
        } else {
          setError(data.error || 'Liên kết không hợp lệ hoặc đã hết hạn.');
        }
      } catch (err: any) {
        console.error('Verify error:', err);
        setError(
          err.response?.data?.error || 
          'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVATState();
  }, [oid, sid, rid, o, sig, a, ct]);

  // Handle Form Submission
  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const response = await axios.post('/api/vat/submit', {
        oid,
        sid,
        rid,
        o,
        sig,
        a,
        ct,
        formData: {
          ...values,
          invoiceType // Attach invoice type
        }
      });

      if (response.data.success) {
        // Successfully submitted! Refresh state to "issued"
        setStatus('issued');
        setIssuedData({
          status: 'issued',
          downloadUrl: response.data.downloadUrl,
          companyName: values.companyName || values.fullName || "Khách mua lẻ",
          taxCode: values.taxCode || values.personalTaxCode || "Chưa đăng ký",
          amount: a || '0',
          orderId: oid,
          issuedAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(
        err.response?.data?.error || 
        'Có lỗi xảy ra trong quá trình xuất hóa đơn. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Render dynamic form fields based on backend configuration
  const renderDynamicField = (field: any) => {
    const rules = [];
    if (field.required && field.type !== 'checkbox') {
      rules.push({ required: true, message: `${field.label} là bắt buộc` });
    } else if (field.required && field.type === 'checkbox') {
      rules.push({
        validator: (_: any, value: any) => 
          value ? Promise.resolve() : Promise.reject(new Error(`${field.label} là bắt buộc`))
      });
    }
    
    if (field.type === 'email') {
      rules.push({ type: 'email', message: 'Email không đúng định dạng' });
    }
    if (field.validation) {
      rules.push({
        pattern: new RegExp(field.validation),
        message: `${field.label} không đúng định dạng`
      });
    }

    const inputComponent = (() => {
      switch (field.type) {
        case 'textarea':
          return (
            <Input.TextArea
              placeholder={field.placeholder}
              rows={3}
              maxLength={500}
              showCount
            />
          );
        case 'select':
          return (
            <Select
              placeholder={field.placeholder || "Chọn tỉnh/thành"}
              allowClear
              dropdownStyle={{ zIndex: 1000 }}
            >
              {field.options?.map((opt: any) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.text}
                </Select.Option>
              ))}
            </Select>
          );
        case 'checkbox':
          return (
            <Checkbox>
              {field.placeholder || field.label}
            </Checkbox>
          );
        default:
          return <Input placeholder={field.placeholder} type={field.type === 'email' ? 'email' : 'text'} />;
      }
    })();

    const isCheckbox = field.type === 'checkbox';

    return (
      <Form.Item
        key={field.key}
        name={field.key}
        label={isCheckbox ? null : <span style={{ fontWeight: 500, fontSize: 13 }}>{field.label}</span>}
        rules={rules}
        valuePropName={isCheckbox ? 'checked' : 'value'}
        initialValue={isCheckbox ? (field.defaultValue === 'true' || field.defaultValue === true) : field.defaultValue}
      >
        {inputComponent}
      </Form.Item>
    );
  };

  const hasMissingParams = !oid || !sid || !rid || !sig;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white mb-3 shadow-md shadow-blue-200">
            <FileTextOutlined style={{ fontSize: 28 }} />
          </div>
          <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>
            Cổng Thông Tin Hóa Đơn VAT
          </Title>
          <Paragraph style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            Đăng ký và phát hành hóa đơn giá trị gia tăng tự động dành cho khách hàng
          </Paragraph>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <Card className="shadow-sm border-slate-100 text-center py-16">
            <Spin size="large" tip="Đang kiểm tra thông tin liên kết..." />
          </Card>
        )}

        {/* Error State */}
        {!loading && error && (
          <Card className="shadow-md border-rose-100 rounded-xl overflow-hidden mb-6">
            <Result
              status="error"
              title="Yêu cầu thất bại"
              subTitle={error}
              extra={[
                <Button 
                  key="retry" 
                  type="primary" 
                  danger 
                  onClick={() => window.location.reload()}
                >
                  Thử lại
                </Button>
              ]}
            />
          </Card>
        )}

        {/* Missing Parameters (Un-authenticated visitor) */}
        {!loading && !error && hasMissingParams && (
          <div className="mb-8">
            <Alert
              message={<span className="font-semibold text-amber-800">Liên kết không có đủ tham số xác thực</span>}
              description={
                <div className="text-amber-700 text-sm mt-1">
                  Trang này hoạt động độc lập và yêu cầu một liên kết chứa chữ ký xác thực từ hóa đơn bán hàng để hoạt động.
                  Nếu bạn là quản trị viên hệ thống hoặc lập trình viên, vui lòng sử dụng <strong>Bảng Thử Nghiệm</strong> bên dưới để kiểm nghiệm các kịch bản.
                </div>
              }
              type="warning"
              showIcon
              className="rounded-xl border-amber-200 bg-amber-50"
            />
          </div>
        )}

        {/* Pending Form Registration State (Case 1) */}
        {!loading && !error && !hasMissingParams && status === 'pending' && formConfig && (
          <Card className="shadow-xl border-slate-100 rounded-2xl overflow-hidden bg-white p-2 sm:p-4">
            
            {/* Quick Order Bill Summary Card */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
              <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold text-sm uppercase tracking-wider">
                <ShopOutlined className="text-blue-600" />
                <span>Thông tin giao dịch gốc</span>
              </div>
              <Descriptions size="small" column={{ xs: 1, sm: 2 }} bordered={false}>
                <Descriptions.Item label={<span className="text-slate-500 font-medium">Mã đơn hàng (OID)</span>}>
                  <Badge count={oid} color="blue" />
                </Descriptions.Item>
                <Descriptions.Item label={<span className="text-slate-500 font-medium">Số tiền thanh toán</span>}>
                  <strong className="text-rose-600 text-base">{formatVND(a)}</strong>
                </Descriptions.Item>
                <Descriptions.Item label={<span className="text-slate-500 font-medium">Mã cửa hàng (SID)</span>}>
                  <span className="text-slate-700 font-semibold">{sid}</span>
                </Descriptions.Item>
                <Descriptions.Item label={<span className="text-slate-500 font-medium">Mã yêu cầu (RID)</span>}>
                  <span className="text-slate-700">{rid}</span>
                </Descriptions.Item>
              </Descriptions>
            </div>

            <div className="border-b border-slate-100 pb-3 mb-6 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <SafetyCertificateOutlined className="text-emerald-500 text-xl" />
                <h3 className="text-lg font-bold text-slate-800 m-0">
                  {formConfig[invoiceType]?.title || "Thông tin xuất hóa đơn VAT"}
                </h3>
              </div>
            </div>

            {formConfig.individual?.enabled && formConfig.enterprise?.enabled && (
              <div className="mb-6 flex justify-center">
                <Segmented
                  size="large"
                  value={invoiceType}
                  onChange={(val: any) => {
                    setInvoiceType(val);
                    form.resetFields();
                  }}
                  options={[
                    {
                      label: (
                        <div className="px-4 py-1 flex items-center gap-2">
                          <BuildOutlined />
                          <span>Doanh nghiệp</span>
                        </div>
                      ),
                      value: 'enterprise',
                    },
                    {
                      label: (
                        <div className="px-4 py-1 flex items-center gap-2">
                          <UserOutlined />
                          <span>Cá nhân</span>
                        </div>
                      ),
                      value: 'individual',
                    },
                  ]}
                  className="bg-slate-100 p-1 rounded-xl"
                />
              </div>
            )}

            <Alert
              message={
                <div className="text-slate-600 text-xs">
                  {invoiceType === 'enterprise' 
                    ? "Vui lòng cung cấp chính xác thông tin doanh nghiệp. Hóa đơn sau khi xuất sẽ được gửi trực tiếp đến địa chỉ email đăng ký."
                    : "Vui lòng cung cấp chính xác thông tin cá nhân. Hóa đơn sau khi xuất sẽ được gửi trực tiếp đến địa chỉ email đăng ký."
                  }
                </div>
              }
              type="info"
              showIcon
              icon={<InfoCircleOutlined className="text-blue-500" />}
              className="mb-6 rounded-lg bg-blue-50/50 border-blue-100"
            />

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark="optional"
            >
              {(formConfig[invoiceType]?.fields?.filter((f: any) => f.enabled !== false) || []).map((field: any) => renderDynamicField(field))}

              <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl h-12 shadow-md shadow-blue-200"
                >
                  <FileTextOutlined /> Xuất hóa đơn VAT
                </Button>
              </Form.Item>
            </Form>
          </Card>
        )}

        {/* Issued PDF Download State (Case 2) */}
        {!loading && !error && !hasMissingParams && status === 'issued' && issuedData && (
          <Card className="shadow-xl border-emerald-100 rounded-2xl overflow-hidden bg-white text-center p-8">
            <Result
              status="success"
              title={<span className="text-emerald-600 font-bold text-2xl">Hóa đơn VAT đã được phát hành!</span>}
              subTitle={
                <div className="max-w-md mx-auto text-slate-600 mt-2">
                  Hệ thống đã phê duyệt và phát hành hóa đơn giá trị gia tăng điện tử cho giao dịch này. Bạn có thể tải xuống file PDF ngay lập tức.
                </div>
              }
            />

            <div className="bg-emerald-50/60 rounded-xl p-5 border border-emerald-100 text-left max-w-lg mx-auto mb-8">
              <div className="flex items-center gap-2 mb-3 text-emerald-800 font-bold text-sm">
                <SafetyCertificateOutlined />
                <span>Chi tiết hóa đơn đã xuất</span>
              </div>
              <Descriptions size="small" column={1} bordered={false}>
                <Descriptions.Item label={<span className="text-slate-500 font-medium">Đơn vị thụ hưởng</span>}>
                  <strong className="text-slate-800">{issuedData.companyName}</strong>
                </Descriptions.Item>
                <Descriptions.Item label={<span className="text-slate-500 font-medium">Mã số thuế</span>}>
                  <span className="font-mono text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded">{issuedData.taxCode}</span>
                </Descriptions.Item>
                <Descriptions.Item label={<span className="text-slate-500 font-medium">Mã đơn hàng</span>}>
                  <span className="text-slate-700">{issuedData.orderId}</span>
                </Descriptions.Item>
                <Descriptions.Item label={<span className="text-slate-500 font-medium">Tổng số tiền</span>}>
                  <span className="text-slate-800 font-semibold">{formatVND(issuedData.amount)}</span>
                </Descriptions.Item>
                <Descriptions.Item label={<span className="text-slate-500 font-medium">Thời gian xuất</span>}>
                  <span className="text-slate-600">{new Date(issuedData.issuedAt).toLocaleString('vi-VN')}</span>
                </Descriptions.Item>
              </Descriptions>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Button
                type="primary"
                size="large"
                icon={<DownloadOutlined />}
                onClick={() => window.open(issuedData.downloadUrl, '_blank')}
                className="bg-emerald-600 hover:bg-emerald-700 border-none text-white font-medium rounded-xl h-12 flex-1 shadow-md shadow-emerald-200"
              >
                Tải hóa đơn PDF
              </Button>
              <Button
                size="large"
                onClick={() => {
                  // Simply simulate reset/another one
                  setSearchParams({});
                  setStatus(null);
                  setError(null);
                }}
                className="rounded-xl h-12 font-medium border-slate-300 text-slate-600"
              >
                Đăng ký đơn hàng khác
              </Button>
            </div>
          </Card>
        )}

        {/* Demo / Testing Utilities Panel (Extremely user-friendly & helpful) */}
        <div className="mt-12 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-slate-700 font-bold text-sm border-b border-slate-100 pb-2">
            <TransactionOutlined className="text-blue-500" />
            <span>Khu vực Thử Nghiệm / Demo Sandbox (Dành cho Giáo viên & Lập trình viên)</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Do trang này là trang <strong>Public không yêu cầu đăng nhập</strong>, URL cần chứa chữ ký xác thực. Nhấn vào các đường liên kết mẫu dưới đây để chạy thử nghiệm kịch bản:
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setSearchParams({
                  oid: 'DH-2026-0892',
                  sid: 'S-HANOI-01',
                  rid: 'R-90231',
                  o: 'web',
                  sig: 'demo_sig_0892',
                  a: '2450000',
                  ct: 'company'
                });
              }}
              className="text-left w-full text-xs p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors flex justify-between items-center"
            >
              <div>
                <span className="font-semibold block mb-0.5">Kịch bản 1: Hóa đơn CHƯA xuất VAT</span>
                <span className="text-slate-500 font-normal">OID: DH-2026-0892 | Giá trị: 2,450,000 VNĐ. Hiển thị form render động từ Backend JSON.</span>
              </div>
              <span className="text-[10px] bg-blue-200 text-blue-800 font-bold uppercase px-2 py-0.5 rounded">Thử ngay</span>
            </button>

            <button
              onClick={() => {
                setSearchParams({
                  oid: 'DH-2026-9999',
                  sid: 'S-SAIGON-02',
                  rid: 'R-44122',
                  o: 'app',
                  sig: 'demo_sig_9999',
                  a: '18500000',
                  ct: 'personal'
                });
              }}
              className="text-left w-full text-xs p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-colors flex justify-between items-center"
            >
              <div>
                <span className="font-semibold block mb-0.5">Kịch bản 2: Hóa đơn LỚN (Chưa xuất VAT)</span>
                <span className="text-slate-500 font-normal">OID: DH-2026-9999 | Giá trị: 18,500,000 VNĐ. Sau khi submit, kịch bản sẽ chuyển sang tải PDF.</span>
              </div>
              <span className="text-[10px] bg-emerald-200 text-emerald-800 font-bold uppercase px-2 py-0.5 rounded">Thử ngay</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-12">
        <Text className="text-xs text-slate-400">
          © 2026 Cổng Xuất Hóa Đơn VAT Điện Tử. Hệ thống vận hành độc lập bảo mật cao.
        </Text>
      </div>
    </div>
  );
}
