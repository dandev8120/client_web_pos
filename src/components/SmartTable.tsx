import React, { useState, useMemo } from 'react';
import { Table, Button, Dropdown, Popover, Checkbox, Space, Input, Tooltip, Typography, App, Badge, Divider, Empty } from 'antd';
import type { TableProps, MenuProps } from 'antd';
import type { ColumnType } from 'antd/es/table';
import { 
  SettingOutlined, 
  SearchOutlined, 
  DragOutlined,
  ArrowsAltOutlined,
  DeleteOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'motion/react';
import { Resizable } from 'react-resizable';
import { 
  DndContext, 
  DragEndEvent, 
  PointerSensor, 
  useSensor, 
  useSensors,
  closestCenter 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useTranslation } from 'react-i18next';
import './SmartTable.css';

interface SmartHeaderCellProps extends React.HTMLAttributes<any> {
    onResize: (e: React.SyntheticEvent, { size }: { size: { width: number } }) => void;
    width: number;
    id: string;
    resizable?: boolean;
}
  
const SmartHeaderCell = (props: SmartHeaderCellProps) => {
  const { onResize, width, id, resizable = true, children, ...restProps } = props;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    ...restProps.style,
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? 'none' : transition,
    ...(isDragging ? { position: 'relative', zIndex: 1000 } : {}),
  };

  if (!width || !resizable) {
    return (
      <th 
        {...restProps} 
        ref={setNodeRef} 
        style={style}
      >
        <div {...attributes} {...listeners} className="inline-block max-w-full cursor-grab active:cursor-grabbing">
          {children}
        </div>
      </th>
    );
  }

  return (
    <Resizable
      width={width}
      height={0}
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
      minConstraints={[50, 0]}
      maxConstraints={[1500, 0]}
      axis="x"
      resizeHandles={['e']}
      handleSize={[16, 16]}
      lockAspectRatio={false}
      transformScale={1}
    >
      <th
        {...restProps}
        ref={setNodeRef}
        style={style}
      >
        <div {...attributes} {...listeners} className="inline-block max-w-full select-none cursor-grab active:cursor-grabbing">
          {children}
        </div>
      </th>
    </Resizable>
  );
};

interface SortableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
  children?: React.ReactNode;
}

const SortableRow = ({ children, ...props }: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props['data-row-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </tr>
  );
};

type SmartTableColumn<T> = ColumnType<T> & {
  searchable?: boolean;
  resizable?: boolean;
  searchFields?: ColumnType<T>['dataIndex'][];
  searchText?: (record: T) => unknown;
};

const toSearchableParts = (value: unknown, visited = new WeakSet<object>()): string[] => {
  if (value === undefined || value === null || typeof value === 'boolean') {
    return [];
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
    return [String(value)];
  }

  if (value instanceof Date) {
    return [value.toISOString()];
  }

  if (Array.isArray(value)) {
    return value.flatMap(item => toSearchableParts(item, visited));
  }

  if (React.isValidElement(value)) {
    return toSearchableParts((value.props as { children?: React.ReactNode }).children, visited);
  }

  if (typeof value === 'object') {
    if (visited.has(value)) {
      return [];
    }

    visited.add(value);
    return Object.values(value as Record<string, unknown>).flatMap(item => toSearchableParts(item, visited));
  }

  return [String(value)];
};

export interface SmartTableProps<T> extends TableProps<T> {
  columns: SmartTableColumn<T>[];
  extraActions?: React.ReactNode;
  rowDraggable?: boolean;
  responsiveExpanded?: boolean;
  onRowDragEnd?: (activeId: string, overId: string) => void;
  selectedRowKeys?: React.Key[];
  onBatchDelete?: (keys: React.Key[]) => void;
  onBatchExport?: (keys: React.Key[], format: 'csv' | 'excel' | 'pdf') => void;
}

export function SmartTable<T extends { key?: React.Key }>(props: SmartTableProps<T>) {
  const { 
    columns: initialColumns, 
    extraActions, 
    rowDraggable, 
    responsiveExpanded,
    onRowDragEnd,
    selectedRowKeys = [],
    onBatchDelete,
    onBatchExport,
    ...restProps 
  } = props;
  
  const { t } = useTranslation();

  const [columnData, setColumnData] = useState(() => 
    initialColumns.map((col, index) => ({
      ...col,
      key: col.key || col.dataIndex?.toString() || `col-${index}`,
      visible: true,
      width: col.width || 150,
    }))
  );

  React.useEffect(() => {
    setColumnData(prev => {
      const nextColumns = initialColumns.map((col, index) => {
        const key = col.key || col.dataIndex?.toString() || `col-${index}`;
        const existing = prev.find(p => p.key === key);
        return {
          ...col,
          key,
          visible: existing ? existing.visible : true,
          width: existing ? existing.width : (col.width || 150),
        };
      });

      const hasSameColumnState = nextColumns.length === prev.length
        && nextColumns.every((col, index) => {
          const current = prev[index];
          return current
            && current.key === col.key
            && current.visible === col.visible
            && current.width === col.width
            && current.title === col.title
            && current.dataIndex === col.dataIndex;
        });

      return hasSameColumnState ? prev : nextColumns;
    });
  }, [initialColumns]);

  const { message } = App.useApp();

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    if (onBatchExport) {
      onBatchExport(selectedRowKeys, format);
    } else {
      message.success(t('batch_export_msg', { count: selectedRowKeys.length, format: format.toUpperCase() }));
    }
  };

  const handleDelete = () => {
    if (onBatchDelete) {
      onBatchDelete(selectedRowKeys);
    } else {
      message.success(t('batch_delete_msg', { count: selectedRowKeys.length }));
    }
  };

  const exportMenuItems: MenuProps['items'] = [
    { key: 'csv', label: t('export_csv'), onClick: () => handleExport('csv') },
    { key: 'excel', label: t('export_excel'), onClick: () => handleExport('excel') },
    { key: 'pdf', label: t('export_pdf'), onClick: () => handleExport('pdf') },
  ];

  const batchActions = (
    <AnimatePresence>
      {selectedRowKeys.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <Space>
            <Badge count={selectedRowKeys.length} style={{ backgroundColor: '#1677ff' }} />
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>{t('items_selected')}</Typography.Text>
          </Space>
          <Divider type="vertical" />
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={handleDelete}
          >
            {t('delete')}
          </Button>
          <Dropdown menu={{ items: exportMenuItems }}>
            <Button icon={<DownloadOutlined />}>{t('export')}</Button>
          </Dropdown>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        predicate: (event: any) => {
          const target = event.target as HTMLElement;
          if (target.closest('.react-resizable-handle')) {
            return false;
          }
          if (target.closest('input, select, textarea, button, a, [role="button"], .ant-switch, .ant-checkbox, .ant-radio, .ant-select, .ant-dropdown-trigger, .ant-btn, .ant-dropdown-menu-item')) {
            return false;
          }
          if (target.closest('tbody td') && !rowDraggable) {
            return false;
          }
          return true;
        }
      } as any,
    })
  );

  const handleResize = (colKey: string) => (e: React.SyntheticEvent, { size }: { size: { width: number } }) => {
    setColumnData((prev) => {
      const idx = prev.findIndex((c) => c.key === colKey);
      if (idx === -1) return prev;
      const nextColumns = [...prev];
      nextColumns[idx] = {
        ...nextColumns[idx],
        width: size.width,
      };
      return nextColumns;
    });
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    
    if (active.id !== over.id) {
       // Check if it's a column or row drag
       const activeCol = columnData.find(c => c.key === active.id);
       if (activeCol) {
          // Column dragging
          setColumnData((prev) => {
            const activeIndex = prev.findIndex((i) => i.key === active.id);
            const overIndex = prev.findIndex((i) => i.key === over.id);
            return arrayMove(prev, activeIndex, overIndex);
          });
       } else if (rowDraggable && onRowDragEnd) {
          // Row dragging
          onRowDragEnd(active.id as string, over.id as string);
       }
    }
  };

  const getRecordValue = (record: T, dataIndex: ColumnType<T>['dataIndex']) => {
    if (dataIndex === undefined || dataIndex === null) return undefined;

    const path = Array.isArray(dataIndex) ? dataIndex : [dataIndex];
    return path.reduce<any>((current, key) => {
      if (current === undefined || current === null) return undefined;
      return current[key as keyof typeof current];
    }, record);
  };

  const getColumnSearchProps = (column: SmartTableColumn<T>) => {
    const dataIndex = column.dataIndex;
    const title = String(column.title ?? '');

    return {
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }: any) => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Input
            placeholder={t('search_col', { title })}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              {t('search')}
            </Button>
            <Button onClick={() => clearFilters && clearFilters()} size="small" style={{ width: 90 }}>
              {t('reset')}
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                confirm({ closeDropdown: false });
                setSearchText(String(selectedKeys[0] ?? ''));
                setSearchedColumn(String(dataIndex ?? ''));
              }}
            >
              {t('filter')}
            </Button>
            <Button type="link" size="small" onClick={() => close()}>
              {t('close')}
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
      ),
      onFilter: (value: any, record: T) => {
        const searchValue = String(value ?? '').trim().toLowerCase();
        if (!searchValue) return true;

        const recordValue = getRecordValue(record, dataIndex);
        const fieldValues = column.searchFields?.map(field => getRecordValue(record, field)) ?? [];
        const customSearchValue = column.searchText?.(record);
        const renderedValue = column.render
          ? column.render(recordValue, record, 0)
          : undefined;

        return [
          ...toSearchableParts(recordValue),
          ...fieldValues.flatMap(fieldValue => toSearchableParts(fieldValue)),
          ...toSearchableParts(customSearchValue),
          ...toSearchableParts(renderedValue),
        ].join(' ').toLowerCase().includes(searchValue);
      },
    };
  };

  const mergedColumns = useMemo(() => {
    return columnData
      .filter(col => col.visible)
      .map((col, index) => {
        const newCol = { ...col };
        
        if (col.searchable && col.dataIndex) {
          Object.assign(newCol, getColumnSearchProps(col));
        }

        return {
          ...newCol,
        onHeaderCell: (column: any) => ({
            width: column.width,
            onResize: handleResize(column.key),
            id: column.key,
            resizable: column.resizable !== false,
          }),
        };
      });
  }, [columnData]);

  const renderInheritedExpandedCell = (col: ColumnType<T>, record: T, index: number) => {
    const value = getRecordValue(record, col.dataIndex);
    const content = col.render
      ? col.render(value, record, index) as React.ReactNode
      : value as React.ReactNode;

    return content === undefined || content === null || content === ''
      ? <span className="text-slate-400 text-xs">N/A</span>
      : content;
  };

  const inheritedExpandedRowRender = (record: T, index: number) => (
    <div className="smart-table-expanded-grid">
      {mergedColumns.map((col) => (
        <div className="smart-table-expanded-item" key={String(col.key || col.dataIndex || index)}>
          <div className="smart-table-expanded-label">
            {col.title as React.ReactNode}
          </div>
          <div className="smart-table-expanded-value">
            {renderInheritedExpandedCell(col, record, index)}
          </div>
        </div>
      ))}
    </div>
  );

  const tableExpandable = responsiveExpanded
    ? {
        columnWidth: 44,
        fixed: 'left' as const,
        rowExpandable: () => true,
        ...restProps.expandable,
        expandedRowRender: restProps.expandable?.expandedRowRender || inheritedExpandedRowRender,
      }
    : restProps.expandable;

  const components = {
    header: {
      cell: (cellProps: any) => {
        const { id, onResize, width, children, ...rest } = cellProps;
        if (!id) return <th {...cellProps} />;
        return (
          <SmartHeaderCell 
            id={id} 
            width={width} 
            onResize={onResize} 
            {...rest}
          >
            {children}
          </SmartHeaderCell>
        );
      }
    }
  };

  const columnSelector = (
    <Popover
      trigger="click"
      placement="bottomRight"
      zIndex={2100}
      getPopupContainer={() => document.body}
      title={<span className="font-semibold text-slate-800 text-sm">{t('show_columns')}</span>}
      content={
        <div className="p-1 min-w-[180px] max-h-80 overflow-y-auto max-w-[calc(100vw-32px)]">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {columnData.map((col, i) => (
              <Checkbox
                key={col.key || i}
                checked={col.visible}
                onChange={(e) => {
                  const newData = [...columnData];
                  newData[i].visible = e.target.checked;
                  setColumnData(newData);
                }}
              >
                {col.title as string}
              </Checkbox>
            ))}
          </div>
        </div>
      }
    >
      <Button icon={<SettingOutlined />}>{t('columns')}</Button>
    </Popover>
  );

  return (
    <div className="smart-table w-full max-w-full overflow-visible">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {batchActions}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {extraActions}
          {columnSelector}
        </div>
      </div>
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={onDragEnd}
        modifiers={rowDraggable ? [restrictToVerticalAxis] : []}
      >
        <SortableContext 
          items={columnData.filter(c => c.visible).map(c => c.key as string)} 
          strategy={horizontalListSortingStrategy}
        >
          <Table
            {...restProps}
            bordered
            expandable={tableExpandable}
            locale={{
              emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" />,
              ...restProps.locale,
            }}
            components={{
              ...components,
              body: rowDraggable ? { row: SortableRow } : restProps.components?.body
            }}
            onRow={rowDraggable ? (record: any) => ({
              'data-row-key': record.key,
            } as any) : restProps.onRow}
            columns={mergedColumns as any}
          />
        </SortableContext>
      </DndContext>
    </div>
  );
}

const { Title } = Typography;
