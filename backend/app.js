import express from "express";
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';

import { verifyS3Connection } from "./config/s3.js";

import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js'
import invoiceRoutes from './routes/invoice.routes.js'

// Configurar la aplicación
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use(
  cors({
    origin: [
      'http://localhost:5173', 
      'http://localhost:3000',      
    ],
    credentials: true, 
  })
);

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const buildpath = path.join(__dirname, "../client/dist");

app.use(express.static(buildpath));


app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/invoice', invoiceRoutes);

verifyS3Connection()

app.get("/*splat", (req, res) => {
   res.sendFile(path.resolve(__dirname, "../client/dist/index.html"));
 });

app.listen(3000, () => {
  console.log("Running on port 3000...");
});