import React, { Suspense } from 'react';
import { DataSectionSkeleton } from '../components/DataSectionSkeleton';
import { useDelayedLoading } from '../hooks/useDelayedLoading';

type SkeletonComponent = React.ComponentType;

function DelayedSkeletonFallback({ SkeletonComponent }: { SkeletonComponent: SkeletonComponent }) {
  const showSkeleton = useDelayedLoading(true, 400);

  if (!showSkeleton) return null;

  return <SkeletonComponent />;
}

export const withSkeleton = <P extends object>(
  Component: React.ComponentType<P>,
  SkeletonComponent: SkeletonComponent = DataSectionSkeleton
) => {
  return function WithSkeleton(props: P) {
    return (
      <Suspense fallback={<DelayedSkeletonFallback SkeletonComponent={SkeletonComponent} />}>
        <Component {...props} />
      </Suspense>
    );
  };
};
