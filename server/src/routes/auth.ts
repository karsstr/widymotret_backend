import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({
                success: false,
                message: 'Username dan password wajib diisi',
            });
            return;
        }

        // Find admin by username
        const admin = await prisma.admin.findUnique({
            where: { username },
        });

        if (!admin) {
            res.status(401).json({
                success: false,
                message: 'Username atau password salah',
            });
            return;
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Username atau password salah',
            });
            return;
        }

        // Generate JWT token
        const secret = process.env.JWT_SECRET || 'fallback-secret';
        const token = jwt.sign({ adminId: admin.id }, secret, { expiresIn: '24h' });

        res.json({
            success: true,
            message: 'Login berhasil',
            data: {
                token,
                admin: {
                    id: admin.id,
                    username: admin.username,
                },
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
        });
    }
});

// GET /api/auth/me (protected)
router.get('/me', authMiddleware as any, async (req: Request, res: Response) => {
    try {
        const adminId = (req as AuthRequest).adminId;
        const admin = await prisma.admin.findUnique({
            where: { id: adminId },
            select: { id: true, username: true, createdAt: true },
        });

        if (!admin) {
            res.status(404).json({
                success: false,
                message: 'Admin tidak ditemukan',
            });
            return;
        }

        res.json({
            success: true,
            data: admin,
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
        });
    }
});

export default router;
