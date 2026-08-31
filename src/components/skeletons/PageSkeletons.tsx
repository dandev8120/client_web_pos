import React from 'react';
import { Card, Col, Row, Skeleton } from 'antd';

const PageHeaderSkeleton: React.FC<{ actions?: number }> = ({ actions = 2 }) => (
  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div className="min-w-0">
      <Skeleton.Input active size="small" style={{ width: 180, maxWidth: '100%' }} />
      <div className="mt-2">
        <Skeleton.Input active size="small" style={{ width: 300, maxWidth: '100%' }} />
      </div>
    </div>
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: actions }).map((_, index) => (
        <Skeleton.Button key={index} active size="small" />
      ))}
    </div>
  </div>
);

const SectionSkeleton: React.FC<{
  children: React.ReactNode;
  extra?: number;
  titleWidth?: number;
}> = ({ children, extra = 0, titleWidth = 180 }) => (
  <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Skeleton.Avatar active shape="square" size="small" />
        <Skeleton.Input active size="small" style={{ width: titleWidth, maxWidth: '100%' }} />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: extra }).map((_, index) => (
          <Skeleton.Button key={index} active size="small" />
        ))}
        <Skeleton.Button active size="small" style={{ width: 28 }} />
      </div>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const StatsCards: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <Row gutter={[12, 12]}>
    {Array.from({ length: count }).map((_, index) => (
      <Col key={index} xs={24} sm={12} xl={6}>
        <Card size="small" className="h-full">
          <div className="flex gap-3">
            <Skeleton.Avatar active shape="square" size={38} />
            <div className="min-w-0 flex-1">
              <Skeleton.Input active size="small" block />
              <div className="mt-3">
                <Skeleton.Input active size="small" style={{ width: '70%' }} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Skeleton.Input active size="small" block />
                <Skeleton.Input active size="small" block />
              </div>
            </div>
          </div>
        </Card>
      </Col>
    ))}
  </Row>
);

const FilterFormSkeleton: React.FC<{ fields?: number }> = ({ fields = 5 }) => (
  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <Skeleton.Input active size="small" style={{ width: 105 }} />
        <Skeleton.Input active size="small" block />
      </div>
    ))}
  </div>
);

const SmartTableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 8, cols = 8 }) => (
  <div className="overflow-hidden rounded-lg border border-slate-100 bg-white">
    <div className="grid border-b border-slate-100 bg-slate-50" style={{ gridTemplateColumns: `repeat(${cols}, minmax(96px, 1fr))` }}>
      {Array.from({ length: cols }).map((_, index) => (
        <div key={index} className="border-r border-slate-100 p-3 last:border-r-0">
          <Skeleton.Input active size="small" block />
        </div>
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={rowIndex}
        className="grid border-b border-slate-100 last:border-b-0"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(96px, 1fr))` }}
      >
        {Array.from({ length: cols }).map((_, colIndex) => (
          <div key={colIndex} className="border-r border-slate-100 p-3 last:border-r-0">
            <Skeleton.Input active size="small" block />
          </div>
        ))}
      </div>
    ))}
  </div>
);

const TabsHeaderSkeleton: React.FC<{ tabs?: number; actions?: number }> = ({ tabs = 3, actions = 2 }) => (
  <div className="mb-3 flex flex-col gap-3 border-b border-slate-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: tabs }).map((_, index) => (
        <Skeleton.Button key={index} active size="small" />
      ))}
    </div>
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: actions }).map((_, index) => (
        <Skeleton.Button key={index} active size="small" />
      ))}
    </div>
  </div>
);

export const OrdersSkeleton: React.FC = () => (
  <div className="space-y-4 sm:space-y-6">
    <SectionSkeleton titleWidth={90}>
      <StatsCards count={4} />
    </SectionSkeleton>
    <SectionSkeleton titleWidth={90} extra={0}>
      <FilterFormSkeleton fields={4} />
      <div className="mt-4 flex justify-end gap-2">
        <Skeleton.Button active size="small" />
        <Skeleton.Button active size="small" />
      </div>
    </SectionSkeleton>
    <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm sm:p-5">
      <TabsHeaderSkeleton tabs={3} actions={3} />
      <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
        <Skeleton.Avatar active shape="square" size="small" />
        <Skeleton.Input active size="small" style={{ width: 210 }} />
      </div>
      <SmartTableSkeleton rows={8} cols={10} />
    </div>
  </div>
);

export const ProductsSkeleton: React.FC = () => (
  <div className="p-4">
    <PageHeaderSkeleton actions={0} />
    <div className="space-y-4">
      <SectionSkeleton titleWidth={210}>
        <FilterFormSkeleton fields={5} />
        <div className="mt-4 flex justify-end gap-2">
          <Skeleton.Button active size="small" />
          <Skeleton.Button active size="small" />
        </div>
      </SectionSkeleton>
      <SectionSkeleton titleWidth={220}>
        <StatsCards count={4} />
      </SectionSkeleton>
      <SectionSkeleton titleWidth={190} extra={3}>
        <TabsHeaderSkeleton tabs={5} actions={0} />
        <SmartTableSkeleton rows={8} cols={8} />
      </SectionSkeleton>
    </div>
  </div>
);

export const CustomersSkeleton: React.FC = () => (
  <div className="p-4">
    <PageHeaderSkeleton actions={1} />
    <Card className="mb-4" size="small">
      <FilterFormSkeleton fields={3} />
    </Card>
    <div className="mb-4">
      <StatsCards count={4} />
    </div>
    <Card size="small">
      <TabsHeaderSkeleton tabs={0} actions={2} />
      <div className="grid gap-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="grid items-center gap-3 border-t border-slate-100 py-3 md:grid-cols-[280px_1fr_150px_150px]">
            <Skeleton active avatar paragraph={{ rows: 1 }} title={false} />
            <Skeleton.Input active size="small" block />
            <Skeleton.Button active size="small" />
            <Skeleton.Button active size="small" />
          </div>
        ))}
      </div>
    </Card>
  </div>
);

export const PromotionsSkeleton: React.FC = () => (
  <div className="p-4">
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <PageHeaderSkeleton actions={4} />
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={6}>
          <Card size="small">
            <Skeleton.Input active size="small" style={{ width: 150 }} />
            <div className="mt-4 grid gap-3">
              {Array.from({ length: 12 }).map((_, index) => (
                <Skeleton.Input key={index} active size="small" style={{ width: `${96 - (index % 4) * 8}%` }} />
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={18}>
          <StatsCards count={3} />
          <div className="mt-4">
            <FilterFormSkeleton fields={5} />
          </div>
          <div className="mt-4">
            <SmartTableSkeleton rows={7} cols={7} />
          </div>
        </Col>
      </Row>
    </div>
  </div>
);

export const RbacSkeleton: React.FC = () => (
  <div className="p-4">
    <PageHeaderSkeleton actions={2} />
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={9}>
        <Card size="small">
          <Skeleton.Input active size="small" style={{ width: 180 }} />
          <div className="mt-4 grid gap-3">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton.Input key={index} active size="small" style={{ width: `${92 - (index % 5) * 7}%` }} />
            ))}
          </div>
        </Card>
      </Col>
      <Col xs={24} lg={15}>
        <Card className="mb-4" size="small">
          <FilterFormSkeleton fields={3} />
        </Card>
        <SmartTableSkeleton rows={8} cols={5} />
      </Col>
    </Row>
  </div>
);

export const AuditLogsSkeleton: React.FC = () => (
  <div className="p-4">
    <PageHeaderSkeleton actions={2} />
    <StatsCards count={4} />
    <div className="my-4">
      <FilterFormSkeleton fields={5} />
    </div>
    <SmartTableSkeleton rows={9} cols={6} />
  </div>
);

export const VatConfigSkeleton: React.FC = () => (
  <div className="p-4">
    <PageHeaderSkeleton actions={2} />
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={15}>
        <Card size="small">
          <TabsHeaderSkeleton tabs={2} actions={2} />
          <div className="mb-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton.Input active size="small" style={{ width: 220 }} />
                <Skeleton.Input active size="small" style={{ width: 320, maxWidth: '100%' }} />
              </div>
              <Skeleton.Button active size="small" />
            </div>
          </div>
          <SmartTableSkeleton rows={6} cols={5} />
        </Card>
      </Col>
      <Col xs={24} lg={9}>
        <Card size="small">
          <Skeleton active paragraph={{ rows: 12 }} />
        </Card>
      </Col>
    </Row>
  </div>
);

export const FormsSkeleton: React.FC = () => (
  <div className="p-4">
    <PageHeaderSkeleton actions={1} />
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card size="small">
          <Skeleton active paragraph={{ rows: 12 }} />
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card size="small">
          <Skeleton active paragraph={{ rows: 12 }} />
        </Card>
      </Col>
    </Row>
  </div>
);

export const IconsSkeleton: React.FC = () => (
  <div className="p-4">
    <PageHeaderSkeleton actions={3} />
    <Card className="mb-4" size="small">
      <FilterFormSkeleton fields={4} />
    </Card>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      {Array.from({ length: 24 }).map((_, index) => (
        <Card key={index} size="small">
          <div className="flex items-center gap-3">
            <Skeleton.Avatar active shape="square" size={42} />
            <Skeleton.Input active size="small" style={{ width: 92 }} />
          </div>
        </Card>
      ))}
    </div>
  </div>
);
