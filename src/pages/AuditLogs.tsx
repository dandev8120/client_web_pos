import React, { useEffect, useMemo, useState } from 'react';
import { App, Button, DatePicker, Empty, Input, Modal, Select, Space, Table, Tag, Tooltip, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  ApiOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
  GlobalOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import PageContainer from '../components/PageContainer';
import { AuditLog, getAuditLogs } from '../utils/auditLogger';
import { auditService } from '../services/auditService';
import { hasButtonPermission } from '../utils/rbacPresets';

const { Paragraph, Text } = Typography;
const { RangePicker } = DatePicker;

const getLoggedUser = () => {
  try {
    const saved = localStorage.getItem('@@WEB_POS_PORTAL');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const getModuleLabel = (path: string) => {
  if (path.startsWith('/sales/orders')) return 'Đơn hàng';
  if (path.startsWith('/sales/products')) return 'Sản phẩm';
  if (path.startsWith('/sales/customers')) return 'Khách hàng';
  if (path.startsWith('/sales/promotions')) return 'Khuyến mãi';
  if (path.startsWith('/system/icons')) return 'Icons';
  if (path.startsWith('/system/rbac')) return 'Phân quyền';
  if (path.startsWith('/system/forms')) return 'Biểu mẫu';
  if (path === '/') return 'Dashboard';
  return path.split('/').filter(Boolean)[0] || 'Hệ thống';
};

const isApiLog = (log: AuditLog) => log.action.startsWith('API_') || Boolean(log.url || log.method);

const jsonBlock = (value: any) => (
  <pre className="max-h-[70vh] overflow-auto rounded-lg border border-slate-100 bg-slate-950 p-3 text-xs text-slate-100">
    {JSON.stringify(value, null, 2)}
  </pre>
);

const AuditLogs: React.FC = () => {
  const { message, modal } = App.useApp();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [searchText, setSearchText] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'ui' | 'api' | 'error'>('all');
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);

  const loggedUser = useMemo(getLoggedUser, []);
  const userRoles = useMemo(() => loggedUser?.roles || [loggedUser?.role || 'user'], [loggedUser]);
  const canExport = useMemo(
    () => hasButtonPermission(loggedUser?.buttonPermissions, 'system.audit.btn_export', userRoles),
    [loggedUser, userRoles]
  );
  const canDelete = useMemo(
    () => hasButtonPermission(loggedUser?.buttonPermissions, 'system.audit.btn_delete', userRoles),
    [loggedUser, userRoles]
  );

  const refreshLogs = () => setLogs(getAuditLogs());

  useEffect(() => {
    refreshLogs();
    const interval = window.setInterval(refreshLogs, 5000);
    return () => window.clearInterval(interval);
  }, []);

  const actionOptions = useMemo(
    () => Array.from(new Set(logs.map(log => log.action))).sort().map(action => ({ label: action, value: action })),
    [logs]
  );

  const moduleOptions = useMemo(
    () => Array.from(new Set(logs.map(log => getModuleLabel(log.path)))).sort().map(module => ({ label: module, value: module })),
    [logs]
  );

  const filteredLogs = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return logs.filter(log => {
      const moduleName = getModuleLabel(log.path);
      const searchable = [
        log.action,
        log.element,
        log.text,
        log.value,
        log.path,
        log.url,
        log.userName,
        log.userEmail,
        log.ipAddress,
        log.browserName,
        log.traceId,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchKeyword = !keyword || searchable.includes(keyword);
      const matchAction = actionFilter === 'all' || log.action === actionFilter;
      const matchModule = moduleFilter === 'all' || moduleName === moduleFilter;
      const matchType =
        typeFilter === 'all' ||
        (typeFilter === 'api' && isApiLog(log)) ||
        (typeFilter === 'ui' && !isApiLog(log)) ||
        (typeFilter === 'error' && (log.status === 0 || Number(log.status) >= 400));
      const matchRange =
        !range ||
        (dayjs(log.timestamp).isAfter(range[0].startOf('day')) && dayjs(log.timestamp).isBefore(range[1].endOf('day')));

      return matchKeyword && matchAction && matchModule && matchType && matchRange;
    });
  }, [actionFilter, logs, moduleFilter, range, searchText, typeFilter]);

  const stats = useMemo(() => {
    const api = logs.filter(isApiLog).length;
    const ui = logs.length - api;
    const errors = logs.filter(log => log.status === 0 || Number(log.status) >= 400).length;
    const traces = new Set(logs.map(log => log.traceId).filter(Boolean)).size;
    return { api, ui, errors, traces };
  }, [logs]);

  const handleExport = () => {
    if (!canExport) {
      message.warning('Bạn chưa có quyền xuất audit log.');
      return;
    }

    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `audit-logs-${dayjs().format('YYYYMMDD-HHmmss')}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    message.success(`Đã xuất ${filteredLogs.length} dòng audit log.`);
  };

  const handleClear = () => {
    if (!canDelete) {
      message.warning('Bạn chưa có quyền xóa audit log.');
      return;
    }

    modal.confirm({
      title: 'Xóa audit log local?',
      content: 'Thao tác này chỉ xóa audit log trên trình duyệt hiện tại.',
      okText: 'Xóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => {
        auditService.clearLogs();
        refreshLogs();
        message.success('Đã xóa audit log local.');
      },
    });
  };

  const columns: TableColumnsType<AuditLog> = [
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      width: 170,
      fixed: 'left',
      render: value => (
        <div className="leading-tight">
          <div className="font-semibold text-slate-800">{dayjs(value).format('DD/MM/YYYY HH:mm:ss')}</div>
          <div className="text-xs text-slate-400">{dayjs(value).format('YYYY-MM-DD')}</div>
        </div>
      ),
    },
    {
      title: 'Người dùng',
      width: 190,
      render: (_, log) => (
        <div className="min-w-0">
          <div className="truncate font-semibold text-slate-800">{log.userName || log.userEmail || 'Ẩn danh'}</div>
          <div className="truncate text-xs text-slate-500">{log.userEmail || log.userId || log.sessionId || 'Chưa có session'}</div>
        </div>
      ),
    },
    {
      title: 'Hành động',
      width: 170,
      render: (_, log) => (
        <Space direction="vertical" size={2}>
          <Tag color={isApiLog(log) ? 'purple' : 'blue'}>{log.action}</Tag>
          <Text type="secondary" className="text-xs">{log.element}</Text>
        </Space>
      ),
    },
    {
      title: 'Module / vị trí',
      width: 260,
      render: (_, log) => (
        <div>
          <div className="font-semibold text-slate-800">{getModuleLabel(log.path)}</div>
          <Paragraph className="!mb-0 text-xs" copyable={{ text: log.locationHref || log.path }} ellipsis={{ rows: 1 }}>
            {log.path}
          </Paragraph>
        </div>
      ),
    },
    {
      title: 'Nội dung',
      width: 280,
      render: (_, log) => (
        <div>
          <div className="line-clamp-1 text-sm text-slate-800">{log.text || log.value || '-'}</div>
          {log.value && <div className="line-clamp-1 text-xs text-slate-500">{log.value}</div>}
        </div>
      ),
    },
    {
      title: 'IP / trình duyệt',
      width: 230,
      render: (_, log) => (
        <div>
          <Space size={6}>
            <GlobalOutlined className="text-slate-400" />
            <Text className="font-mono text-xs">{log.ipAddress || 'Chưa ghi nhận'}</Text>
          </Space>
          <div className="mt-1 truncate text-xs text-slate-500">
            {log.browserName || 'Browser'} {log.browserVersion || ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Trace / trạng thái',
      width: 210,
      render: (_, log) => (
        <Space direction="vertical" size={4}>
          <Tag color={!isApiLog(log) ? 'blue' : log.status && log.status < 400 ? 'green' : 'red'}>
            {!isApiLog(log) ? 'UI' : log.status || 'ERROR'}
          </Tag>
          <Paragraph className="!mb-0 max-w-44 font-mono text-xs" copyable={{ text: log.traceId || '' }} ellipsis>
            {log.traceId || 'no-trace'}
          </Paragraph>
        </Space>
      ),
    },
    {
      title: '',
      width: 70,
      fixed: 'right',
      render: (_, log) => (
        <Tooltip title="Xem JSONB">
          <Button type="text" icon={<EyeOutlined />} onClick={() => setSelectedLog(log)} />
        </Tooltip>
      ),
    },
  ];

  return (
    <PageContainer noCard>
      <div className="space-y-4 sm:space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Total', logs.length, ReloadOutlined, 'blue'],
            ['API', stats.api, ApiOutlined, 'purple'],
            ['UI', stats.ui, FilterOutlined, 'cyan'],
            ['Trace', stats.traces, SearchOutlined, 'green'],
          ].map(([label, value, Icon, color]) => (
            <div key={label as string} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <Space size={10}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  {React.createElement(Icon as React.ComponentType)}
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-slate-400">{label as string}</div>
                  <div className="text-2xl font-bold text-slate-900">{value as number}</div>
                </div>
              </Space>
              {color === 'red' && stats.errors > 0 && <Tag color="red">{stats.errors}</Tag>}
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <Space wrap className="w-full">
            <Input
              allowClear
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Tìm action, user, IP, traceId, path..."
              value={searchText}
              onChange={event => setSearchText(event.target.value)}
              className="w-72"
            />
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { label: 'Tất cả', value: 'all' },
                { label: 'UI', value: 'ui' },
                { label: 'API', value: 'api' },
                { label: 'Lỗi', value: 'error' },
              ]}
              className="w-32"
            />
            <Select
              value={moduleFilter}
              onChange={setModuleFilter}
              options={[{ label: 'Tất cả module', value: 'all' }, ...moduleOptions]}
              className="w-44"
            />
            <Select
              showSearch
              value={actionFilter}
              onChange={setActionFilter}
              options={[{ label: 'Tất cả action', value: 'all' }, ...actionOptions]}
              className="w-48"
            />
            <RangePicker value={range} onChange={value => setRange(value as [Dayjs, Dayjs] | null)} />
            <Button icon={<ReloadOutlined />} onClick={refreshLogs}>Làm mới</Button>
            <Button icon={<DownloadOutlined />} type="primary" onClick={handleExport} disabled={!filteredLogs.length}>Xuất JSON</Button>
            <Button icon={<DeleteOutlined />} danger onClick={handleClear} disabled={!logs.length}>Xóa local</Button>
          </Space>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
          <Table
            rowKey={record => `${record.timestamp}-${record.traceId || record.action}`}
            columns={columns}
            dataSource={filteredLogs}
            size="middle"
            scroll={{ x: 1580 }}
            pagination={{ pageSize: 20, showSizeChanger: true }}
            locale={{
              emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có audit log thật." />,
            }}
          />
        </div>
      </div>

      <Modal
        title="Audit log JSONB"
        open={Boolean(selectedLog)}
        onCancel={() => setSelectedLog(null)}
        footer={
          <Space>
            <Button
              onClick={() => {
                if (!selectedLog) return;
                void navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
                message.success('Đã copy JSONB audit log.');
              }}
            >
              Copy JSON
            </Button>
            <Button type="primary" onClick={() => setSelectedLog(null)}>Đóng</Button>
          </Space>
        }
        width={1040}
      >
        {selectedLog && jsonBlock(selectedLog)}
      </Modal>
    </PageContainer>
  );
};

export default AuditLogs;
