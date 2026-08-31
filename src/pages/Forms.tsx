import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Row, 
  Col, 
  Select, 
  DatePicker, 
  Checkbox, 
  Radio, 
  Switch, 
  Rate, 
  Space, 
  Typography, 
  Tabs,
  Steps,
  Divider,
  Timeline,
  Avatar,
  Tooltip,
  Descriptions,
  InputNumber,
  Upload
} from 'antd';
import { 
  UploadOutlined, 
  PlusOutlined, 
  UserOutlined, 
  LockOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SendOutlined,
  FileTextOutlined,
  LayoutOutlined,
  SettingOutlined,
  AppstoreOutlined,
  CheckOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

import PageContainer from '../components/PageContainer';
import { message } from '../services/toastMessage';

const { Title, Paragraph, Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

export const Forms: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('common-forms');
  const [currentStep, setCurrentStep] = useState(0);

  const onFinish = (values: any) => {
    console.log('Form submission values:', values);
    message.success('Gửi thông tin biểu mẫu thành công!');
  };

  return (
    <PageContainer 
      title={t('forms', 'Quản lý Biểu mẫu')} 
      subtitle="Hệ thống tổng hợp và cấu hình tất cả các mẫu biểu mẫu nghiệp vụ, đăng ký, tìm kiếm & quy trình từng bước"
      noCard={true}
    >
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-6 mb-6">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          size="large"
          items={[
            {
              key: 'common-forms',
              label: (
                <Space>
                  <AppstoreOutlined className="text-blue-600" />
                  <span className="font-semibold text-slate-800">Thư viện Mẫu biểu mẫu Nghiệp vụ</span>
                </Space>
              ),
              children: (
                <div className="pt-4 space-y-6">
                  <Paragraph className="text-slate-500 text-xs sm:text-sm mb-4">
                    Tổng hợp các quy trình biểu mẫu tiêu chuẩn trong quản lý doanh nghiệp Web POS & ERP: Đăng ký, Đơn phê duyệt, Xử lý hàng loạt & Thông báo.
                  </Paragraph>

                  <Row gutter={[20, 20]}>
                    {/* Basic Form */}
                    <Col xs={24} lg={12}>
                      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                        <Card title="Biểu mẫu Cơ bản" variant="borderless" className="shadow-sm border border-slate-100 rounded-xl">
                          <Form layout="vertical" onFinish={onFinish} initialValues={{ size: 'default' }}>
                            <Form.Item label="Tiêu đề mục tiêu" name="title" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                              <Input placeholder="Nhập tiêu đề mục tiêu..." />
                            </Form.Item>
                            <Form.Item label="Thời gian thực hiện" name="range">
                              <RangePicker style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item label="Mô tả mục tiêu" name="desc">
                              <TextArea rows={3} placeholder="Mô tả chi tiết mục tiêu của bạn..." />
                            </Form.Item>
                            <Form.Item label="Trọng số (%)" name="weight">
                              <InputNumber min={0} max={100} style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item label="Công khai" name="public" valuePropName="checked">
                              <Switch />
                            </Form.Item>
                            <Form.Item style={{ marginBottom: 0 }}>
                              <Space>
                                <Button type="primary" htmlType="submit" className="bg-blue-600">Xác nhận</Button>
                                <Button>Hủy</Button>
                              </Space>
                            </Form.Item>
                          </Form>
                        </Card>
                      </motion.div>
                    </Col>

                    {/* Login & Security */}
                    <Col xs={24} lg={12}>
                      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card title="Đăng nhập & Xác thực Bảo mật" variant="borderless" className="shadow-sm border border-slate-100 rounded-xl">
                          <Form name="normal_login" className="login-form" initialValues={{ remember: true }} onFinish={onFinish}>
                            <Form.Item name="username" rules={[{ required: true, message: 'Vui lòng nhập tên người dùng!' }]}>
                              <Input prefix={<UserOutlined className="text-slate-400" />} placeholder="Tên người dùng / Email" />
                            </Form.Item>
                            <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                              <Input prefix={<LockOutlined className="text-slate-400" />} type="password" placeholder="Mật khẩu" />
                            </Form.Item>
                            <Form.Item>
                              <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Ghi nhớ phiên làm việc</Checkbox>
                              </Form.Item>
                              <a className="login-form-forgot text-blue-600 font-medium text-xs float-right" href="#forgot">Quên mật khẩu?</a>
                            </Form.Item>

                            <Form.Item>
                              <Button type="primary" htmlType="submit" className="login-form-button bg-blue-600" block>
                                Đăng nhập ngay
                              </Button>
                            </Form.Item>
                          </Form>

                          <Divider className="my-3 text-xs text-slate-400">Cấu hình bảo mật bổ sung</Divider>
                          <Form layout="horizontal" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
                            <Form.Item label="Xác thực 2 lớp (2FA)" name="2fa" valuePropName="checked" initialValue={true} style={{ marginBottom: 8 }}>
                              <Switch />
                            </Form.Item>
                            <Form.Item label="Thông báo Email" style={{ marginBottom: 0 }}>
                              <Checkbox.Group options={['Đăng nhập mới', 'Thay đổi mật khẩu', 'Khuyến mãi']} />
                            </Form.Item>
                          </Form>
                        </Card>
                      </motion.div>
                    </Col>

                    {/* Advanced Batch Processing */}
                    <Col xs={24}>
                      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <Card 
                          title="Xử lý dữ liệu hàng loạt (Batch Processing)" 
                          variant="borderless" 
                          className="shadow-sm border border-slate-100 rounded-xl"
                          extra={
                            <Space>
                              <Button icon={<PlusOutlined />} size="small">Thêm dòng</Button>
                              <Button type="primary" size="small" className="bg-blue-600">Lưu tất cả</Button>
                            </Space>
                          }
                        >
                          <Paragraph className="text-xs text-slate-500 mb-3">
                            Xử lý đồng thời nhiều bản ghi dữ liệu sản phẩm/kho hàng, tự động kiểm tra định dạng và lưu trữ tập trung.
                          </Paragraph>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                                  <th className="p-2.5">Mã SP</th>
                                  <th className="p-2.5">Tên Sản phẩm</th>
                                  <th className="p-2.5">Số lượng</th>
                                  <th className="p-2.5">Đơn giá (₫)</th>
                                  <th className="p-2.5">Kho hàng</th>
                                  <th className="p-2.5 text-center">Thao tác</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[1, 2, 3].map((row) => (
                                  <tr key={row} className="border-b border-slate-100 hover:bg-slate-50/50">
                                    <td className="p-2 font-mono font-bold text-blue-600">SP-00{row}</td>
                                    <td className="p-2">
                                      <Input defaultValue={row === 1 ? 'Áo sơ mi công sở cao cấp' : row === 2 ? 'Quần Jeans Slimfit Nam' : 'Giày Sneaker Sport Line'} variant="borderless" size="small" />
                                    </td>
                                    <td className="p-2">
                                      <InputNumber defaultValue={row * 5} variant="borderless" size="small" className="w-20" />
                                    </td>
                                    <td className="p-2">
                                      <InputNumber defaultValue={row * 150000} variant="borderless" size="small" className="w-28" />
                                    </td>
                                    <td className="p-2">
                                      <Select defaultValue="main" variant="borderless" size="small" className="w-28">
                                        <Select.Option value="main">Kho chính Q1</Select.Option>
                                        <Select.Option value="sub">Kho phụ Q3</Select.Option>
                                      </Select>
                                    </td>
                                    <td className="p-2 text-center">
                                      <Button type="link" danger size="small">Xóa</Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <Divider dashed className="my-4" />

                          <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 text-center">
                            <Upload.Dragger multiple action="/api/upload">
                              <p className="ant-upload-drag-icon text-blue-500 mb-1">
                                <UploadOutlined className="text-2xl" />
                              </p>
                              <p className="ant-upload-text text-xs font-semibold text-slate-700">Tải lên danh sách dữ liệu (Excel, CSV)</p>
                              <p className="ant-upload-hint text-[11px] text-slate-400">Hỗ trợ tải tệp cấu trúc chuẩn để hệ thống nhập liệu tự động.</p>
                            </Upload.Dragger>
                          </div>
                        </Card>
                      </motion.div>
                    </Col>

                    {/* Workflow Approval */}
                    <Col xs={24}>
                      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card title="Quy trình Phê duyệt Đề xuất (Multi-Stage Workflow)" variant="borderless" className="shadow-sm border border-slate-100 rounded-xl">
                          <Row gutter={[24, 24]}>
                            <Col xs={24} lg={16}>
                              <Title level={5} className="mb-3 text-slate-800">Tạo đề xuất mới</Title>
                              <Form layout="vertical">
                                <Row gutter={16}>
                                  <Col span={12}>
                                    <Form.Item label="Mã đề xuất" name="proposalId" initialValue="PRO-2026-8801">
                                      <Input disabled className="bg-slate-100 font-mono font-bold" />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <Form.Item label="Loại hình" name="category" required>
                                      <Select defaultValue="Sales">
                                        <Select.Option value="Sales">Kinh doanh & Khuyến mãi</Select.Option>
                                        <Select.Option value="R&D">Nghiên cứu & Phát triển</Select.Option>
                                        <Select.Option value="Marketing">Tiếp thị</Select.Option>
                                      </Select>
                                    </Form.Item>
                                  </Col>
                                </Row>

                                <Form.Item label="Tiêu đề đề xuất" required>
                                  <Input placeholder="Nhập tiêu đề đề xuất phê duyệt..." />
                                </Form.Item>

                                <Form.Item label="Nội dung chi tiết">
                                  <TextArea rows={4} placeholder="Mô tả chi tiết mục tiêu, ngân sách dự kiến và kế hoạch triển khai..." />
                                </Form.Item>

                                <Form.Item label="Người duyệt cấp cao">
                                  <Select mode="multiple" placeholder="Chọn người duyệt...">
                                    <Select.Option value="ceo">Nguyễn Văn A (Tổng Giám Đốc)</Select.Option>
                                    <Select.Option value="cto">Trần Thị B (Giám Đốc Công Nghệ)</Select.Option>
                                  </Select>
                                </Form.Item>

                                <Space>
                                  <Button type="primary" icon={<SendOutlined />} onClick={() => message.success('Đã gửi đề xuất phê duyệt!')} className="bg-blue-600">
                                    Gửi phê duyệt
                                  </Button>
                                  <Button icon={<FileTextOutlined />}>Lưu nháp</Button>
                                </Space>
                              </Form>
                            </Col>

                            <Col xs={24} lg={8}>
                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 h-full">
                                <Title level={5} className="mb-4 text-xs font-bold text-slate-700 uppercase tracking-wide">Tiến trình phê duyệt</Title>
                                <Timeline
                                  items={[
                                    {
                                      color: 'green',
                                      children: (
                                        <div>
                                          <Text strong className="text-xs text-slate-800">Khởi tạo đề xuất</Text>
                                          <div className="text-[11px] text-slate-400">Bởi: Lê Thị Nga - 14:30 Today</div>
                                        </div>
                                      ),
                                    },
                                    {
                                      color: 'blue',
                                      dot: <ClockCircleOutlined className="text-blue-600 text-sm" />,
                                      children: (
                                        <div>
                                          <Text strong className="text-xs text-blue-600">Chờ Quản lý Cửa hàng duyệt</Text>
                                          <div className="text-[11px] text-slate-400">Phòng Ban: Web POS Admin</div>
                                        </div>
                                      ),
                                    },
                                    {
                                      color: 'gray',
                                      children: <span className="text-xs text-slate-400">Ban Giám đốc phê duyệt</span>,
                                    },
                                    {
                                      color: 'gray',
                                      children: <span className="text-xs text-slate-400">Thực thi quy trình</span>,
                                    },
                                  ]}
                                />
                              </div>
                            </Col>
                          </Row>
                        </Card>
                      </motion.div>
                    </Col>

                    {/* Multi-Step Wizard */}
                    <Col xs={24}>
                      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <Card title="Quy trình Từng bước (Multi-step Wizard)" variant="borderless" className="shadow-sm border border-slate-100 rounded-xl">
                          <div className="max-w-3xl mx-auto py-2">
                            <Steps
                              current={currentStep}
                              items={[
                                { title: 'Thông tin cơ bản' },
                                { title: 'Cấu hình chi tiết' },
                                { title: 'Hoàn tất' }
                              ]}
                              className="mb-8"
                            />

                            <div className="min-h-[220px] p-5 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                              {currentStep === 0 && (
                                <Form layout="vertical">
                                  <Title level={5} className="mb-3 text-slate-800">Bước 1: Thông tin tài khoản</Title>
                                  <Row gutter={16}>
                                    <Col xs={24} sm={12}>
                                      <Form.Item label="Tên tài khoản" required>
                                        <Input placeholder="Nhập tên tài khoản..." />
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                      <Form.Item label="Email liên hệ" required>
                                        <Input placeholder="example@pos.domain" />
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                </Form>
                              )}
                              {currentStep === 1 && (
                                <Form layout="vertical">
                                  <Title level={5} className="mb-3 text-slate-800">Bước 2: Cấu hình phân quyền & Ngôn ngữ</Title>
                                  <Row gutter={16}>
                                    <Col xs={24} sm={12}>
                                      <Form.Item label="Ngôn ngữ mặc định">
                                        <Select defaultValue="vi">
                                          <Select.Option value="vi">Tiếng Việt</Select.Option>
                                          <Select.Option value="en">English</Select.Option>
                                        </Select>
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                      <Form.Item label="Chế độ hiển thị">
                                        <Radio.Group defaultValue="light">
                                          <Radio value="light">Sáng</Radio>
                                          <Radio value="dark">Tối</Radio>
                                        </Radio.Group>
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                </Form>
                              )}
                              {currentStep === 2 && (
                                <div className="text-center py-6">
                                  <CheckCircleOutlined className="text-5xl text-emerald-500 mb-3" />
                                  <Title level={4} className="m-0 text-slate-800">Sẵn sàng thiết lập!</Title>
                                  <Text type="secondary" className="text-xs">
                                    Xác nhận thông tin biểu mẫu đã điền. Nhấn "Hoàn tất" để cập nhật môi trường.
                                  </Text>
                                </div>
                              )}
                            </div>

                            <div className="mt-4 flex justify-between">
                              <Button disabled={currentStep === 0} onClick={() => setCurrentStep(prev => prev - 1)}>
                                Quay lại
                              </Button>
                              <Button 
                                type="primary" 
                                className="bg-blue-600"
                                onClick={() => {
                                  if (currentStep < 2) setCurrentStep(prev => prev + 1);
                                  else {
                                    message.success('Cấu hình biểu mẫu thành công!');
                                    setCurrentStep(0);
                                  }
                                }}
                              >
                                {currentStep === 2 ? 'Hoàn tất' : 'Tiếp theo'}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    </Col>
                  </Row>
                </div>
              )
            },
            {
              key: 'form-controls',
              label: (
                <Space>
                  <SettingOutlined className="text-indigo-600" />
                  <span className="font-semibold text-slate-800">Cấu hình & Thành phần Đầu vào Nâng cao</span>
                </Space>
              ),
              children: (
                <div className="pt-4 space-y-6">
                  <Paragraph className="text-slate-500 text-xs sm:text-sm mb-4">
                    Tối ưu hóa các trường dữ liệu đầu vào: Thẻ nhãn tags, chọn khoảng thời gian preset, lọc theo tháng/năm, và mẫu đăng ký doanh nghiệp.
                  </Paragraph>

                  <Card title="Thành phần Đầu vào Nâng cao (Advanced Input Controls)" variant="borderless" className="shadow-sm border border-slate-100 rounded-xl mb-6">
                    <Form layout="vertical">
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item label="Thẻ nhãn gắn kèm (Multiple Select Tags)" name="tags">
                            <Select
                              mode="tags"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Nhập hoặc chọn thẻ nhãn..."
                              options={[
                                { value: 'urgent', label: 'Cần xử lý gấp' },
                                { value: 'review', label: 'Chờ kiểm tra' },
                                { value: 'done', label: 'Đã hoàn tất' },
                                { value: 'ai', label: 'Xử lý tự động' },
                              ]}
                              maxTagCount="responsive"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item label="Chọn thành viên theo phòng ban" name="users" initialValue={['jack', 'lucy']}>
                            <Select
                              mode="multiple"
                              allowClear
                              style={{ width: '100%' }}
                              placeholder="Chọn nhân viên..."
                              options={[
                                {
                                  label: 'Kỹ thuật / IT',
                                  options: [
                                    { value: 'jack', label: 'Lê Văn Jack' },
                                    { value: 'lucy', label: 'Trần Thị Lucy' },
                                  ],
                                },
                                {
                                  label: 'Kế toán / Thu ngân',
                                  options: [
                                    { value: 'nga', label: 'Lê Thị Nga' },
                                  ],
                                },
                              ]}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} md={10}>
                          <Form.Item label="Khoảng thời gian (Presets nhanh)" name="range">
                            <DatePicker.RangePicker 
                              style={{ width: '100%' }} 
                              presets={[
                                { label: 'Hôm nay', value: [dayjs(), dayjs()] },
                                { label: '7 ngày qua', value: [dayjs().add(-7, 'd'), dayjs()] },
                                { label: '30 ngày qua', value: [dayjs().add(-30, 'd'), dayjs()] },
                                { label: 'Tháng này', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
                              ]}
                              format="DD/MM/YYYY"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={7}>
                          <Form.Item label="Chọn Tháng / Năm" name="month">
                            <DatePicker picker="month" style={{ width: '100%' }} format="MM-YYYY" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={7}>
                          <Form.Item label="Chọn Thời gian Chi tiết" name="time">
                            <DatePicker.TimePicker style={{ width: '100%' }} format="HH:mm:ss" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form>
                  </Card>

                  <Card title="Biểu mẫu Đăng ký Doanh nghiệp / Cửa hàng" variant="borderless" className="shadow-sm border border-slate-100 rounded-xl">
                    <Form layout="vertical" onFinish={onFinish} initialValues={{ remember: true, rate: 4.5, active: true }}>
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item label="Tên công ty / Cửa hàng" name="companyName" rules={[{ required: true, message: 'Vui lòng nhập tên công ty!' }]}>
                            <Input placeholder="Công ty TNHH Web POS Vietnam..." />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item label="Email Doanh nghiệp" name="email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}>
                            <Input placeholder="contact@company.com" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} md={8}>
                          <Form.Item label="Lĩnh vực hoạt động" name="industry">
                            <Select placeholder="Chọn lĩnh vực" options={[
                              { value: 'retail', label: 'Bán lẻ & Siêu thị' },
                              { value: 'fnb', label: 'Nhà hàng & F&B' },
                              { value: 'fashion', label: 'Thời trang & Mỹ phẩm' },
                            ]} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item label="Quy mô nhân sự" name="size">
                            <Radio.Group>
                              <Radio value="small">S (1-10)</Radio>
                              <Radio value="medium">M (11-50)</Radio>
                              <Radio value="large">L (50+)</Radio>
                            </Radio.Group>
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item label="Đánh giá chất lượng" name="rate">
                            <Rate allowHalf />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item label="Địa chỉ trụ sở chính" name="location">
                        <Input.TextArea rows={2} placeholder="Nhập địa chỉ đầy đủ..." />
                      </Form.Item>

                      <Form.Item name="agreement" valuePropName="checked" rules={[{ validator: (_, val) => val ? Promise.resolve() : Promise.reject(new Error('Vui lòng đồng ý điều khoản')) }]}>
                        <Checkbox>Tôi đã đọc và đồng ý với <a href="#terms" className="text-blue-600">Điều khoản dịch vụ</a></Checkbox>
                      </Form.Item>

                      <Form.Item style={{ marginBottom: 0 }}>
                        <Space>
                          <Button type="primary" htmlType="submit" className="bg-blue-600">Đăng ký Doanh nghiệp</Button>
                          <Button htmlType="reset">Làm mới</Button>
                        </Space>
                      </Form.Item>
                    </Form>
                  </Card>
                </div>
              )
            }
          ]}
        />
      </div>
    </PageContainer>
  );
};

export default Forms;
