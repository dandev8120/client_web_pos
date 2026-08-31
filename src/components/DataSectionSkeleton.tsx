import React from 'react';
import { Skeleton } from 'antd';
import { useTranslation } from 'react-i18next';

interface DataSectionSkeletonProps {
  rows?: number;
  titleKey?: string;
  className?: string;
}

export const DataSectionSkeleton: React.FC<DataSectionSkeletonProps> = ({
  rows = 6,
  titleKey = 'section_loading_title',
  className = '',
}) => {
  const { t } = useTranslation();

  return (
    <section
      className={`rounded-lg border border-slate-100 bg-white p-4 shadow-sm ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Skeleton.Input active size="small" style={{ width: 220, maxWidth: '100%' }} />
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Skeleton.Button active size="small" />
          <Skeleton.Button active size="small" />
        </div>
      </div>

      <div className="grid gap-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-md border border-slate-100 p-3 md:grid-cols-[90px_1fr_1fr_1fr_120px]"
          >
            <Skeleton.Input active size="small" block />
            <Skeleton.Input active size="small" block />
            <Skeleton.Input active size="small" block />
            <Skeleton.Input active size="small" block />
            <Skeleton.Input active size="small" block />
          </div>
        ))}
      </div>

      <span className="sr-only">{t(titleKey)}</span>
    </section>
  );
};

export default DataSectionSkeleton;
