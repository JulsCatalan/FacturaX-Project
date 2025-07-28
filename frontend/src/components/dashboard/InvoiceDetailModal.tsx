import React from 'react';
import { Upload } from 'lucide-react';
import type { Invoice } from '../../types';

interface Props {
  invoice: Invoice | null;
  onClose: () => void;
}

const InvoiceDetailModal: React.FC<Props> = ({ invoice, onClose }) => {
  if (!invoice) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 text-slate-200 p-6 rounded-xl w-full max-w-md space-y-4 shadow-2xl border border-slate-600">
        <h3 className="text-xl font-bold text-white">Detalles de Factura</h3>
        <div><strong>Proveedor:</strong> {invoice.provider_name}</div>
        <div><strong>RFC Emisor:</strong> {invoice.issuer_rfc}</div>
        <div><strong>Cliente:</strong> {invoice.receiver_name}</div>
        <div><strong>RFC Receptor:</strong> {invoice.receiver_rfc}</div>
        <div><strong>Monto:</strong> ${invoice.amount.toLocaleString()}</div>
        <div><strong>Fecha de emisión:</strong> {new Date(invoice.issue_date).toLocaleDateString('es-ES')}</div>
        <div><strong>Estatus:</strong> {invoice.status}</div>

        <div className="flex justify-between items-center pt-4">
          <a
            href={invoice.s3_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
          >
            <Upload className="w-4 h-4" />
            <span>Descargar PDF</span>
          </a>
          <button
            onClick={onClose}
            className="text-sm text-slate-300 hover:text-white"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailModal;
