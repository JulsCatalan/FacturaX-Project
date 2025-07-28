import React from 'react';
import { Eye, Upload, Trash } from 'lucide-react';
import type { Invoice } from '../../types';

interface Props {
  invoices: Invoice[];
  onViewDetails: (invoice: Invoice) => void;
  onDeleteInvoice: (invoice: Invoice) => void;
}

const InvoicesTable: React.FC<Props> = ({ invoices, onViewDetails, onDeleteInvoice }) => {
  if (invoices.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        No tienes facturas aún. ¡Sube tu primera factura!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead className="bg-slate-700/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Proveedor</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Cliente</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Monto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Fecha</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Detalles</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-slate-700/30 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{invoice.provider_name || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{invoice.receiver_name || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">${(invoice.amount || 0).toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                {invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString('es-ES') : 'N/A'}
              </td>
              <div className="px-6 py-4 flex flex-row items-center text-sm text-slate-300 space-x-2">
                <button
                  onClick={() => onViewDetails(invoice)}
                  className="p-1 rounded hover:bg-slate-700 transition-colors"
                  title="Ver detalles"
                >
                  <Eye className="w-5 h-5" />
                </button>

                <a
                  href={invoice.s3_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded hover:bg-slate-700 transition-colors inline-block"
                  title="Descargar PDF"
                >
                  <Upload className="w-5 h-5" />
                </a>

                <button
                  onClick={() => onDeleteInvoice(invoice)}
                  className="p-1 rounded hover:bg-red-700/20 transition-colors"
                  title="Eliminar factura"
                >
                  <Trash className="w-5 h-5 text-red-500 hover:text-red-600" />
                </button>
              </div>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoicesTable;
