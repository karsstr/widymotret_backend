import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../middleware/auth';

const router: Router = express.Router();

// Ensure uploads directory exists
const uploadDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
console.log('[upload] Storage directory:', uploadDir);

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Hanya file gambar (jpg, png, webp) yang diperbolehkan!'));
    }
});

// POST /api/upload - Single image upload (protected)
router.post('/', authMiddleware as any, upload.single('file'), (req: Request, res: Response) => {
    try {
        console.log(`[DEBUG upload] Request received. File:`, req.file ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            encoding: req.file.encoding,
            mimetype: req.file.mimetype,
            destination: req.file.destination,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
        } : 'NO FILE');

        if (!req.file) {
            console.log(`[DEBUG upload] No file uploaded`);
            res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah' });
            return;
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        console.log(`[DEBUG upload] File saved successfully at: ${imageUrl}`);
        
        res.json({
            success: true,
            message: 'File berhasil diunggah',
            data: {
                url: imageUrl
            }
        });
    } catch (error: any) {
        console.error(`[DEBUG upload] Error:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
