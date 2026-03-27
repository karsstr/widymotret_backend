import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
    console.log('🔵 [auth] POST /login handler called');
    console.log('   Body:', JSON.stringify(req.body).substring(0, 100));
    
    try {
        const { username, email, password } = req.body;
        const emailOrUsername = email || username;

        console.log('   Processing login for:', emailOrUsername);

        if (!emailOrUsername || !password) {
            console.log('   ❌ Missing credentials');
            res.status(400).json({
                success: false,
                message: 'Email dan password wajib diisi',
            });
            return;
        }

        console.log('   🔍 Looking up admin in database...');
        // Find admin by email
        const admin = await prisma.admin.findUnique({
            where: { email: emailOrUsername },
        });

        if (!admin) {
            console.log('   ❌ Admin not found');
            res.status(401).json({
                success: false,
                message: 'Email atau password salah',
            });
            return;
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Email atau password salah',
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
                    username: admin.email,
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
            select: { id: true, email: true, createdAt: true },
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

console.log('✅ [auth] Router configured with routes: POST /login, GET /me');

export default router;
