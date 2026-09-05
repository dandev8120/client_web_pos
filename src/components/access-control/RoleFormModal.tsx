import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Radio, Alert } from 'antd';
import { TeamOutlined, CopyOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { RoleResponseDto } from '../../dtos/AuthorizationDto';
import { RoleFormData } from './accessControlTypes';

interface RoleFormModalProps {
  open: boolean;
  editingRole: RoleResponseDto | null;
  roles: RoleResponseDto[];
  cloneFromRoleCode?: string;
  onClose: () => void;
  onSubmit: (data: RoleFormData) => void;
}

export const RoleFormModal: React.FC<RoleFormModalProps> = ({
  open,
  editingRole,
  roles,
  cloneFromRoleCode,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const isEditing = !!editingRole;

  useEffect(() => {
    if (open) {
      if (editingRole) {
        form.setFieldsValue({
          code: editingRole.code,
          name: editingRole.name,
          description: editingRole.description,
          status: editingRole.status || 'active',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          status: 'active',
          cloneFromRoleCode: cloneFromRoleCode || undefined,
        });
      }
    }
  }, [open, editingRole, cloneFromRoleCode, form]);

  const handleAfterOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      if (editingRole) {
        form.setFieldsValue({
          code: editingRole.code,
          name: editingRole.name,
          description: editingRole.description,
          status: editingRole.status || 'active',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          status: 'active',
          cloneFromRoleCode: cloneFromRoleCode || undefined,
        });
      }
    }
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      onSubmit(values);
    });
  };

  // Build a unique key to force Form re-mount when switching between roles
  const formKey = editingRole
    ? `edit-${editingRole.code}`
    : `new-${cloneFromRoleCode || 'fresh'}`;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-base">
            <TeamOutlined />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm sm:text-base">
              {isEditing ? `Chỉnh sửa vai trò: ${editingRole?.code}` : 'Thêm vai trò mới'}
            </div>
            <div className="text-xs text-slate-500 font-normal">
              {isEditing ? 'Cập nhật thông tin vai trò người dùng' : 'Khởi tạo vai trò và phân quyền trong hệ thống'}
            </div>
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      afterOpenChange={handleAfterOpenChange}
      okText={isEditing ? 'Lưu thay đổi' : 'Tạo vai trò'}
      cancelText="Hủy bỏ"
      width={540}
      destroyOnHidden
    >
      <div className="py-2">
        {editingRole?.isSystemRole && (
          <Alert
            type="warning"
            showIcon
            message="Đây là Vai trò Quản trị Hệ thống (System Owner). Mã vai trò không thể thay đổi."
            className="mb-4 text-xs"
          />
        )}

        <Form
          key={formKey}
          form={form}
          layout="vertical"
          preserve={false}
          initialValues={editingRole ? {
            code: editingRole.code,
            name: editingRole.name,
            description: editingRole.description,
            status: editingRole.status || 'active',
          } : {
            status: 'active',
            cloneFromRoleCode: cloneFromRoleCode,
          }}
        >
          <Form.Item
            name="code"
            label={<span className="font-semibold text-slate-700 text-xs">Mã vai trò (Role Code)</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập mã vai trò!' },
              {
                pattern: /^[A-Za-z0-9_]+$/,
                message: 'Mã vai trò chỉ chứa chữ cái, số và dấu gạch dưới!',
              },
            ]}
          >
            <Input
              placeholder="VD: STORE_MANAGER, CASHIER, AUDITOR..."
              disabled={isEditing && editingRole?.isSystemRole}
              onChange={e => form.setFieldsValue({ code: e.target.value.toUpperCase() })}
              className="font-mono uppercase"
            />
          </Form.Item>

          <Form.Item
            name="name"
            label={<span className="font-semibold text-slate-700 text-xs">Tên hiển thị vai trò</span>}
            rules={[{ required: true, message: 'Vui lòng nhận tên hiển thị vai trò!' }]}
          >
            <Input placeholder="VD: Cửa hàng trưởng, Nhân viên Thu ngân..." />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="font-semibold text-slate-700 text-xs">Mô tả quyền hạn / Ghi chú</span>}
          >
            <Input.TextArea
              rows={3}
              placeholder="Mô tả phạm vi quyền hạn và trách nhiệm của vai trò này..."
            />
          </Form.Item>

          {!isEditing && (
            <Form.Item
              name="cloneFromRoleCode"
              label={
                <span className="font-semibold text-slate-700 text-xs flex items-center gap-1">
                  <CopyOutlined className="text-purple-500" />
                  Sao chép quyền từ vai trò sẵn có (Tùy chọn)
                </span>
              }
            >
              <Select
                placeholder="Chọn vai trò mẫu để sao chép quyền hạn..."
                allowClear
                options={roles.map(r => ({
                  value: r.code,
                  label: `${r.name || r.code} (${r.code})`,
                }))}
              />
            </Form.Item>
          )}

          <Form.Item
            name="status"
            label={<span className="font-semibold text-slate-700 text-xs">Trạng thái hoạt động</span>}
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio value="active">
                <span className="text-xs text-emerald-700 font-medium">Hoạt động (Active)</span>
              </Radio>
              <Radio value="inactive">
                <span className="text-xs text-slate-500 font-medium">Tạm khóa (Inactive)</span>
              </Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default RoleFormModal;
