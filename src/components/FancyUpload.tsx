import React, { useState } from 'react';
import { Upload, Button, List, Space, Typography, Image, Card, message, App, Tooltip, Avatar, Divider } from 'antd';
import { 
  UploadOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  SwapOutlined, 
  FileOutlined,
  InboxOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

const { Text, Title } = Typography;
const { Dragger } = Upload;

interface FileItem {
  uid: string;
  name: string;
  url?: string;
  status?: string;
  originFileObj?: File;
  thumbUrl?: string;
}

interface FancyUploadProps {
  multiple?: boolean;
  value?: FileItem[];
  onChange?: (files: FileItem[]) => void;
  maxCount?: number;
}

const FancyUpload: React.FC<FancyUploadProps> = ({ 
  multiple = false, 
  value = [], 
  onChange,
  maxCount = 999 
}) => {
  const { modal } = App.useApp();
  const [fileList, setFileList] = useState<FileItem[]>(value);
  const { t } = useTranslation();

  const handleUpload = (info: any) => {
    const newFiles = info.fileList.map((file: any) => ({
      uid: file.uid,
      name: file.name,
      status: file.status,
      url: file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : ''),
      originFileObj: file.originFileObj,
    }));
    setFileList(newFiles);
    onChange?.(newFiles);
  };

  const removeFile = (uid: string) => {
    const newFiles = fileList.filter(f => f.uid !== uid);
    setFileList(newFiles);
    onChange?.(newFiles);
  };

  const replaceFile = (uid: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const newFiles = fileList.map(f => {
          if (f.uid === uid) {
            return {
              uid,
              name: file.name,
              url: URL.createObjectURL(file),
              originFileObj: file,
            };
          }
          return f;
        });
        setFileList(newFiles);
        onChange?.(newFiles);
        message.success(t('file_replaced') || 'File replaced');
      }
    };
    input.click();
  };

  const previewFile = (file: FileItem) => {
    if (file.url) {
      const isImage = file.name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i);
      const isPdf = file.name.match(/\.pdf$/i);
      const isText = file.name.match(/\.(txt|md|js|ts|json|html|css)$/i);

      modal.info({
        title: file.name,
        width: 1000,
        maskClosable: true,
        footer: null,
        content: (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            {isImage ? (
              <img src={file.url} alt={file.name} style={{ maxWidth: '100%', maxHeight: '70vh' }} />
            ) : isPdf ? (
              <iframe src={file.url} style={{ width: '100%', height: '70vh', border: 'none' }} title={file.name} />
            ) : isText ? (
               <div style={{ textAlign: 'left', padding: 16, background: '#f5f5f5', borderRadius: 8, maxHeight: '70vh', overflow: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {/* In a real app we might fetch the content, here we just show the name as dummy */}
                  <Title level={5}>Content Preview:</Title>
                  <Divider />
                  <Text>Showing preview for {file.name}. Actual content would be loaded here.</Text>
               </div>
            ) : (
              <div style={{ padding: 40, background: '#f5f5f5', borderRadius: 8 }}>
                <FileOutlined style={{ fontSize: 64, color: '#999' }} />
                <Title level={4} style={{ marginTop: 16 }}>{file.name}</Title>
                <Text type="secondary">Preview not available for this file type.</Text>
                <div style={{ marginTop: 24 }}>
                  <Button type="primary" onClick={() => window.open(file.url)}>Download File</Button>
                </div>
              </div>
            )}
          </div>
        )
      });
    }
  };

  return (
    <div className="fancy-upload">
      <Dragger
        multiple={multiple}
        fileList={[]}
        beforeUpload={() => false}
        onChange={handleUpload}
        maxCount={maxCount}
        showUploadList={false}
        className="mb-6"
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{t('file_upload_text')}</p>
        <p className="ant-upload-hint">
          {t('file_upload_hint')}
        </p>
      </Dragger>

      <div style={{ marginTop: 24 }}>
        <AnimatePresence>
          {fileList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card 
                title={<Space><FileOutlined /> {t('selected_files')} ({fileList.length})</Space>}
                size="small"
                variant="borderless"
                style={{ background: '#f8f9fa' }}
              >
                <List<FileItem>
                  dataSource={fileList}
                  renderItem={(item) => (
                    <List.Item
                      key={item.uid}
                      actions={[
                        <Tooltip key="preview" title={t('preview')}><Button icon={<EyeOutlined />} size="small" type="text" onClick={() => previewFile(item)} /></Tooltip>,
                        <Tooltip key="replace" title={t('replace')}><Button icon={<SwapOutlined />} size="small" type="text" onClick={() => replaceFile(item.uid)} /></Tooltip>,
                        <Tooltip key="delete" title={t('delete')}><Button icon={<DeleteOutlined />} size="small" type="text" danger onClick={() => removeFile(item.uid)} /></Tooltip>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          item.name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i) ? (
                            <Image src={item.url} width={40} height={40} style={{ objectFit: 'cover', borderRadius: 4 }} preview={false} />
                          ) : (
                            <Avatar shape="square" icon={<FileOutlined />} />
                          )
                        }
                        title={<Text strong>{item.name}</Text>}
                        description={<Text type="secondary" style={{ fontSize: 12 }}>{t('ready_for_upload') || 'Ready for upload'}</Text>}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FancyUpload;
