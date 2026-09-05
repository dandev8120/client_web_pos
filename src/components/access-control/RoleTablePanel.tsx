import React, { useState, useMemo } from 'react';
import { Table, Button, Input, Dropdown, Badge, Space, Tag, Modal } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import {
  TeamOutlined,
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  ExportOutlined,
  ImportOutlined,
  KeyOutlined,
  StarFilled,
  CopyOutlined,
} from '@ant-design/icons';
import { RoleResponseDto } from '../../dtos/AuthorizationDto';

const OWNER_ROLES = [
  'IdentityBitisAdminAdministrator',
  'SkorubaIdentityAdminAdministrator',
];

function isOwnerRole(roleCode?: string): boolean {
  if (!roleCode) return false;
  return OWNER_ROLES.some(r => r.toLowerCase() === roleCode.toLowerCase());
}

interface RoleTablePanelProps {
  roles: RoleResponseDto[];
  selectedRoleCode: string;
  onSelectRole: (roleCode: string) => void;
  onAddRole: () => void;
  onEditRole: (role: RoleResponseDto) => void;
  onCloneRole: (role: RoleResponseDto) => void;
  onDeleteRole: (roleCode: string) => void;
  onBulkDeleteRoles: (roleCodes: string[]) => void;
  onOpenImport: () => void;
  onOpenExport: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
  currentPage?: number;
  pageSize?: number;
  onPaginationChange?: (page: number, pageSize: number) => void;
}

export const RoleTablePanel: React.FC<RoleTablePanelProps> = ({
  roles,
  selectedRoleCode,
  onSelectRole,
  onAddRole,
  onEditRole,
  onCloneRole,
  onDeleteRole,
  onBulkDeleteRoles,
  onOpenImport,
  onOpenExport,
  onRefresh,
  isLoading = false,
  currentPage = 1,
  pageSize = 6,
  onPaginationChange,
}) => {
  const [roleSearchKeyword, setRoleSearchKeyword] = useState<string>('');
  const [bulkSelectedRoleKeys, setBulkSelectedRoleKeys] = useState<React.Key[]>([]);

  const filteredRoles = useMemo(() => {
    const kw = (roleSearchKeyword || '').trim().toLowerCase();
    if (!kw) return roles;
    return roles.filter(
      r =>
        r.code.toLowerCase().includes(kw) ||
        (r.name && r.name.toLowerCase().includes(kw)) ||
        (r.description && r.description.toLowerCase().includes(kw))
    );
  }, [roles, roleSearchKeyword]);

  const handleConfirmDelete = (role: RoleResponseDto) => {
    Modal.confirm({
      title: `Xóa vai trò: ${role.code}?`,
      content:
        'Tất cả cấu hình phân quyền của vai trò này sẽ bị xóa vĩnh viễn. Thao tác không thể hoàn tác.',
      okText: 'Xóa vai trò',
      okButtonProps: { danger: true },
      cancelText: 'Hủy bỏ',
      onOk: () => onDeleteRole(role.code),
    });
  };

  const handleConfirmBulkDelete = () => {
    const nonSystemKeys = bulkSelectedRoleKeys.filter(
      k => !isOwnerRole(String(k))
    ) as string[];

    if (nonSystemKeys.length === 0) {
      return;
    }

    Modal.confirm({
      title: `Xác nhận xóa ${nonSystemKeys.length} vai trò đã chọn?`,
      content: 'Tất cả cấu hình phân quyền của các vai trò này sẽ bị xóa vĩnh viễn.',
      okText: 'Xóa các vai trò',
      okButtonProps: { danger: true },
      cancelText: 'Hủy bỏ',
      onOk: () => {
        onBulkDeleteRoles(nonSystemKeys);
        setBulkSelectedRoleKeys([]);
      },
    });
  };

  const roleTableColumns: ColumnsType<RoleResponseDto> = [
    {
      title: 'Vai trò & Mã',
      dataIndex: 'name',
      key: 'name',
      render: (_: any, record) => {
        const isSelected = record.code === selectedRoleCode;
        return (
          <div className="py-0.5 cursor-pointer select-none">
            <div className="flex items-center gap-1.5 flex-wrap">
              {record.isSystemRole && <StarFilled className="text-amber-500 text-xs" />}
              <span
                className={`font-semibold text-xs transition-colors ${
                  isSelected ? 'text-blue-700 font-bold' : 'text-slate-800 hover:text-blue-600'
                }`}
              >
                {record.name || record.code}
              </span>
              <Tag
                color={record.isSystemRole ? 'gold' : 'blue'}
                className="m-0 text-[10px] font-mono px-1 py-0"
              >
                {record.isSystemRole ? 'Owner' : 'Role'}
              </Tag>
              {record.status === 'inactive' && (
                <Tag color="default" className="m-0 text-[10px] px-1 py-0">
                  Tạm khóa
                </Tag>
              )}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">{record.code}</div>
          </div>
        );
      },
    },
    {
      title: 'Quyền',
      dataIndex: 'functionCodes',
      key: 'functionCodes',
      width: 90,
      align: 'center',
      render: (_: any, record) => {
        if (record.isSystemRole || (record.functionCodes || []).includes('*')) {
          return (
            <Tag color="gold" className="m-0 text-[10px] font-mono font-semibold">
              Toàn quyền
            </Tag>
          );
        }
        const count = record.functionCodes?.length || 0;
        return (
          <Tag color={count > 0 ? 'blue' : 'default'} className="m-0 text-[11px] font-mono">
            {count}
          </Tag>
        );
      },
    },
    {
      title: '',
      key: 'action',
      width: 44,
      align: 'center',
      render: (_: any, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'select',
                label: 'Phân quyền vai trò này',
                icon: <KeyOutlined />,
                onClick: info => {
                  info.domEvent.stopPropagation();
                  onSelectRole(record.code);
                },
              },
              {
                key: 'edit',
                label: 'Chỉnh sửa thông tin',
                icon: <EditOutlined />,
                onClick: () => onEditRole(record),
              },
              {
                key: 'clone',
                label: 'Nhân bản vai trò này',
                icon: <CopyOutlined />,
                onClick: () => onCloneRole(record),
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                label: 'Xóa vai trò',
                icon: <DeleteOutlined />,
                danger: true,
                disabled: record.isSystemRole,
                onClick: () => handleConfirmDelete(record),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button
            size="small"
            type="text"
            icon={<MoreOutlined className="text-slate-500 hover:text-slate-800" />}
            onClick={e => e.stopPropagation()}
          />
        </Dropdown>
      ),
    },
  ];

  const roleRowSelection: TableProps<RoleResponseDto>['rowSelection'] = {
    selectedRowKeys: bulkSelectedRoleKeys,
    onChange: setBulkSelectedRoleKeys,
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-5 h-full flex flex-col">
      {/* Left Header */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100 flex-wrap">
        <div className="flex items-center gap-2">
          <TeamOutlined className="text-blue-600 text-base" />
          <span className="font-bold text-slate-800 text-sm sm:text-base">Danh sách Vai trò</span>
          <Badge
            count={filteredRoles.length}
            showZero
            overflowCount={99}
            className="site-badge-count-sm"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={onAddRole}
            className="bg-blue-600 hover:bg-blue-700 text-xs shadow-xs"
          >
            Thêm vai trò
          </Button>

          <Dropdown
            menu={{
              items: [
                {
                  key: 'import',
                  label: 'Nhập JSONB / Cấu hình',
                  icon: <ImportOutlined />,
                  onClick: onOpenImport,
                },
                {
                  key: 'export',
                  label: 'Xuất cấu hình JSON',
                  icon: <ExportOutlined />,
                  onClick: onOpenExport,
                },
                {
                  type: 'divider',
                },
                {
                  key: 'refresh',
                  label: 'Làm mới dữ liệu',
                  icon: <ReloadOutlined />,
                  onClick: onRefresh,
                },
              ],
            }}
            trigger={['click']}
          >
            <Button size="small" icon={<MoreOutlined />} className="text-slate-600 border-slate-200" />
          </Dropdown>
        </div>
      </div>

      {/* Quick Search */}
      <div className="mb-3">
        <Input
          size="small"
          placeholder="Tìm vai trò theo mã, tên..."
          prefix={<SearchOutlined className="text-slate-400 text-xs" />}
          value={roleSearchKeyword}
          onChange={e => setRoleSearchKeyword(e.target.value)}
          allowClear
          className="rounded-lg"
        />
      </div>

      {/* Bulk Action Bar */}
      {bulkSelectedRoleKeys.length > 0 && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between gap-2 text-xs text-blue-900">
          <span>
            Đã chọn <strong>{bulkSelectedRoleKeys.length}</strong> vai trò
          </span>
          <Space size={4}>
            <Button size="small" type="text" onClick={() => setBulkSelectedRoleKeys([])}>
              Bỏ chọn
            </Button>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={handleConfirmBulkDelete}
            >
              Xóa
            </Button>
          </Space>
        </div>
      )}

      {/* Roles Table */}
      <div className="flex-1 overflow-x-auto">
        <Table<RoleResponseDto>
          rowKey="code"
          columns={roleTableColumns}
          dataSource={filteredRoles}
          rowSelection={roleRowSelection}
          size="small"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            size: 'small',
            showSizeChanger: true,
            pageSizeOptions: ['5', '6', '10', '20'],
            onChange: (page, pSize) => {
              if (onPaginationChange) {
                onPaginationChange(page, pSize);
              }
            },
            showTotal: total => `Tổng ${total} vai trò`,
          }}
          rowClassName={record =>
            `cursor-pointer transition-colors ${
              record.code === selectedRoleCode
                ? 'bg-blue-50/80 border-l-4 border-blue-600 font-medium'
                : 'hover:bg-slate-50'
            }`
          }
          onRow={record => ({
            onClick: () => onSelectRole(record.code),
          })}
        />
      </div>
    </div>
  );
};

export default RoleTablePanel;
