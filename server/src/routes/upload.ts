import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../middleware/auth';

const router: Router = express.Router();

// Get consistent directory - use process.env or server root
const uploadDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || 
                  process.env.UPLOAD_DIR || 
                  path.resolve(process.cwd(), 'server', 'uploads');

console.log('[upload] DEBUG INFO:');
console.log('[upload]   PWD:', process.cwd());
console.log('[upload]   NODE_ENV:', process.env.NODE_ENV);
console.log('[upload]   RAILWAY_VOLUME_MOUNT_PATH:', process.env.RAILWAY_VOLUME_MOUNT_PATH || '(not set)');
console.log('[upload]   UPLOAD_DIR:', process.env.UPLOAD_DIR || '(not set)');
console.log('[upload]   Resolved uploadDir:', uploadDir);

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('[upload] Created uploads directory:', uploadDir);
}
console.log('[upload] Upload storage path:', uploadDir);
console.log('[upload] Uploads directory exists:', fs.existsSync(uploadDir));

try {
    fs.accessSync(uploadDir, fs.constants.R_OK);
    console.log('[upload] Uploads directory readable: true');
} catch (e) {
    console.log('[upload] Uploads directory readable: false', e);
}

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
        console.log(`[DEBUG upload] ========== UPLOAD REQUEST ==========`);
        console.log(`[DEBUG upload] Timestamp: ${new Date().toISOString()}`);
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
            console.log(`[DEBUG upload] ❌ No file uploaded`);
            res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah' });
            return;
        }

        // Verify file was actually saved
        const fileExists = fs.existsSync(req.file.path);
        const fileSize = fileExists ? fs.statSync(req.file.path).size : 0;
        console.log(`[DEBUG upload] File exists at ${req.file.path}: ${fileExists}`);
        console.log(`[DEBUG upload] File size: ${fileSize} bytes`);

        const imageUrl = `/uploads/${req.file.filename}`;
        console.log(`[DEBUG upload] ✅ File saved successfully at: ${imageUrl}`);
        console.log(`[DEBUG upload] Full path: ${req.file.path}`);
        console.log(`[DEBUG upload] Response URL: ${imageUrl}`);
        
        res.json({
            success: true,
            message: 'File berhasil diunggah',
            data: {
                url: imageUrl
            }
        });
        
        console.log(`[DEBUG upload] ========== UPLOAD COMPLETE ==========\n`);
    } catch (error: any) {
        console.error(`[DEBUG upload] ❌ Error:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/upload/debug/list - List all files in uploads directory (debug only)
router.get('/debug/list', (req: Request, res: Response) => {
    try {
        const files = fs.readdirSync(uploadDir);
        const fileStats = files.map(filename => {
            const filePath = path.join(uploadDir, filename);
            const stat = fs.statSync(filePath);
            return {
                filename,
                path: filePath,
                size: stat.size,
                created: stat.birthtime,
                url: `/uploads/${filename}`
            };
        });
        
        res.json({
            success: true,
            uploadDir,
            totalFiles: files.length,
            files: fileStats
        });
    } catch (error: any) {
        res.status(500).json({ 
            success: false, 
            message: error.message,
            uploadDir 
        });
    }
});

export default router;
