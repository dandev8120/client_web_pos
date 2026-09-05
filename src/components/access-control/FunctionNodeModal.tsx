import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Radio, TreeSelect } from 'antd';
import { AppstoreOutlined, BranchesOutlined } from '@ant-design/icons';
import { FunctionNodeDto } from '../../dtos/AuthorizationDto';
import { FunctionNodeFormData } from './accessControlTypes';
import { getLocalizedFunctionTitle } from '../../utils/accessControlPresets';
import { accessControlService } from '../../services/accessControlService';

interface FunctionNodeModalProps {
  open: boolean;
  editingNode: FunctionNodeDto | null;
  parentNode: FunctionNodeDto | null;
  functionTree: FunctionNodeDto[];
  language: string;
  onClose: () => void;
  onSubmit: (data: FunctionNodeFormData) => void;
}

export const FunctionNodeModal: React.FC<FunctionNodeModalProps> = ({
  open,
  editingNode,
  parentNode,
  functionTree,
  language,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const isEditing = !!editingNode;
  const [treeData, setTreeData] = useState<any[]>([]);

  // Build tree data once when functionTree or editingNode changes
  useEffect(() => {
    const buildTreeSelectData = (nodes: FunctionNodeDto[]): any[] => {
      return nodes.map(node => ({
        title: `${getLocalizedFunctionTitle(node, language)} (${node.functionCode})`,
        value: node.id,
        key: node.id,
        disabled: editingNode && node.id === editingNode.id,
        children: node.children ? buildTreeSelectData(node.children) : undefined,
      }));
    };
    setTreeData(buildTreeSelectData(functionTree));
  }, [functionTree, editingNode, language]);

  // Populate form via afterOpenChange (most reliable for Modal + Form)
  const handleAfterOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      if (editingNode) {
        form.setFieldsValue({
          functionCode: editingNode.functionCode,
          titleVi: editingNode.titleName?.vi || editingNode.functionCode,
          titleEn: editingNode.titleName?.en || editingNode.functionCode,
          type: editingNode.type || 'ACTION',
          parentId: editingNode.parentId ?? null,
          url: editingNode.url || '',
          icon: editingNode.icon || '',
          sortOrder: editingNode.sortOrder ?? 1,
          status: editingNode.status ?? 1,
        });
      } else {
        form.resetFields();
        const suggestedType = parentNode
          ? accessControlService.getSuggestedChildType(parentNode.type)
          : 'MODULE';
        const suggestedCode = parentNode ? `${parentNode.functionCode}_` : '';
        const parentId = parentNode ? parentNode.id : null;
        form.setFieldsValue({
          functionCode: suggestedCode,
          type: suggestedType,
          parentId,
          sortOrder: accessControlService.getNextChildSortOrder(parentId),
          status: 1,
        });
      }
    }
  };

  // Build a unique key to force Form re-mount when switching between nodes/parents
  const formKey = editingNode
    ? `edit-${editingNode.id}`
    : `new-${parentNode ? `child-${parentNode.id}` : 'root'}`;

  // initialValues for first render after key change
  const initialValues = editingNode ? {
    functionCode: editingNode.functionCode,
    titleVi: editingNode.titleName?.vi || editingNode.functionCode,
    titleEn: editingNode.titleName?.en || editingNode.functionCode,
    type: editingNode.type || 'ACTION',
    parentId: editingNode.parentId ?? null,
    url: editingNode.url || '',
    icon: editingNode.icon || '',
    sortOrder: editingNode.sortOrder ?? 1,
    status: editingNode.status ?? 1,
  } : {
    type: parentNode ? accessControlService.getSuggestedChildType(parentNode.type) : 'MODULE',
    functionCode: parentNode ? `${parentNode.functionCode}_` : '',
    parentId: parentNode ? parentNode.id : null,
    sortOrder: accessControlService.getNextChildSortOrder(parentNode ? parentNode.id : null),
    status: 1,
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      onSubmit(values);
    });
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center text-base">
            <AppstoreOutlined />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm sm:text-base">
              {isEditing ? `Chỉnh sửa chức năng: ${editingNode?.functionCode}` : (parentNode ? `Thêm node con vào: ${parentNode.functionCode}` : 'Thêm chức năng / Module mới')}
            </div>
            <div className="text-xs text-slate-500 font-normal">
              {isEditing ? 'Cập nhật thông tin node cây chức năng' : 'Khai báo node phân quyền trong hệ thống'}
            </div>
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      afterOpenChange={handleAfterOpenChange}
      okText={isEditing ? 'Lưu thay đổi' : 'Thêm node'}
      cancelText="Hủy bỏ"
      width={600}
      destroyOnHidden
    >
      <div className="py-2">
        <Form
          key={formKey}
          form={form}
          layout="vertical"
          preserve={false}
          initialValues={initialValues}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item
              name="functionCode"
              label={<span className="font-semibold text-slate-700 text-xs">Mã chức năng (Function Code)</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập mã chức năng!' },
                {
                  pattern: /^[A-Za-z0-9_]+$/,
                  message: 'Mã chức năng chỉ chứa chữ cái, số và dấu gạch dưới!',
                },
              ]}
            >
              <Input
                placeholder="VD: SALES_ORDERS_CREATE"
                onChange={e => form.setFieldsValue({ functionCode: e.target.value.toUpperCase() })}
                className="font-mono uppercase"
              />
            </Form.Item>

            <Form.Item
              name="type"
              label={<span className="font-semibold text-slate-700 text-xs">Loại Node</span>}
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: 'MODULE', label: 'MODULE (Khối chức năng chính)' },
                  { value: 'MENU', label: 'MENU (Mục menu điều hướng)' },
                  { value: 'PAGE', label: 'PAGE / ROUTE (Trang màn hình)' },
                  { value: 'ACTION', label: 'ACTION / BUTTON (Nút bấm thao tác)' },
                  { value: 'SECTION', label: 'SECTION (Vùng giao diện / Tab)' },
                  { value: 'FIELD', label: 'FIELD / COLUMN (Trường dữ liệu / Cột)' },
                ]}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item
              name="titleVi"
              label={<span className="font-semibold text-slate-700 text-xs">Tên hiển thị (Tiếng Việt)</span>}
              rules={[{ required: true, message: 'Vui lòng nhập tên tiếng Việt!' }]}
            >
              <Input placeholder="VD: Quản lý Đơn hàng..." />
            </Form.Item>

            <Form.Item
              name="titleEn"
              label={<span className="font-semibold text-slate-700 text-xs">Tên hiển thị (Tiếng Anh)</span>}
              rules={[{ required: true, message: 'Vui lòng nhập tên tiếng Anh!' }]}
            >
              <Input placeholder="VD: Orders Management..." />
            </Form.Item>
          </div>

          <Form.Item
            name="parentId"
            label={
              <span className="font-semibold text-slate-700 text-xs flex items-center gap-1">
                <BranchesOutlined className="text-blue-500" />
                Node cha trực thuộc (Để trống = Cấp gốc Module)
              </span>
            }
          >
            <TreeSelect
              allowClear
              placeholder="Chọn node cha (Để trống nếu là Module gốc)..."
              treeData={treeData}
              treeDefaultExpandAll
              showSearch
            />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item
              name="url"
              label={<span className="font-semibold text-slate-700 text-xs">Đường dẫn URL / Route (Nếu có)</span>}
            >
              <Input placeholder="VD: /sales/orders" className="font-mono" />
            </Form.Item>

            <Form.Item
              name="icon"
              label={<span className="font-semibold text-slate-700 text-xs">Mã Icon (Nếu có)</span>}
            >
              <Input placeholder="VD: shopping-cart, user, setting..." />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item
              name="sortOrder"
              label={<span className="font-semibold text-slate-700 text-xs">Thứ tự hiển thị (sortOrder)</span>}
              rules={[{ required: true }]}
            >
              <InputNumber min={1} max={999} className="w-full font-mono" />
            </Form.Item>

            <Form.Item
              name="status"
              label={<span className="font-semibold text-slate-700 text-xs">Trạng thái</span>}
              rules={[{ required: true }]}
            >
              <Radio.Group>
                <Radio value={1}>
                  <span className="text-xs text-emerald-700 font-medium">Hoạt động (1)</span>
                </Radio>
                <Radio value={0}>
                  <span className="text-xs text-slate-500 font-medium">Vô hiệu (0)</span>
                </Radio>
              </Radio.Group>
            </Form.Item>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default FunctionNodeModal;
