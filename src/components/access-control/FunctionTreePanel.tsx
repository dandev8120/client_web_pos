import React, { useMemo, useState, useCallback } from 'react';
import { Tree, Button, Input, Tag, Tooltip, Empty, Dropdown } from 'antd';
import type { DataNode } from 'antd/es/tree';
import {
  KeyOutlined, SaveOutlined, UndoOutlined, PlusOutlined, EditOutlined,
  DeleteOutlined, MoreOutlined, SearchOutlined, CheckSquareOutlined,
  BorderOutlined, FolderOutlined, FolderOpenOutlined, MenuOutlined,
  FileTextOutlined, ThunderboltOutlined, TableOutlined, BranchesOutlined,
  ShrinkOutlined, ExpandOutlined,
} from '@ant-design/icons';
import { FunctionNodeDto, RoleResponseDto } from '../../dtos/AuthorizationDto';
import { getLocalizedFunctionTitle } from '../../utils/accessControlPresets';

function getTagColor(type?: string): string {
  if (type === 'MODULE') return 'blue';
  if (['MENU', 'PAGE', 'ROUTE'].includes(type || '')) return 'purple';
  if (type === 'ACTION') return 'green';
  if (['SECTION', 'CARD', 'WIDGET'].includes(type || '')) return 'orange';
  if (['FIELD', 'COLUMN'].includes(type || '')) return 'cyan';
  return 'default';
}

function getNodeIcon(type?: string, expanded?: boolean) {
  if (type === 'MODULE') return expanded ? <FolderOpenOutlined className="text-blue-500" /> : <FolderOutlined className="text-blue-500" />;
  if (type === 'MENU') return <MenuOutlined className="text-purple-500" />;
  if (type === 'PAGE' || type === 'ROUTE') return <FileTextOutlined className="text-indigo-500" />;
  if (type === 'ACTION') return <ThunderboltOutlined className="text-emerald-500" />;
  if (type === 'FIELD' || type === 'COLUMN') return <TableOutlined className="text-cyan-500" />;
  return <BranchesOutlined className="text-slate-400" />;
}

function getAllTreeKeys(nodes: FunctionNodeDto[]): string[] {
  const keys: string[] = [];
  const visit = (items: FunctionNodeDto[]) => items.forEach(item => {
    if (item.status === 1) {
      keys.push(item.functionCode);
      if (item.children) visit(item.children);
    }
  });
  visit(nodes);
  return keys;
}
interface FunctionTreePanelProps {
  selectedRole: RoleResponseDto | undefined;
  functionTree: FunctionNodeDto[];
  stagedCheckedKeys: string[];
  isDirty: boolean;
  isOwner: boolean;
  language: string;
  onCheckChange: (keys: string[]) => void;
  onSave: () => void;
  onUndo: () => void;
  onAddRootNode: () => void;
  onAddChildNode: (parent: FunctionNodeDto) => void;
  onEditNode: (node: FunctionNodeDto) => void;
  onDeleteNode: (code: string) => void;
}

export const FunctionTreePanel: React.FC<FunctionTreePanelProps> = props => {
  const {
    selectedRole, functionTree, stagedCheckedKeys, isDirty, isOwner, language,
    onCheckChange, onSave, onUndo, onAddRootNode, onAddChildNode, onEditNode, onDeleteNode,
  } = props;
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [treeSearchKeyword, setTreeSearchKeyword] = useState('');
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const allTreeKeys = useMemo(() => getAllTreeKeys(functionTree), [functionTree]);
  const validCheckedKeys = useMemo(
    () => stagedCheckedKeys.filter(key => allTreeKeys.includes(key)),
    [allTreeKeys, stagedCheckedKeys]
  );

  const allChecked = useMemo(
    () => allTreeKeys.length > 0 && allTreeKeys.every(k => validCheckedKeys.includes(k)),
    [allTreeKeys, validCheckedKeys]
  );

  const toggleCheckAll = useCallback(() => {
    if (allChecked) { onCheckChange([]); } else { onCheckChange([...allTreeKeys]); }
  }, [allChecked, allTreeKeys, onCheckChange]);

  const toggleExpandAll = useCallback(() => {
    if (isAllExpanded) { setExpandedKeys([]); } else { setExpandedKeys(allTreeKeys); }
    setIsAllExpanded(prev => !prev);
  }, [isAllExpanded, allTreeKeys]);
  const buildTreeData = (nodes: FunctionNodeDto[]): DataNode[] => nodes
    .filter(node => node.status === 1)
    .map(node => {
      const title = getLocalizedFunctionTitle(node, language) || node.functionCode;
      const keyword = treeSearchKeyword.trim().toLowerCase();
      const match = keyword && (title.toLowerCase().includes(keyword) || node.functionCode.toLowerCase().includes(keyword));
      const nodeTitle = (
        <div className="flex items-center gap-1.5 group/node py-0.5 min-w-0">
          <span className="text-[13px] text-slate-500 shrink-0 inline-flex items-center justify-center w-4">
            {getNodeIcon(node.type)}
          </span>
          <span className={`text-xs truncate ${match ? 'font-bold text-blue-700 bg-yellow-100 px-0.5 rounded' : 'text-slate-700'}`}>{title}</span>
          <Tag color={getTagColor(node.type)} className="m-0 text-[9px] px-1 py-0 font-mono shrink-0">{node.type}</Tag>
          <Dropdown menu={{ items: [
            { key: 'add', label: 'Thêm chức năng con', icon: <PlusOutlined />, onClick: () => onAddChildNode(node) },
            { key: 'edit', label: 'Chỉnh sửa', icon: <EditOutlined />, onClick: () => onEditNode(node) },
            { type: 'divider' },
            { key: 'delete', label: 'Xóa chức năng', icon: <DeleteOutlined />, danger: true, onClick: () => onDeleteNode(node.functionCode) },
          ] }} trigger={['click']}>
            <Button size="small" type="text" icon={<MoreOutlined />} className="opacity-0 group-hover/node:opacity-100 h-5 w-5 min-w-0 p-0" onClick={e => e.stopPropagation()} />
          </Dropdown>
        </div>
      );
      return {
        key: node.functionCode,
        title: nodeTitle,
        children: node.children ? buildTreeData(node.children) : undefined,
      } as DataNode;
    });

  const treeData = useMemo(() => buildTreeData(functionTree), [functionTree, language, treeSearchKeyword]);
  const grantedCount = validCheckedKeys.length;
  const totalCount = allTreeKeys.length;
  const grantedRate = totalCount ? Math.round((grantedCount / totalCount) * 100) : 0;

  const handleCheck = (checked: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] }) => {
    const keys = Array.isArray(checked) ? checked : checked.checked;
    onCheckChange(keys.map(String));
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setTreeSearchKeyword(value);
    if (value) setExpandedKeys(allTreeKeys);
  };
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-5 h-full flex flex-col" style={{ minHeight: 500 }}>
      <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <KeyOutlined className="text-blue-600 text-base" />
          <span className="font-bold text-slate-800 text-sm sm:text-base">Phân quyền Chức năng</span>
          {selectedRole && <Tag color="blue" className="m-0 text-xs font-mono px-1.5">{selectedRole.name || selectedRole.code}</Tag>}
          {isOwner && <Tag color="gold" className="m-0 text-xs px-1.5">Toàn quyền</Tag>}
          {isDirty && !isOwner && <Tag color="orange" className="m-0 text-xs px-1.5 animate-pulse">Chưa lưu</Tag>}
        </div>
        <div className="flex items-center gap-1.5">
          {isDirty && !isOwner && (
            <Button size="small" icon={<UndoOutlined />} onClick={onUndo} className="text-slate-600 border-slate-300">Hoàn tác</Button>
          )}
          <Button type="primary" size="small" icon={<SaveOutlined />} onClick={onSave} disabled={isOwner || !isDirty} className={isDirty && !isOwner ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>
            Lưu phân quyền
          </Button>
          <Button size="small" icon={<PlusOutlined />} onClick={onAddRootNode} className="text-blue-600 border-blue-300">Thêm module</Button>
        </div>
      </div>
      {selectedRole && (
        <div className="mb-3 flex items-center gap-3 flex-wrap text-xs">
          <span className="text-slate-500">Đã cấp: <strong className={isDirty ? 'text-orange-600' : 'text-emerald-600'}>{grantedCount}</strong> / {totalCount} chức năng</span>
          <div className="flex-1 max-w-[120px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${grantedRate}%` }} />
          </div>
          <span className={`font-semibold ${isDirty ? 'text-orange-600' : 'text-emerald-600'}`}>{grantedRate}%</span>
        </div>
      )}
      <div className="mb-3 flex items-center gap-2 flex-wrap">
        <Input size="small" placeholder="Tìm chức năng theo tên, mã..." prefix={<SearchOutlined className="text-slate-400 text-xs" />} value={treeSearchKeyword} onChange={handleSearch} allowClear className="flex-1 min-w-[160px] rounded-lg" style={{ maxWidth: 280 }} />
        <div className="flex items-center gap-1">
          <Tooltip title={allChecked ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}>
            <Button size="small" icon={allChecked ? <BorderOutlined /> : <CheckSquareOutlined />} onClick={toggleCheckAll} disabled={isOwner} />
          </Tooltip>
          <Tooltip title={isAllExpanded ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}>
            <Button size="small" icon={isAllExpanded ? <ShrinkOutlined /> : <ExpandOutlined />} onClick={toggleExpandAll} />
          </Tooltip>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden -mx-1 px-1">
        {functionTree.length === 0 ? (
          <Empty description="Chưa có chức năng nào được định nghĩa" image={Empty.PRESENTED_IMAGE_SIMPLE} className="py-8" />
        ) : (
          <Tree
            checkable={!isOwner}
            showLine={{ showLeafIcon: false }}
            expandedKeys={expandedKeys}
            checkedKeys={isOwner ? allTreeKeys : validCheckedKeys}
            onExpand={keys => setExpandedKeys(keys)}
            onCheck={handleCheck}
            treeData={treeData}
            className="text-xs"
            disabled={isOwner}
          />
        )}
      </div>
    </div>
  );
};

export default FunctionTreePanel;
