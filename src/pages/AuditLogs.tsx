import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  Typography, 
  Tag, 
  Space, 
  Button, 
  Input, 
  Select, 
  Row, 
  Col, 
  Badge, 
  Empty, 
  Table, 
  Segmented, 
  Modal, 
  DatePicker, 
  Tooltip, 
  App,
  Statistic
} from 'antd';
import { 
  HistoryOutlined, 
  SearchOutlined, 
  ReloadOutlined, 
  DeleteOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  UnorderedListOutlined,
  NodeIndexOutlined,
  UserOutlined,
  CodeOutlined,
  GlobalOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import dayjs from 'dayjs';
import { getAuditLogs, AuditLog } from '../utils/auditLogger';
import PageContainer from '../components/PageContainer';
import { hasButtonPermission } from '../utils/rbacPresets';

const { Title, Text, Paragraph } = Typography;

const AuditLogs: React.FC = () => {
  const { t } = useTranslation();
  const { message, modal } = App.useApp();

  // Active User session for RBAC
  const loggedUser = useMemo(() => {
    const saved = localStorage.getItem('@@WEB_POS_PORTAL');
    return saved ? JSON.parse(saved) : null;
  }, []);

  const userRoles = useMemo(() => {
    return loggedUser?.roles || [loggedUser?.role || 'user'];
  }, [loggedUser]);

  const canExport = useMemo(() => {
    return hasButtonPermission(loggedUser?.buttonPermissions, 'system.audit.btn_export', userRoles);
  }, [loggedUser, userRoles]);

  const canDelete = useMemo(() => {
    return hasButtonPermission(loggedUser?.buttonPermissions, 'system.audit.btn_delete', userRoles);
  }, [loggedUser, userRoles]);

  // State
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');
  const [logCategory, setLogCategory] = useState<'all' | 'api' | 'ui'>('all');
  const [searchText, setSearchText] = useState('');
  const [filterAction, setFilterAction] = useState('All');
  const [filterModule, setFilterModule] = useState('All');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const refreshLogs = () => {
    const data = getAuditLogs();
    setLogs(data);
  };

  useEffect(() => {
    refreshLogs();
    const interval = setInterval(refreshLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchCategory = logCategory === 'all' 
        ? true 
        : logCategory === 'api' 
          ? l.action.startsWith('API_') || Boolean(l.url || l.method)
          : !l.action.startsWith('API_') && !l.url;

      const matchSearch = !searchText || (
        (l.text && l.text.toLowerCase().includes(searchText.toLowerCase())) ||
        l.path.toLowerCase().includes(searchText.toLowerCase()) ||
        l.action.toLowerCase().includes(searchText.toLowerCase()) ||
        (l.element && l.element.toLowerCase().includes(searchText.toLowerCase())) ||
        (l.url && l.url.toLowerCase().includes(searchText.toLowerCase()))
      );
      const matchAction = filterAction === 'All' || l.action === filterAction;
      const matchModule = filterModule === 'All' || l.path.includes(filterModule);

      return matchCategory && matchSearch && matchAction && matchModule;
    });
  }, [logs, logCategory, searchText, filterAction, filterModule]);

  // KPIs
  const stats = useMemo(() => {
    const total = logs.length;
    const apiCalls = logs.filter(l => l.action.startsWith('API_') || Boolean(l.url)).length;
    const clicks = logs.filter(l => l.action === 'CLICK').length;
    const changes = logs.filter(l => l.action === 'CHANGE').length;
    return { total, apiCalls, clicks, changes };
  }, [logs]);

  const handleClearLogs = () => {
    if (!canDelete) {
      message.error('Bạn không có quyền [system.audit.btn_delete] để xóa Nhật ký Audit Logs!');
      return;
    }
    modal.confirm({
      title: 'Xác nhận xóa toàn bộ Nhật ký Audit Logs?',
      content: 'Thao tác này sẽ dọn dẹp lịch sử thao tác lưu trên LocalStorage và không thể hoàn tác.',
      okText: 'Xóa toàn bộ',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        localStorage.removeItem('@@WEB_POS_AUDIT_LOG');
        refreshLogs();
        message.success('Đã dọn dẹp lịch sử Audit Logs thành công!');
      }
    });
  };

  const handleExportLogs = () => {
    if (!canExport) {
      message.error('Bạn không có quyền [system.audit.btn_export] để xuất file Excel!');
      return;
    }
    message.loading({ content: 'Đang chuẩn bị dữ liệu xuất Excel...', key: 'export' });
    setTimeout(() => {
      message.success({ content: `Đã xuất ${filteredLogs.length} dòng dữ liệu Nhật ký thành công!`, key: 'export' });
    }, 800);
  };

  const getActionTag = (action: string) => {
    switch (action) {
      case 'CLICK':
        return <Tag color="blue" className="font-bold border-blue-200">CLICK</Tag>;
      case 'CHANGE':
        return <Tag color="orange" className="font-bold border-orange-200">CHANGE</Tag>;
      case 'NAVIGATE':
        return <Tag color="purple" className="font-bold border-purple-200">NAVIGATE</Tag>;
      case 'API_GET':
        return <Tag color="cyan" className="font-bold border-cyan-200">API GET</Tag>;
      case 'API_POST':
        return <Tag color="green" className="font-bold border-green-200">API POST</Tag>;
      case 'API_PUT':
        return <Tag color="gold" className="font-bold border-gold-200">API PUT</Tag>;
      case 'API_DELETE':
        return <Tag color="red" className="font-bold border-red-200">API DELETE</Tag>;
      default:
        if (action.startsWith('API_') && action.endsWith('_ERROR')) {
          return <Tag color="magenta" className="font-bold border-magenta-200">{action}</Tag>;
        }
        if (action.startsWith('API_')) {
          return <Tag color="blue" className="font-bold border-blue-200">{action}</Tag>;
        }
        return <Tag color="default" className="font-bold">{action}</Tag>;
    }
  };

  // Columns for Smart Table View
  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      render: (ts: number) => (
        <span className="font-mono text-xs text-slate-700 flex items-center gap-1.5">
          <ClockCircleOutlined className="text-slate-400" />
          {dayjs(ts).format('DD/MM/YYYY HH:mm:ss')}
        </span>
      )
    },
    {
      title: 'Tài khoản',
      key: 'user',
      width: 170,
      render: () => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
            <UserOutlined />
          </div>
          <div>
            <div className="font-bold text-xs text-slate-800">{loggedUser?.name || 'Hệ thống'}</div>
            <div className="text-[10px] text-slate-400 font-mono">{loggedUser?.username || 'admin'}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: 120,
      render: (action: string) => getActionTag(action)
    },
    {
      title: 'Tên Nút / Thao tác API',
      key: 'text',
      render: (record: AuditLog) => (
        <div>
          <div className="font-bold text-xs text-slate-800">{record.text || 'Thao tác giao diện'}</div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-[10px] font-mono text-slate-400">
              Element: <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-semibold">{record.element}</span>
            </span>
            {record.requestBody !== undefined && (
              <Tag color="blue" className="text-[9px] font-mono m-0 border-blue-200">
                +Req Body
              </Tag>
            )}
            {record.responseBody !== undefined && (
              <Tag color="emerald" className="text-[9px] font-mono m-0 border-emerald-200">
                +Resp Body
              </Tag>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Module / URL Route',
      dataIndex: 'path',
      key: 'path',
      width: 200,
      render: (path: string, record: AuditLog) => (
        <div className="space-y-0.5">
          <Tag color="cyan" className="font-mono text-[11px] m-0 border-cyan-200 block truncate max-w-[180px]">
            {path}
          </Tag>
          {record.url && (
            <div className="text-[10px] font-mono text-slate-400 truncate max-w-[180px]" title={record.url}>
              {record.url}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Giá trị / Chi tiết',
      key: 'value',
      width: 180,
      render: (record: AuditLog) => (
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600 font-mono truncate max-w-[110px]" title={record.value}>
            {record.value ? record.value : '-'}
          </span>
          <Button 
            type="text" 
            size="small" 
            icon={<EyeOutlined className="text-blue-600" />}
            onClick={() => {
              setSelectedLog(record);
              setIsDetailModalOpen(true);
            }}
          >
            Chi tiết
          </Button>
        </div>
      )
    }
  ];

  return (
    <PageContainer
      title="Nhật ký Hệ thống & Audit Logs"
      subtitle="Theo dõi & Giám sát toàn bộ thao tác, tương tác nút bấm, thay đổi dữ liệu thời gian thực"
    >
      <div className="space-y-5">
        {/* Top KPI Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card className="shadow-sm border border-slate-200/80 rounded-xl bg-white p-2">
              <Statistic 
                title={<span className="text-xs font-semibold text-slate-500">Tổng sự kiện ghi nhận</span>}
                value={stats.total}
                prefix={<HistoryOutlined className="text-blue-600 mr-1" />}
                valueStyle={{ color: '#1e293b', fontWeight: 800, fontSize: 22 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="shadow-sm border border-slate-200/80 rounded-xl bg-white p-2">
              <Statistic 
                title={<span className="text-xs font-semibold text-slate-500">API Calls (Req & Resp)</span>}
                value={stats.apiCalls}
                prefix={<CodeOutlined className="text-emerald-600 mr-1" />}
                valueStyle={{ color: '#059669', fontWeight: 800, fontSize: 22 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="shadow-sm border border-slate-200/80 rounded-xl bg-white p-2">
              <Statistic 
                title={<span className="text-xs font-semibold text-slate-500">Clicks Nút bấm (CLICK)</span>}
                value={stats.clicks}
                prefix={<CheckCircleOutlined className="text-sky-600 mr-1" />}
                valueStyle={{ color: '#0284c7', fontWeight: 800, fontSize: 22 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="shadow-sm border border-slate-200/80 rounded-xl bg-white p-2">
              <Statistic 
                title={<span className="text-xs font-semibold text-slate-500">Thay đổi Ô nhập (CHANGE)</span>}
                value={stats.changes}
                prefix={<CodeOutlined className="text-amber-600 mr-1" />}
                valueStyle={{ color: '#d97706', fontWeight: 800, fontSize: 22 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filter Toolbar Card */}
        <Card className="shadow-sm border border-slate-200 rounded-xl bg-white">
          <div className="space-y-3">
            {/* Category Segmented Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Phân loại Nhật ký:</span>
                <Segmented
                  options={[
                    { value: 'all', label: `Tất cả (${logs.length})` },
                    { value: 'api', label: `Chỉ API Calls (${stats.apiCalls})` },
                    { value: 'ui', label: `Giao diện UI (${logs.length - stats.apiCalls})` },
                  ]}
                  value={logCategory}
                  onChange={(val) => setLogCategory(val as any)}
                  className="bg-slate-100 p-0.5"
                />
              </div>

              <Segmented
                options={[
                  { value: 'table', icon: <UnorderedListOutlined />, label: 'Bảng' },
                  { value: 'timeline', icon: <NodeIndexOutlined />, label: 'Tiến trình' },
                ]}
                value={viewMode}
                onChange={(val) => setViewMode(val as 'table' | 'timeline')}
              />
            </div>

            <Row gutter={[16, 16]} align="middle" justify="space-between">
              <Col xs={24} lg={16}>
                <div className="flex flex-wrap items-center gap-3">
                  <Input 
                    prefix={<SearchOutlined className="text-slate-400" />} 
                    placeholder="Tìm theo tên nút, URL API, payload..." 
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    allowClear
                    className="w-full sm:w-64"
                  />

                  <Select 
                    value={filterAction} 
                    onChange={setFilterAction}
                    className="w-44"
                    options={[
                      { value: 'All', label: 'Tất cả Hành động' },
                      { value: 'API_GET', label: 'API GET' },
                      { value: 'API_POST', label: 'API POST' },
                      { value: 'API_PUT', label: 'API PUT' },
                      { value: 'API_DELETE', label: 'API DELETE' },
                      { value: 'CLICK', label: 'CLICK (Nhấp nút)' },
                      { value: 'CHANGE', label: 'CHANGE (Nhập liệu)' },
                      { value: 'NAVIGATE', label: 'NAVIGATE (Điều hướng)' },
                    ]}
                  />

                  <Select 
                    value={filterModule} 
                    onChange={setFilterModule}
                    className="w-44"
                    options={[
                      { value: 'All', label: 'Tất cả Module' },
                      { value: '/sales/orders', label: 'Đơn hàng POS' },
                      { value: '/sales/products', label: 'Sản phẩm' },
                      { value: '/sales/customers', label: 'Khách hàng' },
                      { value: '/sales/promotions', label: 'Khuyến mãi' },
                      { value: '/system/rbac', label: 'Phân quyền RBAC' },
                      { value: '/system/audit-logs', label: 'Audit Logs' },
                    ]}
                  />
                </div>
              </Col>

              <Col xs={24} lg={8} className="flex justify-start lg:justify-end items-center gap-3">
                <Button icon={<ReloadOutlined />} onClick={refreshLogs}>
                  Làm mới
                </Button>

                {canExport && (
                  <Button 
                    icon={<DownloadOutlined />} 
                    onClick={handleExportLogs}
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  >
                    Xuất Excel
                  </Button>
                )}

                {canDelete && (
                  <Button danger icon={<DeleteOutlined />} onClick={handleClearLogs}>
                    Xóa lịch sử
                  </Button>
                )}
              </Col>
            </Row>
          </div>
        </Card>

        {/* View Content: Smart Table with Expandable Rows vs Timeline */}
        {viewMode === 'table' ? (
          <Card className="shadow-sm border border-slate-200 rounded-xl overflow-hidden p-0">
            <Table
              dataSource={filteredLogs.map((l, i) => ({ ...l, key: i }))}
              columns={columns}
              pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (total) => `Tổng cộng ${total} nhật ký` }}
              size="middle"
              className="custom-audit-table"
              expandable={{
                expandedRowRender: (record: AuditLog) => (
                  <div className="bg-slate-900 p-4 rounded-xl text-xs space-y-3 font-mono border border-slate-800 text-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2 font-bold">
                        <CodeOutlined className="text-emerald-400" />
                        <span>Chi tiết Request & Response Payload:</span>
                        <code className="text-sky-300 font-mono text-[11px]">{record.method || 'GET'} {record.url || record.text}</code>
                      </div>
                      {record.status !== undefined && (
                        <Tag color={record.status >= 200 && record.status < 300 ? 'green' : 'red'} className="font-mono font-bold m-0">
                          HTTP {record.status} ({record.durationMs || 0}ms)
                        </Tag>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Request Payload */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-slate-400 font-sans text-[11px] font-bold">
                          <span>Dữ liệu gửi đi (Request Payload):</span>
                          {record.requestBody !== undefined && (
                            <Button 
                              size="small" 
                              type="text" 
                              className="text-sky-400 text-[10px] hover:text-sky-300 p-0 h-auto font-sans"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  typeof record.requestBody === 'object' 
                                    ? JSON.stringify(record.requestBody, null, 2) 
                                    : String(record.requestBody)
                                );
                                message.success('Đã sao chép Request Payload!');
                              }}
                            >
                              Sao chép JSON
                            </Button>
                          )}
                        </div>
                        <pre className="bg-slate-950 text-sky-300 p-3 rounded-lg text-[11px] font-mono overflow-x-auto max-h-60 border border-slate-800/80 leading-relaxed">
                          {record.requestBody !== undefined 
                            ? (typeof record.requestBody === 'object' ? JSON.stringify(record.requestBody, null, 2) : String(record.requestBody)) 
                            : 'Không có dữ liệu gửi đi (Empty / GET Request)'}
                        </pre>
                      </div>

                      {/* Response Payload */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-slate-400 font-sans text-[11px] font-bold">
                          <span>Dữ liệu nhận về (Response Payload):</span>
                          {record.responseBody !== undefined && (
                            <Button 
                              size="small" 
                              type="text" 
                              className="text-emerald-400 text-[10px] hover:text-emerald-300 p-0 h-auto font-sans"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  typeof record.responseBody === 'object' 
                                    ? JSON.stringify(record.responseBody, null, 2) 
                                    : String(record.responseBody)
                                );
                                message.success('Đã sao chép Response Payload!');
                              }}
                            >
                              Sao chép JSON
                            </Button>
                          )}
                        </div>
                        <pre className="bg-slate-950 text-emerald-400 p-3 rounded-lg text-[11px] font-mono overflow-x-auto max-h-60 border border-slate-800/80 leading-relaxed">
                          {record.responseBody !== undefined 
                            ? (typeof record.responseBody === 'object' ? JSON.stringify(record.responseBody, null, 2) : String(record.responseBody)) 
                            : 'Không có dữ liệu phản hồi'}
                        </pre>
                      </div>
                    </div>
                  </div>
                ),
                rowExpandable: (record) => Boolean(record.requestBody !== undefined || record.responseBody !== undefined || record.url)
              }}
            />
          </Card>
        ) : (
          <Card className="shadow-sm border border-slate-200 rounded-xl bg-slate-50/50 p-6">
            {filteredLogs.length === 0 ? (
              <Empty description="Không tìm thấy nhật ký thao tác phù hợp" />
            ) : (
              <div className="space-y-4 max-w-4xl mx-auto">
                {filteredLogs.slice(0, 50).map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.015 }}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4"
                  >
                    <div className="shrink-0 pt-1">
                      {getActionTag(log.action)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-sm">{log.text || 'Thao tác Giao diện'}</span>
                        <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                          <ClockCircleOutlined />
                          {dayjs(log.timestamp).format('DD/MM/YYYY HH:mm:ss')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 flex items-center gap-2">
                        <span>Đường dẫn:</span>
                        <Tag color="cyan" className="font-mono text-[10px]">{log.path}</Tag>
                        <span>Element ID:</span>
                        <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{log.element}</span>
                      </div>
                      {log.value && (
                        <div className="mt-2 text-xs bg-slate-50 p-2 rounded border border-slate-200/80 font-mono text-slate-700">
                          Giá trị / Input: {log.value}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <InfoCircleOutlined className="text-blue-600" />
            <span>Chi tiết Sự kiện & Request/Response Audit Log</span>
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        width={720}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>
        ]}
      >
        {selectedLog && (
          <div className="space-y-3 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[11px]">Mốc thời gian:</span>
                <span className="font-mono font-bold text-slate-800">{dayjs(selectedLog.timestamp).format('DD/MM/YYYY HH:mm:ss')}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Loại hành động:</span>
                <div className="mt-0.5">{getActionTag(selectedLog.action)}</div>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Thao tác / URL:</span>
                <span className="font-semibold text-slate-800 break-all">{selectedLog.text || selectedLog.url || 'Giao diện'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Route / Path:</span>
                <span className="font-mono text-blue-600 font-semibold">{selectedLog.path}</span>
              </div>
              {selectedLog.method && (
                <div>
                  <span className="text-slate-500 block text-[11px]">HTTP Method:</span>
                  <Tag color="purple" className="font-mono font-bold">{selectedLog.method}</Tag>
                </div>
              )}
              {selectedLog.status !== undefined && (
                <div>
                  <span className="text-slate-500 block text-[11px]">Mã HTTP Status:</span>
                  <Tag color={selectedLog.status >= 200 && selectedLog.status < 300 ? 'green' : 'volcano'} className="font-mono font-bold">
                    {selectedLog.status} {selectedLog.durationMs !== undefined ? `(${selectedLog.durationMs}ms)` : ''}
                  </Tag>
                </div>
              )}
            </div>

            {selectedLog.url && (
              <div className="p-2.5 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] break-all">
                <span className="text-emerald-400 font-bold">{selectedLog.method || 'GET'}</span> {selectedLog.url}
              </div>
            )}

            {selectedLog.requestBody !== undefined && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Dữ liệu gửi đi (Request Payload):</span>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="small" 
                      type="text" 
                      className="text-blue-600 text-[11px] hover:text-blue-800 p-0 h-auto font-medium"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          typeof selectedLog.requestBody === 'object' 
                            ? JSON.stringify(selectedLog.requestBody, null, 2) 
                            : String(selectedLog.requestBody)
                        );
                        message.success('Đã sao chép Request Payload!');
                      }}
                    >
                      Sao chép Request JSON
                    </Button>
                    <Tag color="blue" className="text-[10px] font-mono m-0">JSON Body</Tag>
                  </div>
                </div>
                <pre className="bg-slate-950 text-sky-300 p-3 rounded-lg text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800">
                  {typeof selectedLog.requestBody === 'object' 
                    ? JSON.stringify(selectedLog.requestBody, null, 2) 
                    : String(selectedLog.requestBody)}
                </pre>
              </div>
            )}

            {selectedLog.responseBody !== undefined && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Dữ liệu nhận về (Response Payload):</span>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="small" 
                      type="text" 
                      className="text-emerald-600 text-[11px] hover:text-emerald-800 p-0 h-auto font-medium"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          typeof selectedLog.responseBody === 'object' 
                            ? JSON.stringify(selectedLog.responseBody, null, 2) 
                            : String(selectedLog.responseBody)
                        );
                        message.success('Đã sao chép Response Payload!');
                      }}
                    >
                      Sao chép Response JSON
                    </Button>
                    <Tag color="emerald" className="text-[10px] font-mono m-0">JSON Response</Tag>
                  </div>
                </div>
                <pre className="bg-slate-950 text-emerald-400 p-3 rounded-lg text-[11px] font-mono overflow-x-auto max-h-56 border border-slate-800">
                  {typeof selectedLog.responseBody === 'object' 
                    ? JSON.stringify(selectedLog.responseBody, null, 2) 
                    : String(selectedLog.responseBody)}
                </pre>
              </div>
            )}

            <div className="py-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 block font-semibold">Toàn bộ Raw Audit Log DTO:</span>
                <Button 
                  size="small" 
                  type="text" 
                  className="text-slate-600 text-[11px] hover:text-slate-900 p-0 h-auto font-medium"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
                    message.success('Đã sao chép toàn bộ DTO!');
                  }}
                >
                  Sao chép Raw DTO
                </Button>
              </div>
              <pre className="bg-slate-100 text-slate-800 p-3 rounded-lg text-[10px] font-mono overflow-x-auto border border-slate-200/80">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default AuditLogs;
