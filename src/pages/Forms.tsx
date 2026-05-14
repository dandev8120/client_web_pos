import React from 'react';
import { Form, Input, Button, Card, Row, Col, Select, DatePicker, Checkbox, Radio, Switch, Rate, Space, Typography, message, App } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import PageContainer from '../components/PageContainer';

const { Title, Paragraph } = Typography;

const Forms: React.FC = () => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const onFinish = (values: any) => {
    console.log('Success:', values);
    message.success('Form submitted successfully!');
  };

  return (
    <PageContainer title={t('forms')} subtitle="DEMO Components">
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Paragraph>
          This page demonstrates various Ant Design form components and validation patterns that you can use as templates.
        </Paragraph>

      <Row gutter={24}>
        <Col span={24}>
          <Card title="Advanced Inputs" variant="borderless" style={{ marginBottom: 24 }}>
            <Form layout="vertical">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Multiple Select with Tags & Search" name="tags">
                    <Select
                      mode="tags"
                      showSearch
                      style={{ width: '100%' }}
                      placeholder="Select or type to create markers"
                      options={[
                        { value: 'urgent', label: 'Urgent' },
                        { value: 'review', label: 'Review Required' },
                        { value: 'done', label: 'Completed' },
                        { value: 'ai', label: 'AI Generated' },
                      ]}
                      maxTagCount="responsive"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Multi-Selection with Groups" name="users" initialValue={['jack', 'lucy']}>
                    <Select
                      mode="multiple"
                      allowClear
                      style={{ width: '100%' }}
                      placeholder="Select team members"
                      options={[
                        {
                          label: 'Engineering',
                          options: [
                            { value: 'jack', label: 'Jack' },
                            { value: 'lucy', label: 'Lucy' },
                          ],
                        },
                        {
                          label: 'Design',
                          options: [
                            { value: 'yiminghe', label: 'Yiminghe' },
                          ],
                        },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={10}>
                  <Form.Item label="Date Range Selection (Presets)" name="range">
                    <DatePicker.RangePicker 
                      style={{ width: '100%' }} 
                      presets={[
                        { label: 'Today', value: [dayjs(), dayjs()] },
                        { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
                        { label: 'Last 15 Days', value: [dayjs().add(-15, 'd'), dayjs()] },
                        { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
                        { label: 'This Month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
                      ]}
                      format="DD-MM-YYYY"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={7}>
                  <Form.Item label="Month & Year Picker (Numbers)" name="month">
                    <DatePicker 
                        picker="month" 
                        style={{ width: '100%' }} 
                        format="MM-YYYY" // Shows as 05-2024
                        cellRender={(current, info) => {
                          if (info.type === 'month') {
                            const date = dayjs(current);
                            return (
                              <div className="ant-picker-cell-inner">
                                {date.month() + 1}
                              </div>
                            );
                          }
                          return info.originNode;
                        }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={7}>
                   <Form.Item label="Custom Date Display" name="custom_date">
                    <DatePicker 
                        style={{ width: '100%' }} 
                        showToday
                        format={(value) => `Selected: ${value.format('DD/MM/YYYY')}`}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Disabled Dates (Past Only)" name="limited_date">
                    <DatePicker 
                      style={{ width: '100%' }} 
                      disabledDate={(current) => current && current > dayjs().endOf('day')}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Time Selection" name="time">
                    <DatePicker.TimePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>


          <Card title="Business Registration Form" variant="borderless" style={{ marginBottom: 24 }}>
            <Form
              name="basic"
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ remember: true, rate: 3.5, active: true }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Company Name"
                    name="companyName"
                    rules={[{ required: true, message: 'Please input company name!' }]}
                  >
                    <Input placeholder="Enter company name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Business Email"
                    name="email"
                    rules={[
                      { required: true, message: 'Please input email!' },
                      { type: 'email', message: 'Please enter a valid email!' }
                    ]}
                  >
                    <Input placeholder="email@company.com" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item label="Industry" name="industry">
                    <Select 
                      placeholder="Select industry"
                      options={[
                        { value: 'tech', label: 'Technology' },
                        { value: 'finance', label: 'Finance' },
                        { value: 'health', label: 'Healthcare' },
                        { value: 'edu', label: 'Education' },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Company Size" name="size">
                    <Radio.Group>
                      <Radio value="small">S (1-10)</Radio>
                      <Radio value="medium">M (11-50)</Radio>
                      <Radio value="large">L (50+)</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Founded Date" name="founded">
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Office Location" name="location">
                <Input.TextArea rows={3} placeholder="Full address" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Service Rating" name="rate">
                    <Rate allowHalf />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Account Active" name="active" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="agreement" valuePropName="checked" rules={[{
                validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('Should accept agreement')),
              }]}>
                <Checkbox>I have read the <a href="#">agreement</a></Checkbox>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Submit Registration
                  </Button>
                  <Button variant="outlined" htmlType="button">
                    Reset
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
      </div>
    </PageContainer>
  );
};

export default Forms;
