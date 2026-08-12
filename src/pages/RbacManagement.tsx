import React, { useState, useMemo, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Tag, 
  Space, 
  Card, 
  Row, 
  Col, 
  Tabs, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Typography, 
  Tooltip, 
  App, 
  Divider,
  Tree,
  Alert,
  Badge,
  Popconfirm
} from 'antd';
import { 
  SafetyCertificateOutlined, 
  UsergroupAddOutlined, 
  KeyOutlined, 
  CodeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  LockOutlined, 
  UnlockOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  SendOutlined,
  LinkOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  CopyOutlined,
  FolderOutlined,
  FileOutlined,
  AppstoreOutlined,
  SearchOutlined,
  DatabaseOutlined,
  NodeIndexOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { motion } from 'motion/react';
import PageContainer from '../components/PageContainer';
import { 
  UI_PERMISSION_TREE, 
  PermissionTreeNode, 
  PRESET_USERS, 
  hasButtonPermission, 
  normalizePermissionKey,
  getAllTreeNodeKeys,
  getStoredTree,
  saveStoredTree,
  getStoredRoles,
  saveStoredRoles,
  deriveAllowedUrlsFromCheckedKeys,
  StoredRole,
  REAL_IDENTITY_SERVER_JWT 
} from '../utils/rbacPresets';
import type { DataNode } from 'antd/es/tree';

const { Title, Paragraph, Text } = Typography;

export const RbacManagement: React.FC = () => {
  const { message, modal } = App.useApp();
  const [activeTab, setActiveTab] = useState('tree_permissions');
  
  // Tree State loaded from localStorage or default
  const [permissionTree, setPermissionTree] = useState<PermissionTreeNode[]>(() => getStoredTree());

  // Roles State loaded from localStorage or default
  const [roles, setRoles] = useState<StoredRole[]>(() => getStoredRoles());

  // Quick Search States
  const [roleSearchText, setRoleSearchText] = useState('');
  const [treeSearchText, setTreeSearchText] = useState('');

  // Selected Role for Tree Configuration
  const [selectedRoleCode, setSelectedRoleCode] = useState<string>('STORE_MANAGER');
  
  // Current logged in user from localStorage
  const loggedUser = useMemo(() => {
    const saved = localStorage.getItem('@@WEB_POS_PORTAL');
    return saved ? JSON.parse(saved) : null;
  }, []);

  // Set of all valid keys in the tree
  const validTreeKeys = useMemo(() => getAllTreeNodeKeys(permissionTree), [permissionTree]);

  const currentRole = useMemo(() => {
    return roles.find(r => r.code === selectedRoleCode) || roles[0];
  }, [roles, selectedRoleCode]);

  // Tree Checked Keys State
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>(() => {
    return (currentRole?.buttonPermissions || []).map(k => normalizePermissionKey(String(k)));
  });

  // Filter & normalize keys to pass valid keys in the tree
  const displayCheckedKeys = useMemo(() => {
    return checkedKeys
      .map(k => normalizePermissionKey(String(k)))
      .filter(k => validTreeKeys.has(k));
  }, [checkedKeys, validTreeKeys]);

  // Update checked keys when selected role changes
  useEffect(() => {
    const target = roles.find(r => r.code === selectedRoleCode);
    if (target) {
      if (target.buttonPermissions.includes('*')) {
        const allKeys: string[] = [];
        const walk = (nodes: PermissionTreeNode[]) => {
          nodes.forEach(n => {
            allKeys.push(n.code);
            if (n.children) walk(n.children);
          });
        };
        walk(permissionTree);
        setCheckedKeys(allKeys);
      } else {
        setCheckedKeys(target.buttonPermissions.map(k => normalizePermissionKey(String(k))));
      }
    }
  }, [selectedRoleCode, roles, permissionTree]);

  // Filtered Roles List for Search
  const filteredRoles = useMemo(() => {
    if (!roleSearchText.trim()) return roles;
    const q = roleSearchText.toLowerCase();
    return roles.filter(r => 
      r.name.toLowerCase().includes(q) || 
      r.code.toLowerCase().includes(q) || 
      r.description.toLowerCase().includes(q)
    );
  }, [roles, roleSearchText]);

  // Role Edit Modal state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<StoredRole | null>(null);
  const [roleForm] = Form.useForm();

  // Dynamic Tree Node Add/Edit Modal state
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<PermissionTreeNode | null>(null);
  const [nodeForm] = Form.useForm();

  // Flattened Tree List for parent selection options
  const flatNodeOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [
      { value: 'ROOT', label: '📁 Root Level (Tạo Module Gốc mới)' }
    ];
    const walk = (nodes: PermissionTreeNode[], depth = 0) => {
      nodes.forEach(n => {
        const indent = '— '.repeat(depth);
        opts.push({
          value: n.code,
          label: `${indent}${n.title} (${n.code})`
        });
        if (n.children) walk(n.children, depth + 1);
      });
    };
    walk(permissionTree);
    return opts;
  }, [permissionTree]);

  // Convert permissionTree to Ant Design Tree DataNodes with Search Highlighting
  const treeData = useMemo(() => {
    const search = treeSearchText.trim().toLowerCase();
    
    const mapNode = (nodes: PermissionTreeNode[]): DataNode[] => {
      return nodes.map(node => {
        const isMatch = search && (
          node.title.toLowerCase().includes(search) || 
          node.code.toLowerCase().includes(search)
        );

        return {
          key: node.code,
          title: (
            <div className={`flex flex-wrap items-center gap-2 py-1 px-1 rounded transition-colors ${isMatch ? 'bg-yellow-100 ring-2 ring-yellow-400 font-bold' : ''}`}>
              <span className={
                node.type === 'module' ? 'font-black text-blue-700 text-sm' :
                node.type === 'menu' ? 'font-bold text-indigo-600 text-xs sm:text-sm' :
                node.type === 'ui_section' ? 'font-semibold text-slate-800 text-xs' :
                'font-medium text-emerald-700 text-xs'
              }>
                {node.title}
              </span>
              <Tag 
                color={
                  node.type === 'module' ? 'blue' :
                  node.type === 'menu' ? 'purple' :
                  node.type === 'ui_section' ? 'orange' : 'cyan'
                } 
                className="text-[10px] font-mono m-0"
              >
                {node.type.toUpperCase()}
              </Tag>
              {node.path && (
                <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  URL: {node.path}
                </span>
              )}
              <code className="text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-1 rounded">
                Code: {node.code}
              </code>

              {/* Node Quick Action Controls */}
              <div className="ml-auto flex items-center gap-1 opacity-80 hover:opacity-100">
                <Tooltip title="Sửa thông tin Node này">
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<EditOutlined className="text-blue-600" />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditNodeModal(node);
                    }}
                  />
                </Tooltip>
                <Popconfirm
                  title="Xóa Node này khỏi Cây Phân quyền?"
                  description="Thao tác này sẽ gỡ bỏ Node và các con của nó."
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    handleDeleteNode(node.code);
                  }}
                  onCancel={(e) => e?.stopPropagation()}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<DeleteOutlined className="text-red-500" />} 
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>
              </div>
            </div>
          ),
          icon: node.type === 'module' ? <FolderOutlined /> : node.type === 'menu' ? <AppstoreOutlined /> : <FileOutlined />,
          children: node.children ? mapNode(node.children) : undefined
        };
      });
    };
    return mapNode(permissionTree);
  }, [permissionTree, treeSearchText]);

  // Handle Save Tree Permission Assignments for current Role
  const handleSaveTreePermissions = () => {
    // Automatically derive allowedUrls from checked menu & module tree nodes!
    const derivedUrls = deriveAllowedUrlsFromCheckedKeys(checkedKeys as string[], permissionTree);

    const updatedRoles = roles.map(r => {
      if (r.code === selectedRoleCode) {
        return {
          ...r,
          buttonPermissions: checkedKeys as string[],
          allowedUrls: derivedUrls
        };
      }
      return r;
    });

    setRoles(updatedRoles);
    saveStoredRoles(updatedRoles);

    // Sync current session if logged in user holds this role
    if (loggedUser) {
      const userRoles = loggedUser.roles || [loggedUser.role];
      const activeRoles = updatedRoles.filter(r => userRoles.includes(r.code) && r.status === 'active');
      const newAllowedUrls = Array.from(new Set(activeRoles.flatMap(r => r.allowedUrls || [])));
      const newBtnPermissions = Array.from(new Set(activeRoles.flatMap(r => r.buttonPermissions || [])));
      const updatedUser = {
        ...loggedUser,
        allowedUrls: newAllowedUrls,
        buttonPermissions: newBtnPermissions
      };
      localStorage.setItem('@@WEB_POS_PORTAL', JSON.stringify(updatedUser));
    }

    window.dispatchEvent(new Event('rbac-update'));
    window.dispatchEvent(new Event('storage'));

    message.success(`Đã lưu & đồng bộ Cấu hình Cây Phân quyền & URL Routes (${derivedUrls.length} Routes) cho vai trò [${currentRole.name}] thành công!`);
  };

  // Role Modal Handlers
  const handleOpenRoleModal = (role?: StoredRole) => {
    if (role) {
      setEditingRole(role);
      roleForm.setFieldsValue({
        code: role.code,
        name: role.name,
        description: role.description,
        status: role.status === 'active',
        allowedUrls: role.allowedUrls
      });
    } else {
      setEditingRole(null);
      roleForm.resetFields();
    }
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = (values: any) => {
    let updatedRoles: StoredRole[];
    if (editingRole) {
      updatedRoles = roles.map(r => r.id === editingRole.id ? {
        ...r,
        code: values.code,
        name: values.name,
        description: values.description,
        status: values.status ? 'active' : 'inactive',
        allowedUrls: values.allowedUrls || []
      } : r);
      message.success(`Cập nhật thông tin vai trò ${values.name} thành công!`);
    } else {
      const newRole: StoredRole = {
        id: `R-0${roles.length + 1}`,
        code: values.code.toUpperCase(),
        name: values.name,
        description: values.description,
        usersCount: 0,
        allowedUrls: values.allowedUrls || [],
        buttonPermissions: ['sales.orders.btn_search', 'sales.orders.btn_reset'],
        status: values.status ? 'active' : 'inactive'
      };
      updatedRoles = [...roles, newRole];
      message.success(`Đã tạo mới vai trò ${values.name}!`);
    }
    setRoles(updatedRoles);
    saveStoredRoles(updatedRoles);

    // Sync active session if logged in user holds this role
    if (loggedUser) {
      const userRoles = loggedUser.roles || [loggedUser.role];
      const activeRoles = updatedRoles.filter(r => userRoles.includes(r.code) && r.status === 'active');
      const newAllowedUrls = Array.from(new Set(activeRoles.flatMap(r => r.allowedUrls || [])));
      const newBtnPermissions = Array.from(new Set(activeRoles.flatMap(r => r.buttonPermissions || [])));
      const updatedUser = {
        ...loggedUser,
        allowedUrls: newAllowedUrls,
        buttonPermissions: newBtnPermissions
      };
      localStorage.setItem('@@WEB_POS_PORTAL', JSON.stringify(updatedUser));
    }

    window.dispatchEvent(new Event('rbac-update'));
    window.dispatchEvent(new Event('storage'));

    setIsRoleModalOpen(false);
  };

  // Dynamic Tree Node Handlers (Add / Edit / Delete Nodes)
  const handleOpenAddNodeModal = () => {
    setEditingNode(null);
    nodeForm.resetFields();
    nodeForm.setFieldsValue({ parentCode: 'ROOT', type: 'action' });
    setIsNodeModalOpen(true);
  };

  const handleOpenEditNodeModal = (node: PermissionTreeNode) => {
    setEditingNode(node);
    nodeForm.setFieldsValue({
      title: node.title,
      code: node.code,
      type: node.type,
      path: node.path || '',
      description: node.description || ''
    });
    setIsNodeModalOpen(true);
  };

  const handleSaveTreeNode = (values: any) => {
    const newTree = JSON.parse(JSON.stringify(permissionTree)) as PermissionTreeNode[];

    if (editingNode) {
      // Update existing node
      const updateNodeInTree = (nodes: PermissionTreeNode[]): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].code === editingNode.code) {
            nodes[i].title = values.title;
            nodes[i].code = values.code;
            nodes[i].type = values.type;
            if (values.path) nodes[i].path = values.path;
            if (values.description) nodes[i].description = values.description;
            return true;
          }
          if (nodes[i].children && updateNodeInTree(nodes[i].children!)) {
            return true;
          }
        }
        return false;
      };
      updateNodeInTree(newTree);
      message.success(`Đã cập nhật Node Phân quyền [${values.title}]!`);
    } else {
      // Add new node
      const newNode: PermissionTreeNode = {
        key: values.code,
        title: values.title,
        code: values.code,
        type: values.type,
        path: values.path || undefined,
        description: values.description || undefined,
        children: values.type !== 'action' ? [] : undefined
      };

      if (values.parentCode === 'ROOT') {
        newTree.push(newNode);
      } else {
        const addChildToParent = (nodes: PermissionTreeNode[]): boolean => {
          for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].code === values.parentCode) {
              if (!nodes[i].children) nodes[i].children = [];
              nodes[i].children!.push(newNode);
              return true;
            }
            if (nodes[i].children && addChildToParent(nodes[i].children!)) {
              return true;
            }
          }
          return false;
        };
        addChildToParent(newTree);
      }
      message.success(`Đã thêm Node Phân quyền mới [${values.title}] vào Cây UI!`);
    }

    setPermissionTree(newTree);
    saveStoredTree(newTree);
    setIsNodeModalOpen(false);
  };

  const handleDeleteNode = (nodeCode: string) => {
    const removeNodeFromTree = (nodes: PermissionTreeNode[]): PermissionTreeNode[] => {
      return nodes.filter(n => {
        if (n.code === nodeCode) return false;
        if (n.children) {
          n.children = removeNodeFromTree(n.children);
        }
        return true;
      });
    };

    const newTree = removeNodeFromTree(JSON.parse(JSON.stringify(permissionTree)));
    setPermissionTree(newTree);
    saveStoredTree(newTree);
    message.success(`Đã xóa Node [${nodeCode}] khỏi Cây Phân quyền UI!`);
  };

  // Live Permission Guard Check Helper
  const checkLivePermission = (buttonCode: string) => {
    return hasButtonPermission(currentRole.buttonPermissions, buttonCode, [currentRole.code]);
  };

  // Backend Schema JSONB Exporter Format
  const jsonbSchemaExport = useMemo(() => {
    return {
      database_type: "PostgreSQL 14+ / ASP.NET Core IdentityServer EF Core",
      table_definitions: {
        roles_table_sql: `CREATE TABLE public.sys_roles (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  code VARCHAR(100) UNIQUE NOT NULL,\n  name VARCHAR(255) NOT NULL,\n  allowed_urls JSONB DEFAULT '[]'::jsonb,\n  button_permissions JSONB DEFAULT '[]'::jsonb,\n  status VARCHAR(20) DEFAULT 'active',\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n);`,
        permission_tree_table_sql: `CREATE TABLE public.sys_ui_permission_tree (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  version VARCHAR(20) DEFAULT 'v1.0.0',\n  tree_data JSONB NOT NULL,\n  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n);`
      },
      current_tree_jsonb: permissionTree,
      active_roles_matrix_jsonb: roles.map(r => ({
        role_code: r.code,
        role_name: r.name,
        allowed_urls: r.allowedUrls,
        button_permissions: r.buttonPermissions
      }))
    };
  }, [permissionTree, roles]);

  const copyJsonbToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonbSchemaExport, null, 2));
    message.success('Đã sao chép Mẫu JSONB Postgres / Schema Backend vào Clipboard!');
  };

  // JSONB Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  const handleOpenImportModal = () => {
    setImportJsonText(JSON.stringify(jsonbSchemaExport, null, 2));
    setIsImportModalOpen(true);
  };

  const handleImportJsonb = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      let newRoles = roles;
      let newTree = permissionTree;

      if (parsed.roles && Array.isArray(parsed.roles)) {
        newRoles = parsed.roles;
      } else if (parsed.active_roles_matrix_jsonb && Array.isArray(parsed.active_roles_matrix_jsonb)) {
        newRoles = parsed.active_roles_matrix_jsonb.map((r: any, idx: number) => ({
          id: `R-0${idx + 1}`,
          code: r.role_code || r.code,
          name: r.role_name || r.name || r.code,
          description: r.description || 'Imported from Backend JSONB',
          usersCount: r.usersCount || 1,
          allowedUrls: r.allowed_urls || r.allowedUrls || [],
          buttonPermissions: r.button_permissions || r.buttonPermissions || [],
          status: r.status || 'active'
        }));
      }

      if (parsed.permissionTree && Array.isArray(parsed.permissionTree)) {
        newTree = parsed.permissionTree;
      } else if (parsed.current_tree_jsonb && Array.isArray(parsed.current_tree_jsonb)) {
        newTree = parsed.current_tree_jsonb;
      }

      setRoles(newRoles);
      saveStoredRoles(newRoles);
      setPermissionTree(newTree);
      saveStoredTree(newTree);

      if (loggedUser) {
        const userRoles = loggedUser.roles || [loggedUser.role];
        const activeRoles = newRoles.filter(r => userRoles.includes(r.code) && r.status === 'active');
        const newAllowedUrls = Array.from(new Set(activeRoles.flatMap(r => r.allowedUrls || [])));
        const newBtnPermissions = Array.from(new Set(activeRoles.flatMap(r => r.buttonPermissions || [])));
        const updatedUser = {
          ...loggedUser,
          allowedUrls: newAllowedUrls,
          buttonPermissions: newBtnPermissions
        };
        localStorage.setItem('@@WEB_POS_PORTAL', JSON.stringify(updatedUser));
      }

      window.dispatchEvent(new Event('rbac-update'));
      window.dispatchEvent(new Event('storage'));

      message.success('Đã nhập & nạp thành công Cấu hình JSONB từ Backend vào Hệ thống Frontend!');
      setIsImportModalOpen(false);
    } catch (err: any) {
      message.error(`Cú pháp JSONB không hợp lệ: ${err.message}`);
    }
  };

  return (
    <PageContainer
      title="Cấu hình Phân quyền RBAC & Cây UI Dạng Rễ Cây (UI Hierarchy Tree)"
      subtitle="Quản lý phân quyền cấp bậc chi tiết từ Hệ thống Module -> Menu -> Submenu -> UI Form -> Nút Bấm / Thao tác"
      extra={
        <Space>
          <Button 
            icon={<NodeIndexOutlined />}
            onClick={handleOpenAddNodeModal}
            className="border-blue-500 text-blue-600 font-medium"
          >
            Thêm Node Phân quyền UI
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => handleOpenRoleModal()}
            className="bg-blue-600 font-semibold"
          >
            Tạo Vai trò Mới
          </Button>
        </Space>
      }
    >
      <div className="space-y-6">
        {/* Quick User Context Banner */}
        <Card size="small" className="border-blue-200 bg-blue-50/60 shadow-sm rounded-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                <SafetyCertificateOutlined />
              </div>
              <div>
                <div className="font-bold text-slate-800 text-sm">
                  Đang đăng nhập với tài khoản: <span className="text-blue-700">{loggedUser?.name || 'Dương Chí Dẫn'}</span> ({loggedUser?.email || 'chidan2410@gmail.com'})
                </div>
                <div className="text-xs text-slate-500">
                  Chức danh: <Tag color="blue">{loggedUser?.roleTitle || 'Identity Admin'}</Tag> | Roles: <Tag color="purple">{(loggedUser?.roles || [loggedUser?.role]).join(', ')}</Tag>
                </div>
              </div>
            </div>
            <Button size="small" type="primary" ghost onClick={() => window.location.href = '/login'}>
              Đổi Tài Khoản Test (Switch User)
            </Button>
          </div>
        </Card>

        {/* Main Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          items={[
            {
              key: 'tree_permissions',
              label: (
                <span className="font-bold text-blue-700 flex items-center gap-2">
                  <AppstoreOutlined />
                  1. Cấu hình Cây Phân quyền UI (UI Hierarchy Tree)
                </span>
              ),
              children: (
                <div className="pt-2 space-y-4">
                  <Alert
                    message="Cấu hình Phân quyền Rễ cây Cấp bậc (Module -> Menu -> Submenu -> UI Section -> Nút bấm)"
                    description="Quản lý trực quan ma trận cấp quyền cho từng Vai trò (Role). Tìm kiếm nhanh vai trò hoặc nút bấm, thêm/sửa/xóa node động khi phát sinh module mới."
                    type="info"
                    showIcon
                    className="border-blue-200 bg-blue-50/50"
                  />

                  <Row gutter={[20, 20]}>
                    {/* Left Panel: Role Selection & Search */}
                    <Col xs={24} md={8} lg={7}>
                      <Card 
                        title={<span className="font-extrabold text-slate-800 text-sm">Danh sách Vai trò Hệ thống</span>} 
                        className="shadow-sm border border-slate-200 rounded-xl"
                      >
                        {/* Quick Search Roles Input */}
                        <Input 
                          placeholder="Tìm nhanh vai trò..."
                          prefix={<SearchOutlined className="text-slate-400" />}
                          value={roleSearchText}
                          onChange={(e) => setRoleSearchText(e.target.value)}
                          allowClear
                          className="mb-3"
                        />

                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                          {filteredRoles.map(r => (
                            <div
                              key={r.id}
                              onClick={() => setSelectedRoleCode(r.code)}
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                selectedRoleCode === r.code 
                                  ? 'border-blue-500 bg-blue-50/80 shadow-sm' 
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-800">{r.name}</span>
                                {r.isSystemRole && <Tag color="red" className="m-0 text-[10px]">Hệ thống</Tag>}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">Code: {r.code}</div>
                              <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{r.description}</div>
                              <div className="mt-2 flex items-center justify-between text-[11px]">
                                <span className="text-blue-600 font-medium">{r.allowedUrls.length} URL Routes</span>
                                <span className="text-emerald-600 font-medium">
                                  {r.buttonPermissions.includes('*') ? 'Full (*)' : `${r.buttonPermissions.length} Nút bấm`}
                                </span>
                              </div>
                            </div>
                          ))}

                          {filteredRoles.length === 0 && (
                            <div className="text-center py-6 text-slate-400 text-xs">
                              Không tìm thấy vai trò khớp từ khóa
                            </div>
                          )}
                        </div>

                        <Divider className="my-3" />
                        <Button 
                          block 
                          icon={<PlusOutlined />} 
                          onClick={() => handleOpenRoleModal()}
                          className="border-dashed"
                        >
                          Thêm Vai trò Mới
                        </Button>
                      </Card>
                    </Col>

                    {/* Right Panel: Interactive Tree View & Search */}
                    <Col xs={24} md={16} lg={17}>
                      <Card
                        title={
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="font-extrabold text-slate-800 text-sm">Cây Phân quyền UI cho: </span>
                              <Tag color="blue" className="text-xs font-bold px-2 py-0.5 ml-2">{currentRole.name}</Tag>
                            </div>
                            <Space>
                              <Button 
                                icon={<NodeIndexOutlined />} 
                                onClick={handleOpenAddNodeModal}
                                size="small"
                              >
                                Thêm Node
                              </Button>
                              <Button 
                                type="primary" 
                                icon={<CheckCircleOutlined />} 
                                onClick={handleSaveTreePermissions}
                                className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                              >
                                Lưu Cấu hình Cây UI
                              </Button>
                            </Space>
                          </div>
                        }
                        className="shadow-sm border border-slate-200 rounded-xl"
                      >
                        {/* Quick Search Tree Nodes Input */}
                        <div className="mb-3 flex items-center gap-2">
                          <Input 
                            placeholder="Tìm nhanh nút bấm, submenu, module trong cây UI..."
                            prefix={<SearchOutlined className="text-slate-400" />}
                            value={treeSearchText}
                            onChange={(e) => setTreeSearchText(e.target.value)}
                            allowClear
                          />
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 min-h-[420px] max-h-[600px] overflow-y-auto">
                          <Tree
                            checkable
                            defaultExpandAll
                            showIcon
                            treeData={treeData}
                            checkedKeys={displayCheckedKeys}
                            onCheck={(checked) => {
                              if (Array.isArray(checked)) {
                                setCheckedKeys(checked);
                              } else {
                                setCheckedKeys(checked.checked);
                              }
                            }}
                          />
                        </div>

                        {/* Live Button Test Matrix for this Role */}
                        <div className="mt-5 p-4 bg-slate-900 text-white rounded-xl">
                          <div className="font-bold text-xs text-blue-400 mb-2 flex items-center gap-1.5">
                            <ThunderboltOutlined /> KÍCH HOẠT NÚT BẤM VÀ MA TRẬN PHÂN QUYỀN TRỰC TIẾP (LIVE BUTTON MATRIX):
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {/* 1. Create Order */}
                            <div className="p-2.5 rounded bg-slate-800 border border-slate-700 flex items-center justify-between">
                              <span className="text-xs font-mono text-slate-200">sales.orders.btn_create</span>
                              {checkLivePermission('sales.orders.btn_create') ? (
                                <Tag color="green" className="m-0 font-bold">CHO PHÉP</Tag>
                              ) : (
                                <Tag color="red" className="m-0 font-bold">KHÓA 403</Tag>
                              )}
                            </div>

                            {/* 2. Cancel Order */}
                            <div className="p-2.5 rounded bg-slate-800 border border-slate-700 flex items-center justify-between">
                              <span className="text-xs font-mono text-slate-200">sales.orders.btn_cancel</span>
                              {checkLivePermission('sales.orders.btn_cancel') ? (
                                <Tag color="green" className="m-0 font-bold">CHO PHÉP</Tag>
                              ) : (
                                <Tag color="red" className="m-0 font-bold">KHÓA 403</Tag>
                              )}
                            </div>

                            {/* 3. Export Excel */}
                            <div className="p-2.5 rounded bg-slate-800 border border-slate-700 flex items-center justify-between">
                              <span className="text-xs font-mono text-slate-200">sales.orders.btn_export</span>
                              {checkLivePermission('sales.orders.btn_export') ? (
                                <Tag color="green" className="m-0 font-bold">CHO PHÉP</Tag>
                              ) : (
                                <Tag color="red" className="m-0 font-bold">KHÓA 403</Tag>
                              )}
                            </div>

                            {/* 4. Print Invoice */}
                            <div className="p-2.5 rounded bg-slate-800 border border-slate-700 flex items-center justify-between">
                              <span className="text-xs font-mono text-slate-200">sales.orders.btn_print</span>
                              {checkLivePermission('sales.orders.btn_print') ? (
                                <Tag color="green" className="m-0 font-bold">CHO PHÉP</Tag>
                              ) : (
                                <Tag color="red" className="m-0 font-bold">KHÓA 403</Tag>
                              )}
                            </div>

                            {/* 5. Delete Audit Log */}
                            <div className="p-2.5 rounded bg-slate-800 border border-slate-700 flex items-center justify-between">
                              <span className="text-xs font-mono text-slate-200">system.audit.btn_delete</span>
                              {checkLivePermission('system.audit.btn_delete') ? (
                                <Tag color="green" className="m-0 font-bold">CHO PHÉP</Tag>
                              ) : (
                                <Tag color="red" className="m-0 font-bold">KHÓA 403</Tag>
                              )}
                            </div>

                            {/* 6. Edit Product */}
                            <div className="p-2.5 rounded bg-slate-800 border border-slate-700 flex items-center justify-between">
                              <span className="text-xs font-mono text-slate-200">sales.products.btn_edit</span>
                              {checkLivePermission('sales.products.btn_edit') ? (
                                <Tag color="green" className="m-0 font-bold">CHO PHÉP</Tag>
                              ) : (
                                <Tag color="red" className="m-0 font-bold">KHÓA 403</Tag>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )
            },
            {
              key: 'preset_accounts',
              label: (
                <span className="font-bold flex items-center gap-2">
                  <UsergroupAddOutlined />
                  2. Danh sách Tài khoản Test & Phân quyền URL/Nút bấm
                </span>
              ),
              children: (
                <div className="pt-2 space-y-4">
                  <Row gutter={[16, 16]}>
                    {PRESET_USERS.map(usr => (
                      <Col xs={24} md={12} lg={8} key={usr.id}>
                        <Card className="shadow-sm border border-slate-200 rounded-xl h-full flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              <div 
                                className="w-10 h-10 rounded-full text-white font-bold flex items-center justify-center text-sm shadow-sm"
                                style={{ backgroundColor: usr.avatarBg }}
                              >
                                {usr.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 text-sm">{usr.name}</div>
                                <div className="text-xs text-slate-500 font-mono">{usr.email}</div>
                              </div>
                            </div>

                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-slate-400">Chức danh: </span>
                                <span className="font-semibold text-slate-700">{usr.roleTitle}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Vai trò (Roles): </span>
                                {usr.roles.map(r => (
                                  <Tag key={r} color="blue" className="font-mono text-[10px] m-0.5">{r}</Tag>
                                ))}
                              </div>
                              <div className="text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 text-[11px]">
                                {usr.description}
                              </div>
                              {usr.isExpired && (
                                <Alert 
                                  message="Tài khoản Expired Token (401 Demo)" 
                                  description="Khi đăng nhập tài khoản này, hệ thống kích hoạt ngay Trang Lỗi 401 Unauthorized."
                                  type="error" 
                                  showIcon 
                                  className="mt-2 py-1 px-2 text-xs"
                                />
                              )}
                            </div>
                          </div>

                          <Button 
                            type="primary" 
                            block 
                            className="mt-4 bg-blue-600 font-bold"
                            onClick={() => {
                              // Resolve role permissions from live stored roles
                              const userRoleObj = roles.find(r => usr.roles.includes(r.code));
                              const effectiveButtons = userRoleObj ? userRoleObj.buttonPermissions : usr.buttonPermissions;
                              const effectiveUrls = userRoleObj ? userRoleObj.allowedUrls : usr.allowedUrls;

                              localStorage.setItem('@@WEB_POS_PORTAL', JSON.stringify({
                                name: usr.name,
                                email: usr.email,
                                role: usr.roles[0],
                                roles: usr.roles,
                                allowedUrls: effectiveUrls,
                                buttonPermissions: effectiveButtons,
                                token: usr.jwtToken,
                                isExpired: usr.isExpired
                              }));
                              message.success(`Đã chuyển đổi tài khoản test sang: ${usr.name}`);
                              window.location.reload();
                            }}
                          >
                            Đăng nhập bằng tài khoản này
                          </Button>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )
            },
            {
              key: 'jsonb_backend_schema',
              label: (
                <span className="font-bold text-emerald-700 flex items-center gap-2">
                  <DatabaseOutlined />
                  3. Mẫu JSONB Postgres & Schema API Backend
                </span>
              ),
              children: (
                <div className="pt-2 space-y-4">
                  <Alert
                    message="Mẫu Schema Cấu trúc Cơ sở Dữ liệu (PostgreSQL JSONB / EF Core IdentityServer)"
                    description="Sử dụng cấu trúc JSONB dưới đây để lưu trữ Cây phân quyền UI và Ma trận cấp quyền Vai trò vào CSDL PostgreSQL, ASP.NET Core IdentityServer hoặc Node.js Backend."
                    type="success"
                    showIcon
                    className="border-emerald-200 bg-emerald-50/50"
                    action={
                      <Space>
                        <Button 
                          icon={<DatabaseOutlined />}
                          onClick={handleOpenImportModal}
                          className="border-emerald-600 text-emerald-700 font-medium"
                        >
                          Nhập / Nạp JSONB từ Backend
                        </Button>
                        <Button 
                          type="primary" 
                          icon={<CopyOutlined />} 
                          onClick={copyJsonbToClipboard}
                          className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                        >
                          Sao chép Mẫu JSONB
                        </Button>
                      </Space>
                    }
                  />

                  <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                      <Card 
                        title={<span className="font-bold text-slate-800 text-xs">SQL DDL & Cấu trúc Bảng PostgreSQL</span>}
                        className="shadow-sm border border-slate-200 rounded-xl"
                      >
                        <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto max-h-[350px]">
                          {jsonbSchemaExport.database_type}
                          {"\n\n"}
                          {jsonbSchemaExport.table_definitions.roles_table_sql}
                          {"\n\n"}
                          {jsonbSchemaExport.table_definitions.permission_tree_table_sql}
                        </pre>
                      </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                      <Card 
                        title={<span className="font-bold text-slate-800 text-xs">Mẫu JSONB Ma trận Phân quyền Vai trò</span>}
                        className="shadow-sm border border-slate-200 rounded-xl"
                      >
                        <pre className="p-3 bg-slate-900 text-blue-300 font-mono text-[11px] rounded-lg overflow-x-auto max-h-[350px]">
                          {JSON.stringify(jsonbSchemaExport.active_roles_matrix_jsonb, null, 2)}
                        </pre>
                      </Card>
                    </Col>

                    <Col span={24}>
                      <Card 
                        title={<span className="font-bold text-slate-800 text-xs">Mẫu JSONB Toàn bộ Cây Cấu trúc Rễ Cây UI (UI Permission Tree JSON)</span>}
                        className="shadow-sm border border-slate-200 rounded-xl"
                      >
                        <pre className="p-3 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-lg overflow-x-auto max-h-[400px]">
                          {JSON.stringify(jsonbSchemaExport.current_tree_jsonb, null, 2)}
                        </pre>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )
            }
          ]}
        />
      </div>

      {/* Role Edit Modal */}
      <Modal
        title={editingRole ? `Chỉnh sửa Vai trò: ${editingRole.name}` : 'Tạo mới Vai trò RBAC'}
        open={isRoleModalOpen}
        onCancel={() => setIsRoleModalOpen(false)}
        onOk={() => roleForm.submit()}
        width={650}
        okText="Lưu thông tin"
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-blue-600' }}
      >
        <Form form={roleForm} layout="vertical" onFinish={handleSaveRole} className="pt-2">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="code" label="Mã Vai trò (Role Code)" rules={[{ required: true, message: 'Nhập mã vai trò' }]}>
                <Input placeholder="Ví dụ: STORE_SUPERVISOR" disabled={editingRole?.isSystemRole} className="font-mono" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="name" label="Tên Hiển thị Vai trò" rules={[{ required: true, message: 'Nhập tên vai trò' }]}>
                <Input placeholder="Ví dụ: Giám sát viên Cửa hàng" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả Vai trò & Phạm vi Quyền hạn">
            <Input.TextArea rows={2} placeholder="Mô tả phạm vi quyền hạn..." />
          </Form.Item>

          <Form.Item name="allowedUrls" label="Quyền hạn URL Route (Trang Menu được mở)">
            <Select
              mode="multiple"
              placeholder="Chọn các URL Route cho phép truy cập"
              options={[
                { value: '*', label: 'Tất cả các trang (* Full Access)' },
                { value: '/', label: 'Trang chủ Dashboard (/)' },
                { value: '/sales/orders', label: 'Quản lý Đơn hàng (/sales/orders)' },
                { value: '/sales/products', label: 'Danh mục Sản phẩm (/sales/products)' },
                { value: '/sales/customers', label: 'Quản lý Khách hàng (/sales/customers)' },
                { value: '/sales/promotions', label: 'Khuyến mãi (/sales/promotions)' },
                { value: '/system/rbac', label: 'Phân quyền RBAC (/system/rbac)' },
                { value: '/system/audit-logs', label: 'Audit Logs (/system/audit-logs)' },
                { value: '/system/vat-config', label: 'Cấu hình VAT (/system/vat-config)' },
                { value: '/system/forms', label: 'Quản lý Biểu mẫu (/system/forms)' }
              ]}
            />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái Kích hoạt" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Khóa" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Dynamic Tree Node Add/Edit Modal */}
      <Modal
        title={editingNode ? `Sửa Node Phân quyền UI: ${editingNode.title}` : 'Thêm Node Phân quyền Cây UI Mới'}
        open={isNodeModalOpen}
        onCancel={() => setIsNodeModalOpen(false)}
        onOk={() => nodeForm.submit()}
        width={600}
        okText="Lưu Node"
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-blue-600' }}
      >
        <Form form={nodeForm} layout="vertical" onFinish={handleSaveTreeNode} className="pt-2">
          {!editingNode && (
            <Form.Item name="parentCode" label="Chọn Node Cha (Parent Node)" rules={[{ required: true }]}>
              <Select options={flatNodeOptions} showSearch optionFilterProp="label" />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item name="title" label="Tên Hiển thị Node UI" rules={[{ required: true, message: 'Nhập tên node' }]}>
                <Input placeholder="Ví dụ: Nút Duyệt Đơn Hàng" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="type" label="Loại Node Phân quyền" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'module', label: 'Module Gốc' },
                    { value: 'menu', label: 'Menu / Submenu' },
                    { value: 'ui_section', label: 'UI Section / Form' },
                    { value: 'action', label: 'Action / Button' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item name="code" label="Mã Phân quyền UNIQUE (Code)" rules={[{ required: true, message: 'Nhập mã code phân quyền' }]}>
                <Input placeholder="Ví dụ: sales.orders.btn_approve" className="font-mono" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="path" label="URL Route (Nếu là Menu)">
                <Input placeholder="Ví dụ: /sales/orders" className="font-mono" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả Chi tiết Chức năng">
            <Input.TextArea rows={2} placeholder="Mô tả chức năng của nút hoặc section này..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* JSONB Import / Payload Loader Modal */}
      <Modal
        title="Nhập / Nạp Cấu hình JSONB từ Backend vào Frontend"
        open={isImportModalOpen}
        onCancel={() => setIsImportModalOpen(false)}
        onOk={handleImportJsonb}
        width={750}
        okText="Áp dụng cấu hình JSONB"
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-emerald-600 font-bold' }}
      >
        <div className="space-y-3 pt-2">
          <Alert
            message="Chỉnh sửa hoặc dán dữ liệu JSONB từ Backend"
            description="Bạn có thể thay đổi ma trận Vai trò (allowed_urls, button_permissions) hoặc Cây rễ phân quyền trực tiếp bằng JSON, sau đó nhấn Áp dụng để hệ thống tự động đồng bộ sang UI."
            type="info"
            showIcon
          />
          <Input.TextArea
            rows={14}
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            className="font-mono text-xs bg-slate-900 text-slate-100 p-3 rounded-lg border border-slate-700 custom-scrollbar"
            placeholder="Dán chuỗi JSONB từ Backend tại đây..."
          />
        </div>
      </Modal>
    </PageContainer>
  );
};

export default RbacManagement;
