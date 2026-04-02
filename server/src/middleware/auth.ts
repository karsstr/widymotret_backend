import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    adminId?: number;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[auth] No token found in headers');
            res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'fallback-secret';

        const decoded = jwt.verify(token, secret) as { adminId: number };
        (req as AuthRequest).adminId = decoded.adminId;
        console.log(`[auth] ✓ Token verified for adminId=${decoded.adminId}`);

        next();
    } catch (error) {
        console.error('[auth] ✗ Token verification failed:', error instanceof Error ? error.message : error);
        res.status(401).json({ 
            success: false, 
            message: error instanceof Error && error.message.includes('expired') 
                ? 'Token sudah expired, silakan login kembali' 
                : 'Token tidak valid'
        });
    }
};
