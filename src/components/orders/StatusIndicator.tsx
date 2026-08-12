import React from 'react';
import { Tag } from 'antd';
import { 
  CheckCircleOutlined, 
  SyncOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons';

interface StatusIndicatorProps {
  status: any;
  type: 'sap' | 'order';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, type }) => {
  if (type === 'sap') {
    const isSynced = status === 1 || status === '1' || status === true || status === 'sync';
    const isFailed = status === 'failed';

    if (isSynced) {
      return (
        <Tag color="success" icon={<CheckCircleOutlined />} className="m-0 font-medium text-[11px] rounded-full px-2 py-0.5">
          Đã đồng bộ
        </Tag>
      );
    }
    if (isFailed) {
      return (
        <Tag color="error" icon={<CloseCircleOutlined />} className="m-0 font-medium text-[11px] rounded-full px-2 py-0.5">
          Thất bại
        </Tag>
      );
    }
    // 0 / false / pending -> "Chờ"
    return (
      <Tag color="warning" icon={<SyncOutlined spin />} className="m-0 font-medium text-[11px] rounded-full px-2 py-0.5">
        Chờ
      </Tag>
    );
  }

  // Order status logic: null / undefined / 'completed' / 'COMPLETED' -> Auto "Hoàn thành"
  if (status === null || status === undefined || status === 'completed' || status === 'COMPLETED' || status === 'HOAN_THANH') {
    return (
      <Tag color="blue" icon={<CheckCircleOutlined />} className="m-0 font-semibold text-[11px] rounded-full px-2.5 py-0.5">
        Hoàn thành
      </Tag>
    );
  }

  if (status === 'pending') {
    return (
      <Tag color="warning" icon={<ClockCircleOutlined />} className="m-0 font-semibold text-[11px] rounded-full px-2.5 py-0.5">
        Đang xử lý
      </Tag>
    );
  }

  if (status === 'cancelled') {
    return (
      <Tag color="default" icon={<CloseCircleOutlined />} className="m-0 font-semibold text-[11px] rounded-full px-2.5 py-0.5 text-slate-400 bg-slate-100 border-slate-200">
        Đã hủy
      </Tag>
    );
  }

  return (
    <Tag color="blue" icon={<CheckCircleOutlined />} className="m-0 font-semibold text-[11px] rounded-full px-2.5 py-0.5">
      Hoàn thành
    </Tag>
  );
};
