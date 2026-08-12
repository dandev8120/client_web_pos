import React from 'react';
import { PrintInvoice } from './PrintInvoice';

interface PrintInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  order: any;
  detail?: any;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({
  open,
  onClose,
  order,
  detail,
}) => {
  if (!open || !order) return null;

  const siteCode = order.storeId || order.siteCode || '1134';
  const receiptNumber = order.id || order.receiptNumber || '';

  return (
    <PrintInvoice
      open={open}
      onClose={onClose}
      order={order}
      initialDetail={detail}
      siteCode={siteCode}
      receiptNumber={receiptNumber}
      isModal={true}
    />
  );
};

export default PrintInvoiceModal;
