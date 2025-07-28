import React, { useState } from 'react';

interface Filters {
  issuerRfc: string;
  providerName: string;
  receiverRfc: string;
  fromDate: string;
  toDate: string;
}

interface Props {
  onFilterChange: (filters: Filters) => void;
}

const InvoiceFilters: React.FC<Props> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<Filters>({
    issuerRfc: '',
    providerName: '',
    receiverRfc: '',
    fromDate: '',
    toDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-slate-800/70 rounded-lg border border-slate-700 p-4 mb-6 flex flex-wrap gap-4 text-slate-300">
      <input
        type="text"
        name="issuerRfc"
        placeholder="RFC Emisor"
        value={filters.issuerRfc}
        onChange={handleChange}
        className="px-3 py-2 rounded bg-slate-900 border border-slate-700 focus:outline-none focus:border-blue-500 flex-1 min-w-[150px]"
      />
      <input
        type="text"
        name="providerName"
        placeholder="Nombre Emisor"
        value={filters.providerName}
        onChange={handleChange}
        className="px-3 py-2 rounded bg-slate-900 border border-slate-700 focus:outline-none focus:border-blue-500 flex-1 min-w-[150px]"
      />
      <input
        type="text"
        name="receiverRfc"
        placeholder="RFC Receptor"
        value={filters.receiverRfc}
        onChange={handleChange}
        className="px-3 py-2 rounded bg-slate-900 border border-slate-700 focus:outline-none focus:border-blue-500 flex-1 min-w-[150px]"
      />
      <input
        type="date"
        name="fromDate"
        value={filters.fromDate}
        onChange={handleChange}
        className="px-3 py-2 rounded bg-slate-900 border border-slate-700 focus:outline-none focus:border-blue-500"
        placeholder="Desde"
      />
      <input
        type="date"
        name="toDate"
        value={filters.toDate}
        onChange={handleChange}
        className="px-3 py-2 rounded bg-slate-900 border border-slate-700 focus:outline-none focus:border-blue-500"
        placeholder="Hasta"
      />
    </div>
  );
};

export default InvoiceFilters;
