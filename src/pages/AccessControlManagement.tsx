import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Form,
  Space,
  Tooltip,
  Row,
  Col,
  App,
} from 'antd';
import {
  SafetyCertificateOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { message } from '../services/toastMessage';
import PageContainer from '../components/PageContainer';
import { accessControlService } from '../services/accessControlService';
import {
  FunctionNodeDto,
  RoleResponseDto,
} from '../dtos/AuthorizationDto';
import {
  AccessControlStats,
  FunctionNodeFormData,
  ImportJsonbPayload,
  RoleFormData,
} from '../components/access-control/accessControlTypes';
import { AccessControlStatsOverview } from '../components/access-control/AccessControlStatsOverview';
import { AccessControlFilterBar } from '../components/access-control/AccessControlFilterBar';
import { RoleTablePanel } from '../components/access-control/RoleTablePanel';
import { FunctionTreePanel } from '../components/access-control/FunctionTreePanel';
import { RoleFormModal } from '../components/access-control/RoleFormModal';
import { FunctionNodeModal } from '../components/access-control/FunctionNodeModal';
import { ImportJsonbModal } from '../components/access-control/ImportJsonbModal';
import { ExportModal } from '../components/access-control/ExportModal';

type FunctionTreeNode = FunctionNodeDto;
type StoredRole = RoleResponseDto;

const OWNER_ROLES = [
  'IdentityBitisAdminAdministrator',
  'SkorubaIdentityAdminAdministrator',
];

function isOwnerRole(roleCode?: string): boolean {
  if (!roleCode) return false;
  return OWNER_ROLES.some(r => r.toLowerCase() === roleCode.toLowerCase());
}

function getStoredRoles(): StoredRole[] {
  return accessControlService.getRoles();
}

function getStoredFunctionTree(): FunctionTreeNode[] {
  return accessControlService.getFunctionTree();
}

function countFunctionsByType(nodes: FunctionTreeNode[]) {
  let modules = 0;
  let menus = 0;
  let actions = 0;
  let total = 0;

  const walk = (items: FunctionTreeNode[]) => {
    items.forEach(node => {
      if (node.status !== 1) return;
      total++;
      if (node.type === 'MODULE') modules++;
      else if (node.type === 'MENU' || node.type === 'PAGE' || node.type === 'ROUTE') menus++;
      else if (node.type === 'ACTION') actions++;
      if (node.children) walk(node.children);
    });
  };

  walk(nodes);
  return { modules, menus, actions, total };
}

function getAllTreeKeys(nodes: FunctionTreeNode[]): string[] {
  const keys: string[] = [];
  const walk = (items: FunctionTreeNode[]) => {
    items.forEach(item => {
      if (item.status === 1) {
        keys.push(item.functionCode);
        if (item.children) walk(item.children);
      }
    });
  };
  walk(nodes);
  return keys;
}

const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  extra?: React.ReactNode;
}> = ({ title, icon, isOpen, onToggle, children, extra }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm mb-4 transition-all duration-200 hover:border-slate-200">
      <div
        className="flex justify-between items-center px-4 py-3 cursor-pointer bg-slate-50/50 select-none rounded-t-xl"
        onClick={onToggle}
      >
        <Space size={10} className="flex-1">
          <Tooltip title={title} placement="right">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
              {icon}
            </div>
          </Tooltip>
          <span className="font-bold text-slate-800 text-xs sm:text-sm">{title}</span>
        </Space>
        <div className="flex items-center gap-2">
          {extra}
          <span className="text-slate-400 text-xs">{isOpen ? '▲' : '▼'}</span>
        </div>
      </div>
      {isOpen && <div className="p-4 sm:p-5">{children}</div>}
    </div>
  );
};

export const AccessControlManagement: React.FC = () => {
  const { i18n } = useTranslation();
  const { modal } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const isRoleChangeConfirmOpenRef = useRef(false);

  // URL-driven state
  const urlRole = searchParams.get('role') || '';
  const urlKeyword = searchParams.get('q') || searchParams.get('keyword') || '';
  const urlGrantStatus = (searchParams.get('grantStatus') || 'all') as 'all' | 'granted' | 'revoked';
  const urlTypeFilter = searchParams.get('type') || '';
  const urlRolePage = parseInt(searchParams.get('page') || '1', 10);
  const urlRolePageSize = parseInt(searchParams.get('pageSize') || '6', 10);

  // Data State
  const [roles, setRoles] = useState<StoredRole[]>(() => getStoredRoles());
  const [functionTree, setFunctionTree] = useState<FunctionTreeNode[]>(() => getStoredFunctionTree());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Selected Role
  const selectedRoleCode = urlRole || (roles.length > 0 ? roles[0].code : '');
  const selectedRole = useMemo(
    () => roles.find(r => r.code === selectedRoleCode) || roles[0],
    [roles, selectedRoleCode]
  );

  // Staged checked keys for the active role (local unsaved state before clicking "Lưu")
  const [stagedCheckedKeys, setStagedCheckedKeys] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // UI Collapsed Sections
  const [isStatsOpen, setIsStatsOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(true);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Modal States
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<StoredRole | null>(null);
  const [cloneFromRoleCode, setCloneFromRoleCode] = useState<string | undefined>(undefined);
  const [isFuncModalOpen, setIsFuncModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<FunctionNodeDto | null>(null);
  const [parentNode, setParentNode] = useState<FunctionNodeDto | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const language = i18n.language || 'vi';

  // Form
  const [filterForm] = Form.useForm();

  // All function keys in tree
  const allTreeKeys = useMemo(() => getAllTreeKeys(functionTree), [functionTree]);

  // Load saved role permissions into stagedCheckedKeys when selected role changes
  useEffect(() => {
    if (selectedRole) {
      const savedCodes = selectedRole.functionCodes || [];
      if (isOwnerRole(selectedRole.code) || savedCodes.includes('*')) {
        setStagedCheckedKeys(allTreeKeys);
      } else {
        setStagedCheckedKeys(savedCodes.filter(code => allTreeKeys.includes(code)));
      }
      setIsDirty(false);
    }
  }, [selectedRoleCode, roles, allTreeKeys]);

  // Sync form with URL
  useEffect(() => {
    filterForm.setFieldsValue({
      role: selectedRoleCode,
      keyword: urlKeyword,
      grantStatus: urlGrantStatus,
      type: urlTypeFilter,
    });
  }, [selectedRoleCode, urlKeyword, urlGrantStatus, urlTypeFilter, filterForm]);

  // Sync data on access-control-update event
  useEffect(() => {
    const syncData = () => {
      setRoles(getStoredRoles());
      setFunctionTree(getStoredFunctionTree());
    };

    window.addEventListener('access-control-update', syncData);
    window.addEventListener('storage', syncData);
    return () => {
      window.removeEventListener('access-control-update', syncData);
      window.removeEventListener('storage', syncData);
    };
  }, []);

  // Function tree counts
  const funcCounts = useMemo(() => countFunctionsByType(functionTree), [functionTree]);

  // Stats calculation
  const stats = useMemo((): AccessControlStats => {
    const activeRoles = roles.filter(r => r.status === 'active').length;
    const ownerRoles = roles.filter(r => r.isSystemRole).length;
    const customRoles = roles.filter(r => !r.isSystemRole).length;

    const isOwner = isOwnerRole(selectedRoleCode);
    const grantedCount = isOwner ? allTreeKeys.length : stagedCheckedKeys.length;
    const totalCount = allTreeKeys.length;
    const grantedRate = totalCount > 0 ? Math.round((grantedCount / totalCount) * 100) : 0;

    return {
      totalRoles: roles.length,
      activeRoles,
      ownerRolesCount: ownerRoles,
      customRolesCount: customRoles,
      totalFunctions: funcCounts.total,
      totalModules: funcCounts.modules,
      totalMenus: funcCounts.menus,
      totalActions: funcCounts.actions,
      selectedRoleCode,
      selectedRoleName: selectedRole?.name || selectedRoleCode,
      selectedRoleGrantedCount: grantedCount,
      selectedRoleTotalCount: totalCount,
      selectedRoleGrantedRate: grantedRate,
      selectedRoleAllowedUrlsCount: selectedRole?.allowedUrls?.length || 0,
      selectedRoleButtonPermsCount: selectedRole?.buttonPermissions?.length || 0,
      isOwnerRole: isOwner,
      syncMode: 'LocalSeed+API',
      securityStatus: 'Least-Privilege',
    };
  }, [roles, allTreeKeys, stagedCheckedKeys, funcCounts, selectedRoleCode, selectedRole]);

  // Handlers
  const updateSearchParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([k, v]) => {
          if (v === undefined || v === '') {
            next.delete(k);
          } else {
            next.set(k, v);
          }
        });
        return next;
      });
    },
    [setSearchParams]
  );

  const handleRoleChange = useCallback(
    (roleCode: string) => {
      // Dismiss popup/dropdown without action when clicking already-selected role.
      if (roleCode === selectedRoleCode) return;

      if (isDirty) {
        // Prevent duplicated row/cell events from opening stacked confirm dialogs.
        if (isRoleChangeConfirmOpenRef.current) return;
        isRoleChangeConfirmOpenRef.current = true;

        modal.confirm({
          title: 'Thay đổi chưa được lưu!',
          content: `Bạn có thay đổi phân quyền chưa lưu cho vai trò [${selectedRoleCode}]. Chuyển sang vai trò khác sẽ hủy các thay đổi này?`,
          okText: 'Chuyển vai trò (Hủy thay đổi)',
          okButtonProps: { danger: true },
          cancelText: 'Ở lại lưu',
          onOk: () => {
            setIsDirty(false);
            updateSearchParams({ role: roleCode });
            isRoleChangeConfirmOpenRef.current = false;
          },
          onCancel: () => {
            isRoleChangeConfirmOpenRef.current = false;
          },
        });
        return;
      }
      updateSearchParams({ role: roleCode });
    },
    [isDirty, selectedRoleCode, updateSearchParams, modal]
  );

  const handleSearch = useCallback(
    (values?: any) => {
      const v = values || filterForm.getFieldsValue();
      const updates: Record<string, string | undefined> = {};
      if (v.role) updates.role = v.role;
      if (v.keyword) updates.q = v.keyword;
      else updates.q = undefined;

      if (v.grantStatus && v.grantStatus !== 'all') updates.grantStatus = v.grantStatus;
      else updates.grantStatus = undefined;

      if (v.type && v.type !== 'ALL') updates.type = v.type;
      else updates.type = undefined;

      if (v.status && v.status !== 'all') updates.status = v.status;
      else updates.status = undefined;

      updateSearchParams(updates);
    },
    [filterForm, updateSearchParams]
  );

  const handleReset = useCallback(() => {
    filterForm.resetFields();
    setSearchParams({ role: selectedRoleCode });
  }, [filterForm, selectedRoleCode, setSearchParams]);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setRoles(getStoredRoles());
    setFunctionTree(getStoredFunctionTree());
    setIsDirty(false);
    setTimeout(() => setIsLoading(false), 400);
    message.success('Đã làm mới dữ liệu phân quyền!');
  }, []);

  // Save Staged Permissions for Current Role
  const handleSavePermissions = useCallback(() => {
    if (!selectedRole) return;
    if (isOwnerRole(selectedRole.code)) {
      message.warning('Không thể thay đổi quyền hạn của Vai trò Quản trị viên Tối cao (Owner)!');
      return;
    }

    modal.confirm({
      title: `Xác nhận lưu phân quyền cho: ${selectedRole.name || selectedRole.code}?`,
      icon: <SafetyCertificateOutlined className="text-blue-600 text-xl" />,
      content: (
        <div className="space-y-2 py-2">
          <p className="text-slate-700 text-sm">
            Hệ thống sẽ cập nhật <strong>{stagedCheckedKeys.length}</strong> chức năng / quyền hạn cho vai trò này.
          </p>
          <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-blue-800">
            ✓ Quyền hạn của người dùng thuộc vai trò này sẽ tự động cập nhật ngay trên giao diện mà không cần đăng nhập lại.
          </div>
        </div>
      ),
      okText: 'Lưu thay đổi',
      okButtonProps: { className: 'bg-emerald-600 hover:bg-emerald-700' },
      cancelText: 'Hủy bỏ',
      onOk: () => {
        accessControlService.updateRoleFunctionCodes(selectedRole.code, stagedCheckedKeys);
        setRoles(getStoredRoles());
        setIsDirty(false);
        message.success(`Đã lưu cấu hình phân quyền cho vai trò [${selectedRole.code}] thành công!`);
      },
    });
  }, [selectedRole, stagedCheckedKeys, modal]);

  // Undo changes back to saved state
  const handleUndoPermissions = useCallback(() => {
    if (!selectedRole) return;
    const savedCodes = selectedRole.functionCodes || [];
    setStagedCheckedKeys(isOwnerRole(selectedRole.code) ? allTreeKeys : savedCodes);
    setIsDirty(false);
    message.info('Đã hoàn tác về trạng thái phân quyền đã lưu!');
  }, [selectedRole, allTreeKeys]);

  // Tree Checkbox Change handler
  const handleTreeCheckChange = useCallback(
    (newCheckedKeys: string[]) => {
      if (!selectedRole) return;
      if (isOwnerRole(selectedRole.code)) {
        message.warning('Vai trò Quản trị viên Tối cao (Owner) luôn sở hữu toàn quyền hệ thống!');
        return;
      }
      setStagedCheckedKeys(newCheckedKeys);
      setIsDirty(true);
    },
    [selectedRole]
  );

  // Role CRUD Handlers
  const handleCreateRole = useCallback(
    async (data: RoleFormData) => {
      const cloneSource = data.cloneFromRoleCode
        ? roles.find(r => r.code === data.cloneFromRoleCode)
        : undefined;

      const newRole = await accessControlService.createRole({
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description || '',
        status: data.status,
        allowedUrls: cloneSource?.allowedUrls || [],
        buttonPermissions: cloneSource?.buttonPermissions || [],
        functionCodes: cloneSource?.functionCodes || [],
        isSystemRole: false,
      });

      setRoles(await accessControlService.fetchRoles());
      setIsRoleModalOpen(false);
      setEditingRole(null);
      message.success(`Đã tạo vai trò [${newRole.code}] thành công!`);
      updateSearchParams({ role: newRole.code });
    },
    [roles, updateSearchParams]
  );

  const handleUpdateRole = useCallback(
    async (data: RoleFormData) => {
      if (!editingRole) return;
      await accessControlService.updateRole(editingRole.code, {
        name: data.name,
        description: data.description || '',
        status: data.status,
      });
      setRoles(await accessControlService.fetchRoles());
      setIsRoleModalOpen(false);
      setEditingRole(null);
      message.success(`Đã cập nhật vai trò [${editingRole.code}]!`);
    },
    [editingRole]
  );

  const handleDeleteRole = useCallback(
    async (roleCode: string) => {
      if (isOwnerRole(roleCode)) {
        message.error('Không thể xóa vai trò Owner hệ thống!');
        return;
      }
      await accessControlService.deleteRole(roleCode);
      setRoles(await accessControlService.fetchRoles());
      if (selectedRoleCode === roleCode) {
        const remaining = roles.filter(r => r.code !== roleCode);
        if (remaining.length > 0) {
          updateSearchParams({ role: remaining[0].code });
        }
      }
      message.success(`Đã xóa vai trò [${roleCode}]!`);
    },
    [roles, selectedRoleCode, updateSearchParams]
  );

  const handleBulkDeleteRoles = useCallback(
    async (roleCodes: string[]) => {
      for (const code of roleCodes) {
        await accessControlService.deleteRole(code);
      }
      setRoles(await accessControlService.fetchRoles());
      message.success(`Đã xóa ${roleCodes.length} vai trò!`);
    },
    []
  );

  // Function Node CRUD Handlers
  const handleCreateFunctionNode = useCallback(
    async (data: FunctionNodeFormData) => {
      const newNode = await accessControlService.createFunctionNode({
        functionCode: data.functionCode.toUpperCase(),
        titleName: { vi: data.titleVi, en: data.titleEn },
        type: data.type,
        parentId: data.parentId || null,
        url: data.url || undefined,
        icon: data.icon || undefined,
        sortOrder: data.sortOrder,
        status: data.status,
      });
      setFunctionTree(await accessControlService.fetchFunctionTree());
      setIsFuncModalOpen(false);
      setEditingNode(null);
      setParentNode(null);
      if (selectedRole && !stagedCheckedKeys.includes(newNode.functionCode)) {
        setStagedCheckedKeys(prev => [...prev, newNode.functionCode]);
        setIsDirty(true);
      }
      message.success(`Đã thêm chức năng [${newNode.functionCode}] thành công!`);
    },
    [selectedRole, stagedCheckedKeys]
  );

  const handleUpdateFunctionNode = useCallback(
    async (data: FunctionNodeFormData) => {
      if (!editingNode) return;
      await accessControlService.updateFunctionNode(editingNode.functionCode, {
        functionCode: data.functionCode.toUpperCase(),
        titleName: { vi: data.titleVi, en: data.titleEn },
        type: data.type,
        parentId: data.parentId || null,
        url: data.url || undefined,
        icon: data.icon || undefined,
        sortOrder: data.sortOrder,
        status: data.status,
      });
      setFunctionTree(await accessControlService.fetchFunctionTree());
      setIsFuncModalOpen(false);
      setEditingNode(null);
      message.success(`Đã cập nhật chức năng [${editingNode.functionCode}]!`);
    },
    [editingNode]
  );

  const handleDeleteFunctionNode = useCallback(async (functionCode: string) => {
    await accessControlService.deleteFunctionNode(functionCode);
    setFunctionTree(await accessControlService.fetchFunctionTree());
    setStagedCheckedKeys(prev => prev.filter(k => k !== functionCode));
    message.success(`Đã xóa chức năng [${functionCode}]!`);
  }, []);

  // Import JSONB
  const handleImportJsonb = useCallback((payload: ImportJsonbPayload, mode: 'overwrite' | 'merge') => {
    const result = accessControlService.importJsonb(payload);
    if (result.success) {
      setRoles(getStoredRoles());
      setFunctionTree(getStoredFunctionTree());
      setIsDirty(false);
      message.success(result.message);
    } else {
      message.error(result.message);
    }
  }, []);

  const rolesAsDto: RoleResponseDto[] = useMemo(
    () =>
      roles.map(r => ({
        id: r.id,
        code: r.code,
        name: r.name,
        description: r.description,
        usersCount: r.usersCount,
        allowedUrls: r.allowedUrls || [],
        buttonPermissions: r.buttonPermissions || [],
        functionCodes: r.functionCodes || [],
        status: r.status === 'inactive' ? 'inactive' : 'active',
        isSystemRole: r.isSystemRole,
      })),
    [roles]
  );

  return (
    <PageContainer noCard>
      <div className="space-y-4 sm:space-y-5">
        {/* 1. Stats Overview */}
        <CollapsibleSection
          title="Thống kê"
          icon={<SafetyCertificateOutlined />}
          isOpen={isStatsOpen}
          onToggle={() => setIsStatsOpen(!isStatsOpen)}
        >
          <AccessControlStatsOverview stats={stats} onSelectRole={handleRoleChange} />
        </CollapsibleSection>

        {/* 2. Search / Filter Bar */}
        <CollapsibleSection
          title="Tìm kiếm"
          icon={<SearchOutlined />}
          isOpen={isSearchOpen}
          onToggle={() => setIsSearchOpen(!isSearchOpen)}
        >
          <AccessControlFilterBar
            form={filterForm}
            roles={rolesAsDto}
            selectedRoleCode={selectedRoleCode}
            isExpanded={isSearchExpanded}
            onToggleExpand={() => setIsSearchExpanded(!isSearchExpanded)}
            onSearch={handleSearch}
            onRefresh={handleRefresh}
            onReset={handleReset}
          />
        </CollapsibleSection>

        {/* 3. Main Split Screen (Master-Detail 2 Columns) */}
        <Row gutter={[16, 16]}>
          {/* LEFT COLUMN: Roles Management Card Table */}
          <Col xs={24} lg={9} xl={9}>
            <RoleTablePanel
              roles={rolesAsDto}
              selectedRoleCode={selectedRoleCode}
              onSelectRole={handleRoleChange}
              onAddRole={() => {
                setEditingRole(null);
                setCloneFromRoleCode(undefined);
                setIsRoleModalOpen(true);
              }}
              onEditRole={role => {
                // Use role directly from table (no async fetch needed)
                setEditingRole(role);
                setCloneFromRoleCode(undefined);
                setIsRoleModalOpen(true);
              }}
              onCloneRole={role => {
                setEditingRole(null);
                setCloneFromRoleCode(role.code);
                setIsRoleModalOpen(true);
              }}
              onDeleteRole={handleDeleteRole}
              onBulkDeleteRoles={handleBulkDeleteRoles}
              onOpenImport={() => setIsImportModalOpen(true)}
              onOpenExport={() => setIsExportModalOpen(true)}
              onRefresh={handleRefresh}
              isLoading={isLoading}
              currentPage={urlRolePage}
              pageSize={urlRolePageSize}
              onPaginationChange={(page, pageSize) => {
                updateSearchParams({
                  page: String(page),
                  pageSize: String(pageSize),
                });
              }}
            />
          </Col>

          {/* RIGHT COLUMN: Function Permission Tree Card */}
          <Col xs={24} lg={15} xl={15}>
            <FunctionTreePanel
              selectedRole={selectedRole}
              functionTree={functionTree as unknown as FunctionNodeDto[]}
              stagedCheckedKeys={stagedCheckedKeys}
              isDirty={isDirty}
              isOwner={isOwnerRole(selectedRoleCode)}
              language={language}
              onCheckChange={handleTreeCheckChange}
              onSave={handleSavePermissions}
              onUndo={handleUndoPermissions}
              onAddRootNode={() => {
                setParentNode(null);
                setEditingNode(null);
                setIsFuncModalOpen(true);
              }}
              onAddChildNode={parent => {
                // Use parent directly from tree (no async fetch needed)
                setParentNode(parent);
                setEditingNode(null);
                setIsFuncModalOpen(true);
              }}
              onEditNode={node => {
                // Use node directly from tree (no async fetch needed)
                setEditingNode(node);
                setParentNode(null);
                setIsFuncModalOpen(true);
              }}
              onDeleteNode={handleDeleteFunctionNode}
            />
          </Col>
        </Row>
      </div>

      {/* Modals */}
      <RoleFormModal
        open={isRoleModalOpen}
        editingRole={editingRole}
        roles={rolesAsDto}
        cloneFromRoleCode={cloneFromRoleCode}
        onClose={() => {
          setIsRoleModalOpen(false);
          setEditingRole(null);
          setCloneFromRoleCode(undefined);
        }}
        onSubmit={data => {
          if (editingRole) {
            handleUpdateRole(data);
          } else {
            handleCreateRole(data);
          }
        }}
      />

      <FunctionNodeModal
        open={isFuncModalOpen}
        editingNode={editingNode}
        parentNode={parentNode}
        functionTree={functionTree as unknown as FunctionNodeDto[]}
        language={language}
        onClose={() => {
          setIsFuncModalOpen(false);
          setEditingNode(null);
          setParentNode(null);
        }}
        onSubmit={data => {
          if (editingNode) {
            handleUpdateFunctionNode(data);
          } else {
            handleCreateFunctionNode(data);
          }
        }}
      />

      <ImportJsonbModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportJsonb}
      />

      <ExportModal
        open={isExportModalOpen}
        functionTree={functionTree as unknown as FunctionNodeDto[]}
        roles={rolesAsDto}
        roleFunctionCodes={accessControlService.getRoleFunctionCodesMap()}
        onClose={() => setIsExportModalOpen(false)}
      />
    </PageContainer>
  );
};

export default AccessControlManagement;
