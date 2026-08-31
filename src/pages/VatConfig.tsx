import React, { useState, useEffect } from 'react';
import { Card, Typography, Switch, Table, Input, Checkbox, Button, App, Row, Col, Tabs, Space, Divider, Alert, Tooltip, Badge, Modal, Form, Select } from 'antd';
import { SaveOutlined, ReloadOutlined, EyeOutlined, InfoCircleOutlined, SafetyCertificateOutlined, BuildOutlined, UserOutlined, SettingOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion } from 'motion/react';
import PageContainer from '../components/PageContainer';
import seedVatJson from '../seed/seedVat.json';
import { VatFormConfigDto, VatFormFieldDto, VatTypeConfigDto, VatInvoiceMapper } from '../dtos/VatDto';
import { vatService } from '../services/vatService';
import { message } from '../services/toastMessage';
import { DataSectionSkeleton } from '../components/DataSectionSkeleton';
import { useDelayedLoading } from '../hooks/useDelayedLoading';

const { Title, Text, Paragraph } = Typography;

type FieldConfig = VatFormFieldDto;

const defaultState: VatFormConfigDto = VatInvoiceMapper.toFormConfigDto(seedVatJson.vatFormConfig);

export default function VatConfig() {
  const { modal } = App.useApp();
  const [loading, setLoading] = useState<boolean>(true);
  const showConfigSkeleton = useDelayedLoading(loading, 400);
  const [saving, setSaving] = useState<boolean>(false);
  const [config, setConfig] = useState<VatFormConfigDto>(defaultState);
  const [activeTab, setActiveTab] = useState<string>('enterprise');
  const [previewMode, setPreviewMode] = useState<'ui' | 'json'>('ui');

  // Modal import JSONB state
  const [isImportJsonModalOpen, setIsImportJsonModalOpen] = useState(false);
  const [rawJsonInput, setRawJsonInput] = useState('');

  // Modal states for adding fields
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addTargetType, setAddTargetType] = useState<'individual' | 'enterprise'>('enterprise');
  const [addForm] = Form.useForm();

  // Modal states for configuring select options
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [optionsTargetType, setOptionsTargetType] = useState<'individual' | 'enterprise'>('enterprise');
  const [editingFieldKey, setEditingFieldKey] = useState<string>('');
  const [optionsForm] = Form.useForm();

  // Load configuration on mount
  const loadConfig = async () => {
    setLoading(true);
    try {
      setConfig(vatService.getConfig());
    } catch (err: any) {
      console.error("Error loading VAT config:", err);
      message.error("Không thể tải cấu hình hóa đơn VAT.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // Save config back to the backend
  const saveConfig = async () => {
    setSaving(true);
    try {
      const savedConfig = vatService.updateConfig(config);
      setConfig(savedConfig);
      if (savedConfig) {
        const jsonbSize = (JSON.stringify(savedConfig).length / 1024).toFixed(2);
        message.success({
          title: "Lưu Cấu Hình JSONB Thành Công!",
          description: `Toàn bộ khối dữ liệu cấu hình (${jsonbSize} KB) đã được cập nhật qua VatService.`,
          duration: 4.5
        });
      }
    } catch (err: any) {
      console.error("Error saving VAT config:", err);
      message.error("Không thể lưu cấu hình VAT.");
    } finally {
      setSaving(false);
    }
  };

  // Helper to import JSONB
  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(rawJsonInput);
      if (parsed && typeof parsed === 'object' && (parsed.individual || parsed.enterprise)) {
        setConfig(parsed);
        setIsImportJsonModalOpen(false);
        setRawJsonInput('');
        message.success('Đã nhập dữ liệu JSONB thành công! Nhấn "Lưu Cấu Hình" để lưu vào Database.');
      } else {
        message.error('Cấu trúc JSONB không đúng định dạng. Cần chứa đối tượng "individual" hoặc "enterprise".');
      }
    } catch (err) {
      message.error('Cú pháp JSON không hợp lệ! Vui lòng kiểm tra lại dấu ngoặc và phẩy.');
    }
  };

  // Helper to update specific fields list
  const handleFieldChange = (type: 'individual' | 'enterprise', key: string, param: keyof FieldConfig, value: any) => {
    const updatedFields = config[type].fields.map(field => {
      if (field.key === key) {
        return { ...field, [param]: value };
      }
      return field;
    });

    setConfig({
      ...config,
      [type]: {
        ...config[type],
        fields: updatedFields
      }
    });
  };

  // Helper to update structural header details
  const handleHeaderChange = (type: 'individual' | 'enterprise', param: keyof VatTypeConfigDto, value: any) => {
    setConfig({
      ...config,
      [type]: {
        ...config[type],
        [param]: value
      }
    });
  };

  // Delete field handler
  const handleDeleteField = (type: 'individual' | 'enterprise', key: string) => {
    modal.confirm({
      title: 'Xác nhận xóa trường',
      content: `Bạn có chắc chắn muốn xóa trường "${key}" khỏi biểu mẫu? Thao tác này sẽ cập nhật giao diện ngay sau khi lưu cấu hình.`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        const updatedFields = config[type].fields.filter(field => field.key !== key);
        setConfig({
          ...config,
          [type]: {
            ...config[type],
            fields: updatedFields
          }
        });
        message.success(`Đã loại bỏ trường "${key}". Bấm "Lưu cấu hình" để lưu lại thay đổi.`);
      }
    });
  };

  // Open add field modal
  const openAddFieldModal = (type: 'individual' | 'enterprise') => {
    setAddTargetType(type);
    setIsAddModalOpen(true);
    setTimeout(() => {
      addForm.resetFields();
    }, 0);
  };

  // Handle Add Field Submit
  const handleAddFieldSubmit = (values: any) => {
    // Check if key already exists in either individual or enterprise
    const keyExists = config[addTargetType].fields.some(f => f.key === values.key);
    if (keyExists) {
      message.error(`Mã trường "${values.key}" đã tồn tại! Vui lòng nhập mã khác.`);
      return;
    }

    const newField: FieldConfig = {
      key: values.key,
      label: values.label,
      type: values.type,
      required: values.required || false,
      enabled: values.enabled !== false,
      placeholder: values.placeholder || '',
      defaultValue: values.defaultValue || '',
      options: values.type === 'select' ? parseOptionsRaw(values.optionsRaw) : undefined
    };

    setConfig({
      ...config,
      [addTargetType]: {
        ...config[addTargetType],
        fields: [...config[addTargetType].fields, newField]
      }
    });

    setIsAddModalOpen(false);
    message.success(`Đã thêm trường "${values.label}" thành công! Bấm "Lưu cấu hình" để lưu lại.`);
  };

  // Open options modal
  const openOptionsModal = (type: 'individual' | 'enterprise', field: FieldConfig) => {
    setOptionsTargetType(type);
    setEditingFieldKey(field.key);

    // Format options back to raw text key: label
    const rawText = (field.options || [])
      .map(o => `${o.value}: ${o.text}`)
      .join('\n');

    setIsOptionsModalOpen(true);
    setTimeout(() => {
      optionsForm.setFieldsValue({ optionsRaw: rawText });
    }, 0);
  };

  // Handle Save Options
  const handleSaveOptions = (values: any) => {
    const parsedOpts = parseOptionsRaw(values.optionsRaw);

    const updatedFields = config[optionsTargetType].fields.map(field => {
      if (field.key === editingFieldKey) {
        return { ...field, options: parsedOpts };
      }
      return field;
    });

    setConfig({
      ...config,
      [optionsTargetType]: {
        ...config[optionsTargetType],
        fields: updatedFields
      }
    });

    setIsOptionsModalOpen(false);
    message.success(`Đã cập nhật các tùy chọn của trường "${editingFieldKey}" thành công! Bấm "Lưu cấu hình" để lưu lại.`);
  };

  // Helper to parse key:label raw text
  const parseOptionsRaw = (text: string) => {
    if (!text) return [];
    return text.split('\n')
      .map(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
          return { value: parts[0].trim(), text: parts.slice(1).join(':').trim() };
        }
        const val = line.trim();
        return val ? { value: val, text: val } : null;
      })
      .filter(Boolean) as { value: string; text: string }[];
  };

  const tableColumns = (type: 'individual' | 'enterprise') => [
    {
      title: 'Mã trường (Key)',
      dataIndex: 'key',
      key: 'key',
      width: '12%',
      render: (text: string) => <code className="text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">{text}</code>
    },
    {
      title: 'Nhãn hiển thị (Label)',
      dataIndex: 'label',
      key: 'label',
      width: '20%',
      render: (text: string, record: FieldConfig) => (
        <Input
          value={text}
          onChange={(e) => handleFieldChange(type, record.key, 'label', e.target.value)}
          size="small"
          className="rounded"
        />
      )
    },
    {
      title: 'Loại trường',
      dataIndex: 'type',
      key: 'type',
      width: '16%',
      render: (text: string, record: FieldConfig) => (
        <Select
          value={text}
          onChange={(val) => handleFieldChange(type, record.key, 'type', val)}
          size="small"
          className="w-full rounded"
          options={[
            { value: 'text', label: 'Hộp chữ (text)' },
            { value: 'email', label: 'Địa chỉ Email' },
            { value: 'textarea', label: 'Văn bản dài (textarea)' },
            { value: 'checkbox', label: 'Hộp kiểm (checkbox)' },
            { value: 'select', label: 'Hộp chọn (select)' },
          ]}
        />
      )
    },
    {
      title: 'Hiển thị',
      dataIndex: 'enabled',
      key: 'enabled',
      width: '8%',
      align: 'center' as const,
      render: (checked: boolean, record: FieldConfig) => (
        <Checkbox
          checked={checked}
          onChange={(e) => handleFieldChange(type, record.key, 'enabled', e.target.checked)}
        />
      )
    },
    {
      title: 'Bắt buộc',
      dataIndex: 'required',
      key: 'required',
      width: '8%',
      align: 'center' as const,
      render: (checked: boolean, record: FieldConfig) => (
        <Checkbox
          checked={checked}
          disabled={!record.enabled}
          onChange={(e) => handleFieldChange(type, record.key, 'required', e.target.checked)}
        />
      )
    },
    {
      title: 'Placeholder / Hướng dẫn',
      dataIndex: 'placeholder',
      key: 'placeholder',
      width: '26%',
      render: (text: string, record: FieldConfig) => (
        <Input
          value={text}
          disabled={!record.enabled}
          onChange={(e) => handleFieldChange(type, record.key, 'placeholder', e.target.value)}
          size="small"
          placeholder="Nhập placeholder..."
          className="rounded text-xs"
        />
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: '10%',
      align: 'center' as const,
      render: (_: any, record: FieldConfig) => (
        <Space size="small">
          {record.type === 'select' && (
            <Tooltip title="Cấu hình tùy chọn (options)">
              <Button
                size="small"
                type="text"
                icon={<SettingOutlined className="text-blue-500" />}
                onClick={() => openOptionsModal(type, record)}
              />
            </Tooltip>
          )}
          <Tooltip title="Xóa trường">
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteField(type, record.key)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <PageContainer
      title="Cấu hình Biểu mẫu VAT"
      subtitle="Quản lý và tùy biến các trường thông tin đăng ký VAT phía khách hàng"
    >
      <Row gutter={[24, 24]}>
        {/* Settings Column */}
        <Col xs={24} lg={15}>
          <Card
            title={
              <div className="flex items-center gap-2 py-1">
                <SettingOutlined className="text-blue-600" />
                <span>Cấu hình chi tiết form nhập liệu</span>
              </div>
            }
            variant="borderless"
            className="shadow-sm rounded-xl overflow-hidden"
            extra={
              <Space>
                <Button icon={<ReloadOutlined />} onClick={loadConfig} loading={loading}>
                  Làm mới
                </Button>
                <Button type="primary" icon={<SaveOutlined />} onClick={saveConfig} loading={saving} className="bg-blue-600">
                  Lưu Cấu Kinh
                </Button>
              </Space>
            }
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'enterprise',
                  label: (
                    <div className="flex items-center gap-2 px-1">
                      <BuildOutlined />
                      <span>Hóa đơn Doanh nghiệp</span>
                    </div>
                  ),
                  children: (
                    <div className="pt-2">
                      {showConfigSkeleton ? (
                        <DataSectionSkeleton rows={6} titleKey="vat_config_loading_title" />
                      ) : (
                        <>
                          <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100 flex items-center justify-between">
                            <div>
                              <Text strong className="block mb-1">Kích hoạt hóa đơn Doanh nghiệp</Text>
                              <Text type="secondary" className="text-xs">Cho phép khách hàng lựa chọn xuất VAT cho đơn vị công ty</Text>
                            </div>
                            <Switch
                              checked={config.enterprise.enabled}
                              onChange={(checked) => handleHeaderChange('enterprise', 'enabled', checked)}
                            />
                          </div>

                          {config.enterprise.enabled && (
                            <div className="space-y-4">
                              <div className="flex flex-col gap-1">
                                <Text strong className="text-xs text-slate-500 uppercase tracking-wider">Tiêu đề biểu mẫu</Text>
                                <Input
                                  value={config.enterprise.title}
                                  onChange={(e) => handleHeaderChange('enterprise', 'title', e.target.value)}
                                  placeholder="Nhập tiêu đề hiển thị"
                                  className="rounded-lg h-9"
                                />
                              </div>

                              <Divider className="my-4" />

                              <div>
                                <div className="flex justify-between items-center mb-3">
                                  <Text strong className="text-sm text-slate-800">Danh sách trường nhập liệu (Doanh nghiệp)</Text>
                                  <Space>
                                    <Badge count={`${config.enterprise.fields?.filter(f => f.enabled).length || 0} trường kích hoạt`} color="blue" />
                                    <Button
                                      type="primary"
                                      size="small"
                                      icon={<PlusOutlined />}
                                      onClick={() => openAddFieldModal('enterprise')}
                                      className="bg-blue-600 border-none text-xs"
                                    >
                                      Thêm trường
                                    </Button>
                                  </Space>
                                </div>
                                <Table
                                  dataSource={config.enterprise.fields}
                                  columns={tableColumns('enterprise')}
                                  pagination={false}
                                  loading={false}
                                  rowKey="key"
                                  size="small"
                                  bordered
                                  className="shadow-sm rounded-lg overflow-hidden"
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                },
                {
                  key: 'individual',
                  label: (
                    <div className="flex items-center gap-2 px-1">
                      <UserOutlined />
                      <span>Hóa đơn Cá nhân</span>
                    </div>
                  ),
                  children: (
                    <div className="pt-2">
                      {showConfigSkeleton ? (
                        <DataSectionSkeleton rows={6} titleKey="vat_config_loading_title" />
                      ) : (
                        <>
                          <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100 flex items-center justify-between">
                            <div>
                              <Text strong className="block mb-1">Kích hoạt hóa đơn Cá nhân</Text>
                              <Text type="secondary" className="text-xs">Cho phép khách hàng lựa chọn xuất hóa đơn cho cá nhân người mua lẻ</Text>
                            </div>
                            <Switch
                              checked={config.individual.enabled}
                              onChange={(checked) => handleHeaderChange('individual', 'enabled', checked)}
                            />
                          </div>

                          {config.individual.enabled && (
                            <div className="space-y-4">
                              <div className="flex flex-col gap-1">
                                <Text strong className="text-xs text-slate-500 uppercase tracking-wider">Tiêu đề biểu mẫu</Text>
                                <Input
                                  value={config.individual.title}
                                  onChange={(e) => handleHeaderChange('individual', 'title', e.target.value)}
                                  placeholder="Nhập tiêu đề hiển thị"
                                  className="rounded-lg h-9"
                                />
                              </div>

                              <Divider className="my-4" />

                              <div>
                                <div className="flex justify-between items-center mb-3">
                                  <Text strong className="text-sm text-slate-800">Danh sách trường nhập liệu (Cá nhân)</Text>
                                  <Space>
                                    <Badge count={`${config.individual.fields?.filter(f => f.enabled).length || 0} trường kích hoạt`} color="orange" />
                                    <Button
                                      type="primary"
                                      size="small"
                                      icon={<PlusOutlined />}
                                      onClick={() => openAddFieldModal('individual')}
                                      className="bg-orange-500 hover:bg-orange-600 border-none text-xs"
                                    >
                                      Thêm trường
                                    </Button>
                                  </Space>
                                </div>
                                <Table
                                  dataSource={config.individual.fields}
                                  columns={tableColumns('individual')}
                                  pagination={false}
                                  loading={false}
                                  rowKey="key"
                                  size="small"
                                  bordered
                                  className="shadow-sm rounded-lg overflow-hidden"
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                }
              ]}
            />
          </Card>
        </Col>

        {/* Real-time Dynamic UI Preview Column */}
        <Col xs={24} lg={9}>
          <div className="sticky top-6">
            <Card
              title={
                <div className="flex items-center gap-2 py-1">
                  <EyeOutlined className="text-emerald-600" />
                  <span>Xem trước kết quả (Live Output)</span>
                </div>
              }
              variant="borderless"
              className="shadow-md rounded-xl border border-slate-100 overflow-hidden"
              extra={
                <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setPreviewMode('ui')}
                    className={`px-3 py-1 rounded-md transition-all ${previewMode === 'ui' ? 'bg-white shadow-sm text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Giao diện (UI)
                  </button>
                  <button
                    onClick={() => setPreviewMode('json')}
                    className={`px-3 py-1 rounded-md transition-all ${previewMode === 'json' ? 'bg-white shadow-sm text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    JSONB Database
                  </button>
                </div>
              }
            >
              {previewMode === 'json' ? (
                <div>
                  <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 mb-4 flex gap-2 items-start border border-slate-100">
                    <InfoCircleOutlined className="text-indigo-500 mt-0.5" />
                    <span>
                      Đây là cấu trúc <strong>JSONB</strong> đầy đủ sẽ được lưu trực tiếp vào cơ sở dữ liệu khi nhấn <strong>Lưu Cấu Hình</strong>. Bạn có thể lưu nguyên trường JSONB này ở backend.
                    </span>
                  </div>

                  <div className="relative group">
                    <div className="absolute top-2 right-2 flex gap-2 z-10">
                      <button
                        onClick={() => {
                          setRawJsonInput(JSON.stringify(config, null, 2));
                          setIsImportJsonModalOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow transition-all duration-200 active:scale-95"
                      >
                        Nhập JSONB Raw
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(config, null, 2));
                          message.success("Đã sao chép cấu trúc JSONB thành công!");
                        }}
                        className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg font-semibold shadow transition-all duration-200 active:scale-95"
                      >
                        Sao chép JSONB
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-2xl overflow-auto max-h-[500px] shadow-inner leading-relaxed border border-slate-800">
                      {JSON.stringify(config, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500 mb-6 flex gap-2 items-start border border-slate-100">
                    <InfoCircleOutlined className="text-blue-500 mt-0.5" />
                    <span>
                      Đây là giao diện tương tác trực quan hiển thị chính xác những gì khách hàng sẽ nhìn thấy khi truy cập liên kết đăng ký VAT của họ.
                    </span>
                  </div>

                  {/* Simulated Client Interface Mock */}
                  <div className="border border-slate-200 rounded-2xl bg-white p-4 shadow-sm relative">
                    <div className="absolute top-0 right-0 left-0 h-1.5 bg-blue-600 rounded-t-2xl"></div>

                    {/* Simulated Header */}
                    <div className="text-center mt-3 mb-5">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mb-1.5">
                        <SafetyCertificateOutlined style={{ fontSize: 16 }} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 m-0">
                        {config[activeTab as 'individual' | 'enterprise']?.title || "Thông tin xuất hóa đơn VAT"}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Cổng Thông Tin Đăng Ký Tự Động</p>
                    </div>

                    {/* Tab select preview if both enabled */}
                    {config.enterprise.enabled && config.individual.enabled && (
                      <div className="flex bg-slate-100 p-0.5 rounded-lg mb-4 text-xs">
                        <button
                          className={`flex-1 py-1 rounded-md text-center transition-all font-medium ${activeTab === 'enterprise' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                          onClick={() => setActiveTab('enterprise')}
                        >
                          Doanh nghiệp
                        </button>
                        <button
                          className={`flex-1 py-1 rounded-md text-center transition-all font-medium ${activeTab === 'individual' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                          onClick={() => setActiveTab('individual')}
                        >
                          Cá nhân
                        </button>
                      </div>
                    )}

                    {/* Render Fields Preview */}
                    <div className="space-y-3">
                      {(!config[activeTab as 'individual' | 'enterprise']?.enabled) ? (
                        <Alert
                          type="warning"
                          message="Tính năng đang tắt"
                          description="Hãy bật cấu hình này ở cột bên trái để hiển thị biểu mẫu."
                          className="rounded-lg text-xs"
                        />
                      ) : (
                        (config[activeTab as 'individual' | 'enterprise']?.fields || [])
                          .filter(f => f.enabled)
                          .map(field => (
                            <div key={field.key} className="flex flex-col gap-1">
                              {field.type !== 'checkbox' && (
                                <div className="flex justify-between">
                                  <label className="text-[11px] font-semibold text-slate-600">
                                    {field.label}
                                  </label>
                                  {field.required && <span className="text-rose-500 text-[10px]">* Bắt buộc</span>}
                                </div>
                              )}
                              {field.type === 'checkbox' ? (
                                <div className="flex items-start gap-2 py-1">
                                  <input
                                    type="checkbox"
                                    disabled
                                    checked={field.defaultValue === 'true'}
                                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <div className="flex flex-col">
                                    <label className="text-[11px] font-semibold text-slate-600">
                                      {field.label} {field.required && <span className="text-rose-500 text-[10px]">* Bắt buộc</span>}
                                    </label>
                                    {field.placeholder && (
                                      <span className="text-[10px] text-slate-400">{field.placeholder}</span>
                                    )}
                                  </div>
                                </div>
                              ) : field.type === 'select' ? (
                                <select className="h-8 text-xs border border-slate-200 rounded-lg bg-slate-50 px-2 text-slate-700 outline-none w-full" disabled>
                                  <option>{field.placeholder || "Chọn một tỉnh/thành..."}</option>
                                  {field.options?.map(o => <option key={o.value}>{o.text}</option>)}
                                </select>
                              ) : field.type === 'textarea' ? (
                                <textarea
                                  className="text-xs border border-slate-200 rounded-lg bg-slate-50 px-2 py-1.5 text-slate-700 outline-none w-full resize-none"
                                  rows={2}
                                  placeholder={field.placeholder}
                                  disabled
                                />
                              ) : (
                                <input
                                  className="h-8 text-xs border border-slate-200 rounded-lg bg-slate-50 px-2 text-slate-700 outline-none w-full"
                                  placeholder={field.placeholder}
                                  disabled
                                />
                              )}
                            </div>
                          ))
                      )}

                      {config[activeTab as 'individual' | 'enterprise']?.enabled && (
                        <button className="w-full bg-blue-600 text-white rounded-lg h-9 font-medium text-xs mt-3 opacity-90 cursor-not-allowed flex items-center justify-center gap-1">
                          <SaveOutlined /> Đăng ký hóa đơn VAT
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        </Col>
      </Row>

      {/* Modal: Thêm trường mới */}
      <Modal
        title={
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <PlusOutlined className="text-blue-500" />
            <span>Thêm trường nhập liệu mới ({addTargetType === 'enterprise' ? 'Doanh nghiệp' : 'Cá nhân'})</span>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        width={500}
        destroyOnHidden
      >
        <Form
          form={addForm}
          layout="vertical"
          initialValues={{ type: 'text', required: false, enabled: true }}
          onFinish={handleAddFieldSubmit}
          className="pt-4"
        >
          <Form.Item
            name="key"
            label={<span className="font-semibold text-slate-700">Mã trường (Key ID)</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập mã trường' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: 'Mã trường chỉ chứa chữ cái, số và dấu gạch dưới' }
            ]}
            extra="Ví dụ: company_phone, billing_address. Không chứa khoảng trắng hoặc ký tự đặc biệt."
          >
            <Input placeholder="Nhập mã trường (ví dụ: fax_number)..." className="rounded-lg h-9" />
          </Form.Item>

          <Form.Item
            name="label"
            label={<span className="font-semibold text-slate-700">Nhãn hiển thị (Label)</span>}
            rules={[{ required: true, message: 'Vui lòng nhập nhãn hiển thị' }]}
          >
            <Input placeholder="Ví dụ: Số điện thoại công ty, Địa chỉ phụ..." className="rounded-lg h-9" />
          </Form.Item>

          <Form.Item
            name="type"
            label={<span className="font-semibold text-slate-700">Loại trường (Input Type)</span>}
            rules={[{ required: true }]}
          >
            <Select
              className="w-full h-9 rounded-lg"
              options={[
                { value: 'text', label: 'Hộp chữ (text)' },
                { value: 'email', label: 'Địa chỉ Email' },
                { value: 'textarea', label: 'Văn bản nhiều dòng (textarea)' },
                { value: 'checkbox', label: 'Hộp kiểm (checkbox)' },
                { value: 'select', label: 'Hộp chọn danh sách (select)' },
              ]}
            />
          </Form.Item>

          {/* Conditional field for options list (if type === 'select') */}
          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              if (type === 'select') {
                return (
                  <Form.Item
                    name="optionsRaw"
                    label={<span className="font-semibold text-slate-700">Cấu hình các tùy chọn (Options)</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập ít nhất một tùy chọn' }]}
                    extra="Định dạng: 'mã: tên', mỗi dòng một tùy chọn. Ví dụ: 'HN: Hà Nội' hoặc 'HCM: TP.HCM'"
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="HN: Hà Nội&#10;HCM: TP. Hồ Chí Minh&#10;DN: Đà Nẵng"
                      className="rounded-lg font-mono text-xs"
                    />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>

          <Form.Item
            name="placeholder"
            label={<span className="font-semibold text-slate-700">Placeholder hoặc Hướng dẫn</span>}
          >
            <Input placeholder="Nhập hướng dẫn hiển thị mờ trong trường..." className="rounded-lg h-9" />
          </Form.Item>

          <Form.Item
            name="defaultValue"
            label={<span className="font-semibold text-slate-700">Giá trị mặc định (Default Value)</span>}
          >
            <Input placeholder="Nhập giá trị mặc định của trường..." className="rounded-lg h-9" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="required" valuePropName="checked">
                <Checkbox className="font-medium text-slate-700">Trường bắt buộc nhập</Checkbox>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="enabled" valuePropName="checked">
                <Checkbox className="font-medium text-slate-700">Kích hoạt hiển thị</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <div className="flex gap-2 justify-end border-t border-slate-100 pt-4 mt-6">
            <Button onClick={() => setIsAddModalOpen(false)} className="rounded-lg h-9">
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" className="rounded-lg h-9 bg-blue-600 border-none text-white">
              Thêm trường
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal: Cấu hình Select Options */}
      <Modal
        title={
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <SettingOutlined className="text-blue-500" />
            <span>Cấu hình tùy chọn danh sách cho trường "{editingFieldKey}"</span>
          </div>
        }
        open={isOptionsModalOpen}
        onCancel={() => setIsOptionsModalOpen(false)}
        footer={null}
        width={450}
        destroyOnHidden
      >
        <Form
          form={optionsForm}
          layout="vertical"
          onFinish={handleSaveOptions}
          className="pt-4"
        >
          <Form.Item
            name="optionsRaw"
            label={<span className="font-semibold text-slate-700">Danh sách các tùy chọn</span>}
            rules={[{ required: true, message: 'Vui lòng cung cấp danh sách tùy chọn' }]}
            extra="Nhập định dạng 'mã: nhãn', mỗi dòng một tùy chọn. Ví dụ: '79: Thành phố Hồ Chí Minh'"
          >
            <Input.TextArea
              rows={8}
              placeholder="79: Thành phố Hồ Chí Minh&#10;01: Thành phố Hà Nội"
              className="rounded-lg font-mono text-xs"
            />
          </Form.Item>

          <div className="flex gap-2 justify-end border-t border-slate-100 pt-4 mt-4">
            <Button onClick={() => setIsOptionsModalOpen(false)} className="rounded-lg h-9">
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" className="rounded-lg h-9 bg-blue-600 border-none text-white">
              Lưu tùy chọn
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal: Nhập JSONB Raw */}
      <Modal
        title={
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <SettingOutlined className="text-indigo-600" />
            <span>Nhập chuỗi JSONB trực tiếp (Backend Dev Tools)</span>
          </div>
        }
        open={isImportJsonModalOpen}
        onCancel={() => setIsImportJsonModalOpen(false)}
        footer={null}
        width={650}
        destroyOnHidden
      >
        <div className="pt-2 space-y-4">
          <p className="text-xs text-slate-500 m-0">
            Dán chuỗi cấu trúc <strong>JSONB</strong> vào ô bên dưới. Dữ liệu sẽ được tải trực tiếp vào giao diện chỉnh sửa để bạn xem trước và lưu vào Database backend.
          </p>
          <Input.TextArea
            rows={14}
            value={rawJsonInput}
            onChange={(e) => setRawJsonInput(e.target.value)}
            placeholder="Dán JSONB vào đây..."
            className="font-mono text-xs p-3 bg-slate-900 text-emerald-400 rounded-xl"
          />
          <div className="flex gap-2 justify-end border-t border-slate-100 pt-3">
            <Button onClick={() => setIsImportJsonModalOpen(false)} className="rounded-lg h-9">
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={handleImportJson}
              className="rounded-lg h-9 bg-indigo-600 border-none text-white font-semibold"
            >
              Áp dụng JSONB
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
