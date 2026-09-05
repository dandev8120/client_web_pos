import React, { useState, useMemo } from 'react';
import { Modal, Tabs, Input, Button, Space, Typography, Tooltip } from 'antd';
import { DownloadOutlined, CopyOutlined, FileTextOutlined, ExportOutlined, CheckOutlined } from '@ant-design/icons';
import { message } from '../../services/toastMessage';
import { FunctionNodeDto, RoleResponseDto } from '../../dtos/AuthorizationDto';

const { Text } = Typography;

interface ExportModalProps {
  open: boolean;
  functionTree: FunctionNodeDto[];
  roles: RoleResponseDto[];
  roleFunctionCodes: Record<string, string[]>;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  open,
  functionTree,
  roles,
  roleFunctionCodes,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [copied, setCopied] = useState<boolean>(false);

  const fullPayload = useMemo(() => {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        functionTree,
        roleFunctionCodes,
        roles,
      },
      null,
      2
    );
  }, [functionTree, roleFunctionCodes, roles]);

  const treeJson = useMemo(() => {
    return JSON.stringify(functionTree, null, 2);
  }, [functionTree]);

  const rolesJson = useMemo(() => {
    return JSON.stringify(roleFunctionCodes, null, 2);
  }, [roleFunctionCodes]);

  const getCurrentContent = () => {
    if (activeTab === 'tree') return treeJson;
    if (activeTab === 'roles') return rolesJson;
    return fullPayload;
  };

  const handleCopy = () => {
    const content = getCurrentContent();
    navigator.clipboard.writeText(content);
    setCopied(true);
    message.success('Đã sao chép nội dung JSON vào Clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = getCurrentContent();
    const filename =
      activeTab === 'tree'
        ? 'functionTree.json'
        : activeTab === 'roles'
        ? 'roleFunctionCodes.json'
        : `access-control-export-${new Date().toISOString().slice(0, 10)}.json`;

    const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    message.success(`Đã tải xuống file ${filename}!`);
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-base">
            <ExportOutlined />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm sm:text-base">Xuất cấu hình Phân quyền & Vai trò</div>
            <div className="text-xs text-slate-500 font-normal">
              Trích xuất dữ liệu JSON / JSONB để đồng bộ với Backend API hoặc Database
            </div>
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        <Button key="copy" icon={copied ? <CheckOutlined /> : <CopyOutlined />} onClick={handleCopy}>
          Sao chép JSON
        </Button>,
        <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={handleDownload} className="bg-blue-600">
          Tải file JSON
        </Button>,
      ]}
      width={720}
      destroyOnHidden
    >
      <div className="py-2">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'all',
              label: 'Toàn bộ JSONB Payload',
              children: (
                <div className="pt-2">
                  <Input.TextArea
                    rows={14}
                    value={fullPayload}
                    readOnly
                    className="font-mono text-xs bg-slate-50"
                  />
                </div>
              ),
            },
            {
              key: 'tree',
              label: 'functionTree.json',
              children: (
                <div className="pt-2">
                  <Input.TextArea
                    rows={14}
                    value={treeJson}
                    readOnly
                    className="font-mono text-xs bg-slate-50"
                  />
                </div>
              ),
            },
            {
              key: 'roles',
              label: 'roleFunctionCodes.json',
              children: (
                <div className="pt-2">
                  <Input.TextArea
                    rows={14}
                    value={rolesJson}
                    readOnly
                    className="font-mono text-xs bg-slate-50"
                  />
                </div>
              ),
            },
          ]}
        />
      </div>
    </Modal>
  );
};

export default ExportModal;
