import React from 'react';
import { Form, Row, Col, Input, Select, Button, Space, Tooltip, Tag } from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  UpOutlined,
  DownOutlined,
  TeamOutlined,
  AppstoreOutlined,
  SafetyCertificateOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { RoleResponseDto } from '../../dtos/AuthorizationDto';

interface AccessControlFilterBarProps {
  form: any;
  roles: RoleResponseDto[];
  selectedRoleCode: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSearch: (values?: any) => void;
  onRefresh?: () => void;
  onReset: () => void;
}

export const AccessControlFilterBar: React.FC<AccessControlFilterBarProps> = ({
  form,
  roles,
  selectedRoleCode,
  isExpanded,
  onToggleExpand,
  onSearch,
  onRefresh,
  onReset,
}) => {
  const roleOptions = roles.map(r => ({
    value: r.code,
    label: (
      <div className="flex items-center justify-between gap-2 py-0.5">
        <span className="font-semibold text-slate-800 text-xs truncate">{r.name || r.code}</span>
        <div className="flex items-center gap-1 shrink-0">
          <Tag color={r.isSystemRole ? 'gold' : 'blue'} className="m-0 text-[10px] font-mono px-1 py-0">
            {r.isSystemRole ? 'Owner' : 'Role'}
          </Tag>
          <span className="font-mono text-[10px] text-slate-400">({r.code})</span>
        </div>
      </div>
    ),
    searchText: `${r.code} ${r.name} ${r.description || ''}`,
  }));

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-100 shadow-sm mb-4 space-y-4">
      <Form
        form={form}
        layout="vertical"
        onFinish={values => onSearch(values)}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={8}>
            <Form.Item
              name="role"
              label={
                <span className="bg-white px-1 font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
                  <TeamOutlined className="mr-1 text-blue-500" />
                  Vai trò cần phân quyền / kiểm tra
                </span>
              }
              className="floating-label-wrap"
            >
              <Select
                showSearch
                placeholder="Chọn vai trò người dùng..."
                popupMatchSelectWidth={380}
                options={roleOptions}
                optionFilterProp="searchText"
                onChange={val => {
                  form.setFieldsValue({ role: val });
                  onSearch({ ...form.getFieldsValue(), role: val });
                }}
                className="w-full"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={10} lg={10}>
            <Form.Item
              name="keyword"
              label={
                <span className="bg-white px-1 font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
                  <SearchOutlined className="mr-1 text-blue-500" />
                  Từ khóa (Tên chức năng, Code, URL)
                </span>
              }
              className="floating-label-wrap"
            >
              <Input
                placeholder="Nhập tên chức năng, mã code (vd: SALES_ORDERS)..."
                allowClear
                onPressEnter={() => onSearch(form.getFieldsValue())}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6} lg={6}>
            <Form.Item
              name="grantStatus"
              label={
                <span className="bg-white px-1 font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
                  <SafetyCertificateOutlined className="mr-1 text-blue-500" />
                  Trạng thái Cấp quyền
                </span>
              }
              className="floating-label-wrap"
            >
              <Select
                placeholder="Tất cả trạng thái"
                allowClear
                onChange={() => onSearch(form.getFieldsValue())}
                options={[
                  { value: 'all', label: 'Tất cả trạng thái' },
                  { value: 'granted', label: '✓ Đã cấp quyền (Granted)' },
                  { value: 'revoked', label: '✗ Chưa cấp quyền (Revoked)' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Secondary Expanded Criteria */}
        {isExpanded && (
          <div className="pt-3 border-t border-slate-100">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item
                  name="type"
                  label={
                    <span className="bg-white px-1 font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
                      <AppstoreOutlined className="mr-1 text-blue-500" />
                      Loại Node Chức Năng
                    </span>
                  }
                  className="floating-label-wrap"
                >
                  <Select
                    placeholder="Tất cả loại node"
                    allowClear
                    onChange={() => onSearch(form.getFieldsValue())}
                    options={[
                      { value: 'ALL', label: 'Tất cả loại node' },
                      { value: 'MODULE', label: 'MODULE (Khối chức năng chính)' },
                      { value: 'MENU', label: 'MENU (Mục menu điều hướng)' },
                      { value: 'PAGE', label: 'PAGE / ROUTE (Trang màn hình)' },
                      { value: 'ACTION', label: 'ACTION / BUTTON (Nút bấm & Hành động)' },
                      { value: 'SECTION', label: 'SECTION (Vùng giao diện / Tab)' },
                      { value: 'FIELD', label: 'FIELD / COLUMN (Trường dữ liệu / Cột)' },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item
                  name="status"
                  label={
                    <span className="bg-white px-1 font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
                      <SafetyCertificateOutlined className="mr-1 text-blue-500" />
                      Trạng thái Kích hoạt Node
                    </span>
                  }
                  className="floating-label-wrap"
                >
                  <Select
                    placeholder="Tất cả trạng thái node"
                    allowClear
                    onChange={() => onSearch(form.getFieldsValue())}
                    options={[
                      { value: 'all', label: 'Tất cả' },
                      { value: '1', label: 'Hoạt động (Active = 1)' },
                      { value: '0', label: 'Vô hiệu hóa (Inactive = 0)' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        )}

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button
            type="link"
            size="small"
            icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
            onClick={onToggleExpand}
            className="text-xs text-blue-600 font-semibold p-0 flex items-center"
          >
            {isExpanded ? 'Thu gọn bộ lọc nâng cao' : 'Bộ lọc nâng cao'}
          </Button>

          <Space size={8} wrap>
            <Tooltip title="Đặt lại bộ lọc tìm kiếm">
              <Button icon={<ClearOutlined />} onClick={onReset} className="text-xs">
                Đặt lại
              </Button>
            </Tooltip>

            {onRefresh && (
              <Tooltip title="Tải lại dữ liệu phân quyền">
                <Button icon={<ReloadOutlined className="text-blue-600" />} onClick={onRefresh} className="text-xs">
                  Làm mới
                </Button>
              </Tooltip>
            )}

            <Button
              type="primary"
              icon={<SearchOutlined />}
              htmlType="submit"
              className="text-xs bg-blue-600 hover:bg-blue-700"
            >
              Tìm kiếm
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default AccessControlFilterBar;
