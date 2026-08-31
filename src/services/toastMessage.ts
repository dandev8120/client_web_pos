import type { ReactNode } from 'react';
import {
  gooeyToast,
  type DismissFilter,
  type GooeyPromiseData,
  type GooeyToastAction,
  type GooeyToastOptions,
  type GooeyToastUpdateOptions,
  type GooeyToasterProps,
} from 'goey-toast';

type ToastKind = 'default' | 'success' | 'info' | 'warning' | 'error' | 'loading';

type AntdMessageArgs = {
  content?: ReactNode;
  description?: ReactNode;
  title?: string;
  key?: string | number;
  duration?: number;
  action?: GooeyToastAction | null;
  onClose?: () => void;
};

type ToastInput = ReactNode | AntdMessageArgs | null | undefined;
type ToastActionInput = GooeyToastAction | number | null | undefined;

export type ToastMessageAction = GooeyToastAction;
export type ToastMessageOptions = GooeyToastOptions;
export type ToastMessageUpdateOptions = GooeyToastUpdateOptions;
export type ToastMessagePromiseData<T> = GooeyPromiseData<T>;

export const goeyToasterConfig: GooeyToasterProps = {
  position: 'top-center',
  duration: 4000,
  gap: 12,
  offset: 24,
  theme: 'light',
  preset: 'smooth',
  spring: true,
  bounce: 0.18,
  closeOnEscape: true,
  closeButton: 'top-right',
  showProgress: true,
  showTimestamp: false,
  swipeToDismiss: true,
  maxQueue: 1,
  queueOverflow: 'drop-oldest',
};

export const toastTitles: Record<ToastKind, string> = {
  default: 'Thông báo',
  success: 'Thành công',
  info: 'Thông báo',
  warning: 'Cảnh báo',
  error: 'Có lỗi xảy ra',
  loading: 'Đang xử lý',
};

export const toastTypeOptions: Record<ToastKind, GooeyToastOptions> = {
  default: {
    duration: 4000,
    preset: 'smooth',
    showProgress: true,
  },
  success: {
    duration: 3500,
    preset: 'smooth',
    showProgress: true,
  },
  info: {
    duration: 4000,
    preset: 'smooth',
    showProgress: true,
  },
  warning: {
    duration: 5500,
    preset: 'snappy',
    bounce: 0.22,
    showProgress: true,
  },
  error: {
    duration: 6500,
    preset: 'snappy',
    bounce: 0.26,
    showProgress: true,
  },
  loading: {
    duration: 30000,
    preset: 'subtle',
    showProgress: false,
  },
};

function isBlankText(value: unknown) {
  return typeof value === 'string' && value.trim().length === 0;
}

function normalizeOptionalNode(value: ReactNode) {
  if (value === null || value === undefined || value === false || isBlankText(value)) {
    return undefined;
  }

  return value;
}

function isMessageArgs(value: ToastInput): value is AntdMessageArgs {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  return (
    'content' in value
    || 'description' in value
    || 'title' in value
    || 'duration' in value
    || 'action' in value
    || 'onClose' in value
  );
}

function normalizeAction(action: GooeyToastAction | null | undefined) {
  if (!action || typeof action.onClick !== 'function' || !action.label?.trim()) {
    return undefined;
  }

  return action;
}

function secondsToMs(duration: number | undefined) {
  if (duration === undefined || duration === null || Number.isNaN(duration)) return undefined;
  if (duration <= 0) return undefined;
  return duration * 1000;
}

function buildToastOptions(
  kind: ToastKind,
  input: ToastInput,
  actionOrDuration?: ToastActionInput,
  options?: GooeyToastOptions
) {
  const args = isMessageArgs(input) ? input : undefined;
  const content = args
    ? normalizeOptionalNode(args.description ?? args.content)
    : normalizeOptionalNode(input as ReactNode);
  const action = typeof actionOrDuration === 'number'
    ? normalizeAction(args?.action ?? null)
    : normalizeAction((actionOrDuration ?? args?.action) as GooeyToastAction | null | undefined);
  const duration = secondsToMs(args?.duration ?? (typeof actionOrDuration === 'number' ? actionOrDuration : undefined));
  const title = args?.title?.trim() || toastTitles[kind];
  const id = args?.key ?? options?.id;

  return {
    title,
    options: {
      ...toastTypeOptions[kind],
      ...(duration ? { duration } : {}),
      ...(id !== undefined ? { id } : {}),
      ...(content !== undefined ? { description: content } : {}),
      ...(action ? { action } : {}),
      ...(args?.onClose ? { onDismiss: args.onClose } : {}),
      ...(options || {}),
    } satisfies GooeyToastOptions,
  };
}

function showToast(
  kind: ToastKind,
  input?: ToastInput,
  actionOrDuration?: ToastActionInput,
  options?: GooeyToastOptions
) {
  const toast = buildToastOptions(kind, input, actionOrDuration, options);

  if (kind === 'success') return gooeyToast.success(toast.title, toast.options);
  if (kind === 'error') return gooeyToast.error(toast.title, toast.options);
  if (kind === 'warning') return gooeyToast.warning(toast.title, toast.options);
  if (kind === 'info') return gooeyToast.info(toast.title, toast.options);

  return gooeyToast(toast.title, toast.options);
}

export const message = {
  success: (description?: ToastInput, action?: GooeyToastAction | null, options?: GooeyToastOptions) =>
    showToast('success', description, action, options),
  info: (description?: ToastInput, action?: GooeyToastAction | null, options?: GooeyToastOptions) =>
    showToast('info', description, action, options),
  warning: (description?: ToastInput, action?: GooeyToastAction | null, options?: GooeyToastOptions) =>
    showToast('warning', description, action, options),
  error: (description?: ToastInput, action?: GooeyToastAction | null, options?: GooeyToastOptions) =>
    showToast('error', description, action, options),
  open: (description?: ToastInput, action?: GooeyToastAction | null, options?: GooeyToastOptions) =>
    showToast('default', description, action, options),
  loading: (description?: ToastInput, duration?: number, options?: GooeyToastOptions) =>
    showToast('loading', description, duration, options),
  destroy: (idOrFilter?: string | number | DismissFilter) => gooeyToast.dismiss(idOrFilter),
  dismiss: (idOrFilter?: string | number | DismissFilter) => gooeyToast.dismiss(idOrFilter),
  update: (id: string | number, options: GooeyToastUpdateOptions) => gooeyToast.update(id, options),
  promise: <T>(promise: Promise<T>, data: GooeyPromiseData<T>) => gooeyToast.promise(promise, data),
};

export { GooeyToaster } from 'goey-toast';
