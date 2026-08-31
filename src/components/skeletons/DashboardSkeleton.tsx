import React from 'react';
import { Skeleton, Row, Col, Card } from 'antd';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="p-6">
      <Skeleton active paragraph={{ rows: 1 }} title={{ width: 200 }} className="mb-6" />
      <Row gutter={[16, 16]}>
        {[1, 2, 3, 4].map(i => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card>
              <Skeleton active avatar={{ shape: 'square' }} paragraph={{ rows: 2 }} />
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} lg={16}>
          <Card>
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card>
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
