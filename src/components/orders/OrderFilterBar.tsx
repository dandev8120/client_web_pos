import React from 'react';
import { Form, Row, Col, Input, InputNumber, Select, DatePicker, Button, Space, Tooltip } from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined, UpOutlined, DownOutlined, ShopOutlined, UserOutlined, FileTextOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

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
              label={<span className="font-semibold text-slate-700 text-xs uppercase tracking-wider"><ShopOutlined className="mr-1 text-blue-500" />Mã Cửa Hàng</span>} 
              className="mb-0"
            >
              <Select
                mode="tags"
                placeholder="Nhập mã cửa hàng (ấn Enter)..."
                allowClear
                tokenSeparators={[',', ' ']}
                maxTagCount="responsive"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6} lg={6}>
            <Form.Item 
              name="soCTus" 
              label={<span className="font-semibold text-slate-700 text-xs uppercase tracking-wider"><FileTextOutlined className="mr-1 text-emerald-500" />Mã Đơn / Số Chứng Từ</span>} 
              className="mb-0"
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
              label={<span className="font-semibold text-slate-700 text-xs uppercase tracking-wider"><UserOutlined className="mr-1 text-amber-500" />Mã Khách Hàng</span>} 
              className="mb-0"
            >
              <Input placeholder="Mã KH (VD: 00000000001101)" allowClear />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6} lg={6}>
            <Form.Item 
              name="dateRange" 
              label={<span className="font-semibold text-slate-700 text-xs uppercase tracking-wider"><CalendarOutlined className="mr-1 text-purple-500" />Khoảng Thời Gian</span>} 
              className="mb-0"
            >
              <DatePicker.RangePicker
                className="w-full"
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
                placement="bottomLeft"
                classNames={{ popup: { root: 'mobile-responsive-picker' } }}
                presets={[
                  { label: 'Hôm nay', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
                  { label: '3 ngày', value: [dayjs().subtract(2, 'day').startOf('day'), dayjs().endOf('day')] },
                  { label: '7 ngày', value: [dayjs().subtract(6, 'day').startOf('day'), dayjs().endOf('day')] },
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
              Bộ Lọc Chi Tiết Nâng Cao
            </div>

            <Row gutter={[12, 12]}>
              {/* Product & Customer Details */}
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="dienThoai" label="Số điện thoại" className="mb-2">
                  <Input placeholder="Nhập SĐT..." allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="maHH" label="Mã hàng hóa" className="mb-2">
                  <Input placeholder="Mã hàng..." allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="maBC" label="Mã Barcode" className="mb-2">
                  <Input placeholder="Barcode..." allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="loaiCK" label="Loại chiết khấu" className="mb-2">
                  <Select placeholder="Chọn loại CK" allowClear>
                    <Select.Option value="PERCENT">Phần trăm (%)</Select.Option>
                    <Select.Option value="FIXED">Cố định (VNĐ)</Select.Option>
                    <Select.Option value="PROMO_CODE">Mã khuyến mãi</Select.Option>
                  </Select>
                </Form.Item>
              </Col>

              {/* Amount Ranges */}
              <Col xs={12} sm={6} md={3}>
                <Form.Item name="thucThuMin" label="Thực thu Min" className="mb-2">
                  <InputNumber className="w-full" placeholder="0" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                </Form.Item>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <Form.Item name="thucThuMax" label="Thực thu Max" className="mb-2">
                  <InputNumber className="w-full" placeholder="Max" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                </Form.Item>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <Form.Item name="tienTheMin" label="Tiền thẻ Min" className="mb-2">
                  <InputNumber className="w-full" placeholder="0" />
                </Form.Item>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <Form.Item name="tienPhieuMin" label="Tiền phiếu Min" className="mb-2">
                  <InputNumber className="w-full" placeholder="0" />
                </Form.Item>
              </Col>

              {/* Discount Ranges & Keywords */}
              <Col xs={12} sm={6} md={3}>
                <Form.Item name="chietKhauMin" label="Chiết khấu Min" className="mb-2">
                  <InputNumber className="w-full" placeholder="0" />
                </Form.Item>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <Form.Item name="chietKhauMax" label="Chiết khấu Max" className="mb-2">
                  <InputNumber className="w-full" placeholder="Max" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={3}>
                <Form.Item name="paymentKeyword" label="Từ khóa PTTT" className="mb-2">
                  <Input placeholder="TM, CK, QR..." allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={3}>
                <Form.Item name="invoiceKeyword" label="Từ khóa HĐ VAT" className="mb-2">
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
            <span className="whitespace-nowrap">{isExpanded ? 'Thu gọn nâng cao' : 'Mở rộng nâng cao'}</span>
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
