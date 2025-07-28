import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Upload, FileText, DollarSign, BarChart2} from 'lucide-react';
import toast from 'react-hot-toast';
import UserProfileModal from '../components/dashboard/UserProfileModal';
import InvoiceDetailModal from '../components/dashboard/InvoiceDetailModal';
import InvoicesTable from '../components/dashboard/InvoicesTable';
import InvoiceFilters from '../components/dashboard/InvoiceFilters';
import { userStore } from '../store/userStore';
import { API_URL } from '../config';
import type { Invoice } from '../types';

const DashboardPage = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filters, setFilters] = useState({
    issuerRfc: '',
    providerName: '',
    receiverRfc: '',
    fromDate: '',
    toDate: '',
  });

  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);

  const navigate = useNavigate();
  const user = userStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      toast.error('Por favor inicia sesión');
      navigate('/auth');
    } else {
      fetchUserInvoices();
    }
  }, [user, navigate]);

  useEffect(() => {
    let filtered = [...invoices];

    if (filters.issuerRfc) {
      filtered = filtered.filter(i =>
        i.issuer_rfc.toLowerCase().includes(filters.issuerRfc.toLowerCase())
      );
    }
    if (filters.providerName) {
      filtered = filtered.filter(i =>
        i.provider_name.toLowerCase().includes(filters.providerName.toLowerCase())
      );
    }
    if (filters.receiverRfc) {
      filtered = filtered.filter(i =>
        i.receiver_rfc.toLowerCase().includes(filters.receiverRfc.toLowerCase())
      );
    }
    if (filters.fromDate) {
      filtered = filtered.filter(i =>
        new Date(i.issue_date) >= new Date(filters.fromDate)
      );
    }
    if (filters.toDate) {
      filtered = filtered.filter(i =>
        new Date(i.issue_date) <= new Date(filters.toDate)
      );
    }

    setFilteredInvoices(filtered);
  }, [filters, invoices]);

  <InvoiceFilters onFilterChange={setFilters} />

  const fetchUserInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/invoice/get-user-invoices`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      } else {
        toast.error('Error al cargar las facturas');
      }
    } catch (error) {
      toast.error('Error de conexión al cargar facturas');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

 
  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadInvoice(file);
    }
  };

  const handleUploadInvoice = async (file: File) => {
    if (!file) return toast.error('Selecciona un archivo PDF');
    if (file.type !== 'application/pdf') return toast.error('Solo se permiten archivos PDF');

    try {
      setUploadingInvoice(true);
      toast.loading('Subiendo archivo...', { id: 'upload-toast' });

      const uploadRes = await fetch(`${API_URL}/invoice/upload-invoice-s3`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!uploadRes.ok) throw new Error('Error al obtener la URL firmada');

      const { uploadUrl } = await uploadRes.json();

      const s3Upload = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': 'application/pdf' },
      });
      if (!s3Upload.ok) throw new Error('Error al subir el archivo a S3');

      const s3FileUrl = uploadUrl.split('?')[0];

      toast.loading('Procesando factura...', { id: 'upload-toast' });

      const processRes = await fetch(`${API_URL}/invoice/upload`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s3_url: s3FileUrl }),
      });
      if (!processRes.ok) {
        const errorData = await processRes.json();
        throw new Error(errorData.message || 'Error al procesar la factura');
      }
      await processRes.json();

      toast.success('Factura procesada y guardada con éxito', { id: 'upload-toast' });

      setUploadingInvoice(false);

      fetchUserInvoices();

    } catch (error: unknown) {
      if (error instanceof Error) {
      toast.error(error.message || 'Error al procesar la factura', { id: 'upload-toast' });
      setUploadingInvoice(false);
    } else {
      console.error('Error desconocido');
    }
  }
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (!window.confirm(`¿Eliminar factura}? Esta acción no se puede deshacer.`)) return;

    try {
      const response = await fetch(`${API_URL}/invoice/delete-invoice/${invoice.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Factura eliminada');
        fetchUserInvoices();
      } else {
        toast.error('Error al eliminar factura');
      }
    } catch {
      toast.error('Error de conexión al eliminar factura');
    }
  };

  // Total facturas filtradas
  const totalInvoices = filteredInvoices.length;

  // Suma total de montos 
  const totalAmount = filteredInvoices.reduce((acc, inv) => acc + (inv.amount || 0), 0);

  // Promedio (
  const averageAmount = totalInvoices > 0 ? totalAmount / totalInvoices : 0;


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Cargando facturas...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 px-10 py-30">
        <div className="max-w-6xl mx-auto">
          <header className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 sm:p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Mis facturas</h1>
              <p className="text-slate-400 text-sm">Bienvenido, {user?.name || 'Usuario'}</p>
            </div>

            <div className="flex justify-center sm:justify-end">
              <button
                onClick={openProfileModal}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Mi Perfil</span>
              </button>
            </div>
          </header>

          <input
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            id="invoice-upload-input"
            onChange={onFileInputChange}
          />

          <button
            onClick={() => document.getElementById('invoice-upload-input')?.click()}
            disabled={uploadingInvoice}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors font-medium mb-8 ${
              uploadingInvoice ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            <Upload className={`h-5 w-5 ${uploadingInvoice ? 'animate-spin' : ''}`} />
            <span>{uploadingInvoice ? 'Procesando...' : 'Subir Nueva Factura'}</span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-400/20 shadow-lg rounded-lg p-6 flex items-center space-x-4">
              <div className="p-3 bg-blue-500 rounded-full">
                <FileText className="text-white w-7 h-7" />
              </div>
              <div>
                <h3 className="text-blue-200 text-sm font-semibold uppercase tracking-wide">Total de Facturas</h3>
                <p className="text-white text-3xl font-bold">{totalInvoices}</p>
              </div>
            </div>

            <div className="bg-green-400/20 shadow-lg rounded-lg p-6 flex items-center space-x-4">
              <div className="p-3 bg-green-500 rounded-full">
                <DollarSign className="text-white w-7 h-7" />
              </div>
              <div>
                <h3 className="text-green-200 text-sm font-semibold uppercase tracking-wide">Monto Total</h3>
                <p className="text-white text-3xl font-bold">${totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </div>
            </div>

            <div className="bg-purple-400/20 shadow-lg rounded-lg p-6 flex items-center space-x-4">
              <div className="p-3 bg-purple-500 rounded-full">
                <BarChart2 className="text-white w-7 h-7" />
              </div>
              <div>
                <h3 className="text-purple-200 text-sm font-semibold uppercase tracking-wide">Monto Promedio</h3>
                <p className="text-white text-3xl font-bold">${averageAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-slate-100">
                Todas las Facturas ({invoices.length})
              </h2>
            </div>

            <InvoiceFilters onFilterChange={setFilters} />

              {filteredInvoices.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No hay facturas que coincidan con los filtros.
                </div>
              ) : (
                <InvoicesTable
                  invoices={filteredInvoices}
                  onViewDetails={handleViewDetails}
                  onDeleteInvoice={handleDeleteInvoice}
                />
              )}
          </div>
        </div>
      </div>

      <UserProfileModal isOpen={isProfileModalOpen} onClose={closeProfileModal} />

      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </>
  );
};

export default DashboardPage;
