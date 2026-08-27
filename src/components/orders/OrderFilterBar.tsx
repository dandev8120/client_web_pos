import React, { useEffect, useMemo, useState } from 'react';
import { Form, Row, Col, Input, InputNumber, Select, DatePicker, Button, Space, Tooltip } from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined, UpOutlined, DownOutlined, ShopOutlined, UserOutlined, FileTextOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  siteService,
  TENANT_BRANCHES_STORAGE_KEY,
  TENANT_BRANCHES_UPDATED_EVENT,
  TenantBranch,
} from '../../services/siteService';

interface OrderFilterBarProps {
  form: any;
  quickSearch?: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSearch: (values?: any) => void;
  onRefresh?: () => void;
  onReset: () => void;
}

export const OrderFilterBar: React.FC<OrderFilterBarProps> = ({
  form,
  isExpanded,
  onToggleExpand,
  onSearch,
  onReset,
}) => {
  const [tenantBranches, setTenantBranches] = useState<TenantBranch[]>(() => siteService.getTenantBranches());

  useEffect(() => {
    const syncTenantBranches = () => {
      setTenantBranches(siteService.getTenantBranches());
    };

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === TENANT_BRANCHES_STORAGE_KEY) {
        syncTenantBranches();
      }
    };

    window.addEventListener(TENANT_BRANCHES_UPDATED_EVENT, syncTenantBranches);
    window.addEventListener('storage', handleStorage);
    syncTenantBranches();

    return () => {
      window.removeEventListener(TENANT_BRANCHES_UPDATED_EVENT, syncTenantBranches);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const siteOptions = useMemo(() => {
    return tenantBranches.map((branch) => {
      const maNhomSite = branch.maNhomSite || branch.nhomSite?.maNhomSite || '';
      const tenSite = branch.tenSite || 'Chưa có tên cửa hàng';
      const label = `${branch.maSite}(${tenSite})`;

      return {
        value: branch.maSite,
        label,
        searchText: `${maNhomSite} ${branch.maSite} ${tenSite} ${branch.nhomSite?.tenNhomSite || ''}`,
        branch: {
          ...branch,
          maNhomSite,
          tenSite,
        },
      };
    });
  }, [tenantBranches]);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-100 shadow-sm mb-4 space-y-4">
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => onSearch(values)}
      >
        {/* Priority Filter Row: Primary Criteria */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6} lg={6}>
            <Form.Item
              name="maSites"
              label={<span className="bg-white px-1 font-semibold text-slate-700 text-[11px] uppercase tracking-wider"><ShopOutlined className="mr-1 text-blue-500" />Mã Cửa Hàng</span>}
              className="floating-label-wrap"
            >
              <Select
                mode="tags"
                placeholder="Chọn hoặc nhập mã cửa hàng..."
                allowClear
                showSearch
                tokenSeparators={[',', ' ']}
                maxTagCount="responsive"
                popupMatchSelectWidth={420}
                options={siteOptions}
                optionFilterProp="searchText"
                optionLabelProp="label"
                optionRender={(option) => {
                  const branch = (option.data as any).branch as TenantBranch | undefined;

                  if (!branch) return option.label;

                  return (
                    <div className="py-1 leading-snug">
                      <div className="font-semibold text-slate-800 truncate">{option.label}</div>
                      <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                        <div>
                          <span className="font-semibold text-slate-700">Chi nhánh:</span>{' '}
                          {branch.maNhomSite || 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Mã cửa hàng:</span>{' '}
                          <span className="font-mono">{branch.maSite}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Tên cửa hàng:</span>{' '}
                          {branch.tenSite || 'Chưa có tên cửa hàng'}
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6} lg={6}>
            <Form.Item
              name="soCTus"
              label={<span className="bg-white px-1 font-semibold text-slate-700 text-[11px] uppercase tracking-wider"><FileTextOutlined className="mr-1 text-emerald-500" />Mã Đơn / Số Chứng Từ</span>}
              className="floating-label-wrap"
            >
              <Select
                mode="tags"
                placeholder="Nhập mã chứng từ (ấn Enter)..."
                allowClear
                tokenSeparators={[',', ' ']}
                maxTagCount="responsive"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6} lg={6}>
            <Form.Item
              name="maKH"
              label={<span className="bg-white px-1 font-semibold text-slate-700 text-[11px] uppercase tracking-wider"><UserOutlined className="mr-1 text-amber-500" />Mã Khách Hàng</span>}
              className="floating-label-wrap"
            >
              <Input placeholder="Mã KH (VD: 00000000001198)" allowClear />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6} lg={6}>
            <Form.Item
              name="dateRange"
              label={<span className="bg-white px-1 font-semibold text-slate-700 text-[11px] uppercase tracking-wider"><CalendarOutlined className="mr-1 text-purple-500" />Khoảng Thời Gian</span>}
              className="floating-label-wrap"
            >
              <DatePicker.RangePicker
                className="w-full"
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
                placement="bottomLeft"
                classNames={{ popup: { root: 'mobile-responsive-picker' } }}
                presets={[
                  { label: 'Hôm nay', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
                  { label: 'Hôm qua', value: [dayjs().subtract(1, 'day').startOf('day'), dayjs().subtract(1, 'day').endOf('day')] },
                  { label: '3 ngày', value: [dayjs().subtract(2, 'day').startOf('day'), dayjs().endOf('day')] },
                  { label: '7 ngày', value: [dayjs().subtract(6, 'day').startOf('day'), dayjs().endOf('day')] },
                  { label: 'Tuần này', value: [dayjs().startOf('week'), dayjs().endOf('week')] },
                  { label: 'Tháng này', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
                  { label: 'Tháng trước', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Advanced Filters Panel */}
        {isExpanded && (
          <div className="pt-4 mt-4 border-t border-slate-100 bg-slate-50/60 p-4 rounded-xl space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Tìm Kiếm Nâng Cao
            </div>

            <Row gutter={[12, 12]}>
              {/* Product & Customer Details */}
              <Col xs={24} sm={12} md={6} lg={6}>
                <Form.Item name="dienThoai" label={<span className="bg-[#f8fafc] px-1 text-slate-700 text-[11px] font-medium">Số điện thoại</span>} className="floating-label-wrap">
                  <Input placeholder="Nhập SĐT..." allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Form.Item name="maHH" label={<span className="bg-[#f8fafc] px-1 text-slate-700 text-[11px] font-medium">Mã hàng hóa</span>} className="floating-label-wrap">
                  <Input placeholder="Mã hàng..." allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Form.Item name="maBC" label={<span className="bg-[#f8fafc] px-1 text-slate-700 text-[11px] font-medium">Mã Barcode</span>} className="floating-label-wrap">
                  <Input placeholder="Barcode..." allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Form.Item name="loaiCK" label={<span className="bg-[#f8fafc] px-1 text-slate-700 text-[11px] font-medium">Loại chiết khấu</span>} className="floating-label-wrap">
                  <Input placeholder="Loại chiết khấu..." allowClear />
                </Form.Item>
              </Col>

              {/* Amount Ranges */}
              <Col xs={24} sm={12} md={6} lg={6}>
                <Form.Item name="thucThuMin" label={<span className="bg-[#f8fafc] px-1 text-slate-700 text-[11px] font-medium">Thực thu Min</span>} className="floating-label-wrap">
                  <InputNumber className="w-full" style={{ width: "100%" }} placeholder="0" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Form.Item name="thucThuMax" label={<span className="bg-[#f8fafc] px-1 text-slate-700 text-[11px] font-medium">Thực thu Max</span>} className="floating-label-wrap">
                  <InputNumber className="w-full" style={{ width: "100%" }} placeholder="Max" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Form.Item name="tienTheMin" label={<span className="bg-[#f8fafc] px-1 text-slate-700 text-[11px] font-medium">Tiền thẻ Min</span>} className="floating-label-wrap">
                  <InputNumber className="w-full" style={{ width: "100%" }} placeholder="0" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Form.Item name="tienPhieuMin" label={<span className="bg-[#f8fafc] px-1 text-slate-700 text-[11px] font-medium">Tiền phiếu Min</span>} className="floating-label-wrap">
                  <InputNumber className="w-full" style={{ width: "100%" }} placeholder="0" />
                </Form.Item>
              </Col>

              {/* Discount Ranges & Keywords */}
              <Col xs={24} sm={12} md={6} lg={6}>
                <Form.Item name="chietKhauMin" label={<span className="bg-[#f8fafc] px-1 text-slate-700 text-[11px] font-medium">Chiết khấu Min</span>} className="floating-label-wrap">
                  <InputNumber className="w-full" style={{ width: "100%" }} placeholder="0" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Form.Item name="chietKhauMax" label={<span className="bg-[#f8fafc] px-1 text-slate-700 text-[11px] font-medium">Chiết khấu Max</span>} className="floating-label-wrap">
                  <InputNumber className="w-full" style={{ width: "100%" }} placeholder="Max" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Form.Item name="paymentKeyword" label={<span className="bg-[#f8fafc] px-1 text-slate-700 text-[11px] font-medium">Từ khóa PTTT</span>} className="floating-label-wrap">
                  <Input placeholder="TM, CK, QR..." allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Form.Item name="invoiceKeyword" label={<span className="bg-[#f8fafc] px-1 text-slate-700 text-[11px] font-medium">Từ khóa HĐ VAT</span>} className="floating-label-wrap">
                  <Input placeholder="Số HĐ VAT..." allowClear />
                </Form.Item>
              </Col>
            </Row>
          </div>
        )}

        {/* Bottom Form Action Buttons */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 pt-3 border-t border-slate-100 mt-3">
          <Button
            type="text"
            icon={<FilterOutlined />}
            onClick={onToggleExpand}
            className={`transition-colors text-xs font-medium shrink-0 ${isExpanded ? 'text-blue-600 bg-blue-50' : 'text-slate-600 bg-slate-50'}`}
          >
            <span className="whitespace-nowrap">{isExpanded ? 'Tìm kiếm cơ bản' : 'Tìm kiếm nâng cao'}</span>
            {isExpanded ? <UpOutlined /> : <DownOutlined />}
          </Button>

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <Tooltip title="Xóa tất cả các trường đã nhập trên Form">
              <Button
                icon={<ReloadOutlined className="text-slate-600" />}
                onClick={onReset}
                className="hover:border-slate-400 whitespace-nowrap"
              >
                Làm mới
              </Button>
            </Tooltip>

            <Button
              type="primary"
              htmlType="submit"
              className="bg-blue-600 font-medium px-5 whitespace-nowrap"
              icon={<SearchOutlined />}
            >
              Tìm kiếm
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};
