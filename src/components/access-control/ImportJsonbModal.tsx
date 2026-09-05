import React, { useState } from 'react';
import { Modal, Input, Button, Space, Alert, Typography, Radio } from 'antd';
import { FileTextOutlined, ImportOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { message } from '../../services/toastMessage';
import { ImportJsonbPayload } from './accessControlTypes';

const { Text } = Typography;

interface ImportJsonbModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (payload: ImportJsonbPayload, mode: 'overwrite' | 'merge') => void;
}

const sampleJsonbTemplate = JSON.stringify(
  {
    functionTree: [
      {
        id: 1,
        functionCode: 'DEMO_MODULE',
        functionNameKey: 'accessControl.demo',
        titleName: { vi: 'Module Mẫu', en: 'Demo Module' },
        type: 'MODULE',
        level: 1,
        parentId: null,
        pathId: '/1/',
        pathCode: '/DEMO_MODULE/',
        icon: 'appstore',
        url: '/demo',
        sortOrder: 99,
        status: 1,
        children: [],
      },
    ],
    roleFunctionCodes: {
      STORE_MANAGER: ['DEMO_MODULE'],
    },
  },
  null,
  2
);

export const ImportJsonbModal: React.FC<ImportJsonbModalProps> = ({ open, onClose, onImport }) => {
  const [jsonText, setJsonText] = useState<string>('');
  const [importMode, setImportMode] = useState<'overwrite' | 'merge'>('merge');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleApply = () => {
    setErrorMsg('');
    if (!jsonText.trim()) {
      setErrorMsg('Vui lòng dán dữ liệu JSON / JSONB vào ô bên dưới!');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      let payload: ImportJsonbPayload = {};

      if (Array.isArray(parsed)) {
        // If array, determine if it is functionTree or roles
        if (parsed.length > 0 && parsed[0].functionCode) {
          payload.functionTree = parsed;
        } else if (parsed.length > 0 && parsed[0].code) {
          payload.roles = parsed;
        } else {
          setErrorMsg('Cấu trúc mảng JSON không khớp với FunctionNodeDto[] hoặc RoleResponseDto[]!');
          return;
        }
      } else if (typeof parsed === 'object' && parsed !== null) {
        if (parsed.functionTree || parsed.roleFunctionCodes || parsed.roles) {
          payload = parsed;
        } else {
          // Assume it is roleFunctionCodes map { ROLE: ['CODE1', 'CODE2'] }
          payload.roleFunctionCodes = parsed;
        }
      }

      onImport(payload, importMode);
      message.success('Đã nhập và ánh xạ dữ liệu JSONB thành công!');
      onClose();
      setJsonText('');
    } catch (e: any) {
      setErrorMsg(`Cú pháp JSON không hợp lệ: ${e.message}`);
    }
  };

  const handleLoadSample = () => {
    setJsonText(sampleJsonbTemplate);
    setErrorMsg('');
    message.info('Đã nạp mẫu JSONB cấu trúc phân quyền!');
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-base">
            <ImportOutlined />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm sm:text-base">Nhập cấu hình JSON / JSONB (Backend API Mapping)</div>
            <div className="text-xs text-slate-500 font-normal">
              Nạp dữ liệu cây chức năng hoặc ma trận vai trò trực tiếp từ Backend API/DB
            </div>
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleApply}
      okText="Xác nhận nhập dữ liệu"
      cancelText="Hủy bỏ"
      width={680}
      destroyOnHidden
    >
      <div className="space-y-3 py-2">
        <Alert
          type="info"
          showIcon
          message="Hỗ trợ nhập FunctionTree[], RoleFunctionCodes Map hoặc Payload đồng bộ từ máy chủ IdentityServer."
          className="text-xs"
        />

        {errorMsg && (
          <Alert type="error" showIcon message={errorMsg} className="text-xs" />
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Chế độ nhập:</span>
            <Radio.Group
              value={importMode}
              onChange={e => setImportMode(e.target.value)}
              size="small"
            >
              <Radio.Button value="merge">Hòa nhập (Merge)</Radio.Button>
              <Radio.Button value="overwrite">Ghi đè (Overwrite)</Radio.Button>
            </Radio.Group>
          </div>

          <Button size="small" icon={<FileTextOutlined />} onClick={handleLoadSample} className="text-xs">
            Nạp mẫu JSONB
          </Button>
        </div>

        <div>
          <Input.TextArea
            rows={14}
            value={jsonText}
            onChange={e => {
              setJsonText(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="Dán nội dung JSON / JSONB vào đây (vd: { functionTree: [...], roleFunctionCodes: {...} })..."
            className="font-mono text-xs"
          />
        </div>
      </div>
    </Modal>
  );
};

export default ImportJsonbModal;
