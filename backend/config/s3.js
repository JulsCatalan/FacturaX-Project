import { S3Client, PutObjectCommand, ListBucketsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const region = process.env.S3_REGION;
const bucketName = process.env.S3_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

// Configuración del cliente S3
const s3Client = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

// Verifica conexión a S3
export async function verifyS3Connection() {
    if (!region || !bucketName || !accessKeyId || !secretAccessKey) {
        console.error("Error: Faltan variables de entorno necesarias para la conexión a S3.");
        throw new Error("No se pudo conectar a S3 debido a configuraciones faltantes.");
    }

    try {
        const response = await s3Client.send(new ListBucketsCommand({}));
        if (response.Buckets?.length) {
            console.log("Conexión a S3 verificada.");
        } else {
            console.warn("Conexión a S3 verificada, pero no se encontraron buckets.");
        }
    } catch (error) {
        console.error("Error al verificar la conexión con S3:", error);
        throw new Error("No se pudo conectar a S3.");
    }
}

// Utilidad para formatear fecha como yyyy-mm-dd
function formatDate(date){
    return date.toISOString().split("T")[0];
}

// Genera una URL firmada para subir una factura PDF
export async function generateInvoiceUrl() {
    const date = new Date();
    const randomId = uuidv4();
    const key = `pdf_invoice/${randomId}_${formatDate(date)}.pdf`;

    const params = {
        Bucket: bucketName,
        Key: key,
        ContentType: "application/pdf",
    };

    const uploadURL = await getSignedUrl(
        s3Client,
        new PutObjectCommand(params),
        { expiresIn: 300 } // URL válida por 5 minutos
    );

    return uploadURL;
}
