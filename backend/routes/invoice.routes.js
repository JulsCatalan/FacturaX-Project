import express from 'express';
import { validateToken } from '../middleware/jwt.js';
import { generateInvoiceUrl } from '../config/s3.js';
import { getInvoices, createNewInvoice, deleteInvoice } from '../controllers/invoice.controller.js';

const router = express.Router();

// Ruta para obtener URL firmada de subida a S3
router.get('/upload-invoice-s3', validateToken, async (req, res) => {
    try {
        const uploadUrl = await generateInvoiceUrl();
        res.status(200).json({ uploadUrl });
    } catch (error) {
        console.error('Error al generar URL firmada para S3:', error);
        res.status(500).json({ message: 'No se pudo generar la URL de carga' });
    }
});

router.get('/get-user-invoices', validateToken, getInvoices);

router.post('/upload', validateToken, createNewInvoice);

router.delete('/delete-invoice/:id', validateToken, deleteInvoice);

export default router;
