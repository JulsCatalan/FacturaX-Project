import db from "../config/db.js";
import pdfParse from 'pdf-parse';

export const extractInvoiceDataFromText = (text) => {
  const provider_name = text.match(/Nombre emisor:\s*(.+)/)?.[1]?.trim() || null;
  const issuer_rfc = text.match(/RFC emisor:\s*([A-Z0-9]+)/)?.[1] || null;
  const receiver_rfc = text.match(/RFC receptor:\s*([A-Z0-9]+)/)?.[1] || null;
  const receiver_name = text.match(/Nombre receptor:\s*(.+)/)?.[1]?.trim() || null;
  const totalStr = text.match(/Total\s*\$?\s*([\d,]+\.\d{2})/)?.[1]?.replace(',', '') || null;
  const issue_date = text.match(/Fecha y hora de certificación:\s*(\d{4}-\d{2}-\d{2})/)?.[1] || null;

  return {
    provider_name,
    issuer_rfc,
    receiver_rfc,
    receiver_name,
    amount: totalStr ? parseFloat(totalStr) : null,
    issue_date,
  };
};

export const extractInvoiceDataFromPDFBuffer = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer);
    return extractInvoiceDataFromText(data.text);
  } catch (error) {
    throw new Error('Error al extraer texto del PDF: ' + error.message);
  }
};

export const createNewInvoice = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }

  const { s3_url } = req.body;
  if (!s3_url) {
    return res.status(400).json({ message: 'Falta la URL de S3' });
  }

  try {
    const response = await fetch(s3_url);
    if (!response.ok) {
      return res.status(400).json({ message: `Error al descargar archivo: ${response.status}` });
    }

    const arrayBuffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    const extractedData = await extractInvoiceDataFromPDFBuffer(pdfBuffer);

    // Validación de campos obligatorios
    const requiredFields = [
      'provider_name',
      'issuer_rfc',
      'receiver_rfc',
      'receiver_name',
      'amount',
      'issue_date'
    ];

    const missingFields = requiredFields.filter(field => !extractedData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `No se pudieron extraer los campos necesarios de la factura`
      });
    }

    const { data, error } = await db
      .from('invoices')
      .insert({
        user_id: userId,
        provider_name: extractedData.provider_name,
        issuer_rfc: extractedData.issuer_rfc,
        receiver_rfc: extractedData.receiver_rfc,
        receiver_name: extractedData.receiver_name,
        amount: extractedData.amount,
        issue_date: extractedData.issue_date,
        s3_url,
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      message: 'Factura procesada y creada correctamente',
      invoice: {
        id: data.id,
        provider_name: data.provider_name,
        issuer_rfc: data.issuer_rfc,
        receiver_rfc: data.receiver_rfc,
        receiver_name: data.receiver_name,
        amount: data.amount,
        issue_date: data.issue_date,
        s3_url: data.s3_url,
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};


export const getInvoices = async (req, res) => {
  const userId = req.user.id;

  try {
    const { data, error } = await db
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ invoices: data });
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteInvoice = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'ID de factura requerido' });
  }

  try {
    const { data: existingInvoice, error: fetchError } = await db
      .from('invoices')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingInvoice) {
      return res.status(404).json({ message: 'Factura no encontrada o no autorizada' });
    }

    const { error: deleteError } = await db
      .from('invoices')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    res.status(200).json({ message: 'Factura eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar factura:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

