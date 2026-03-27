import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

type AdminLoginRow = {
    id: number;
    password: string;
    username: string;
};

async function findAdminForLogin(loginId: string): Promise<AdminLoginRow | null> {
    try {
        const byUsername = await prisma.$queryRaw<AdminLoginRow[]>`
            SELECT id, password, username
            FROM admins
            WHERE username = ${loginId}
            LIMIT 1
        `;
        if (byUsername.length > 0) {
            return byUsername[0];
        }
    } catch (err: any) {
        const msg = String(err?.message || err);
        console.error('⚠️ [auth] Username lookup failed:', msg);
        // Fall through to email lookup for legacy/alternate schemas
    }

    try {
        const byEmail = await prisma.$queryRaw<Array<{ id: number; password: string; email: string }>>`
            SELECT id, password, email
            FROM admins
            WHERE email = ${loginId}
            LIMIT 1
        `;
        if (byEmail.length > 0) {
            return {
                id: byEmail[0].id,
                password: byEmail[0].password,
                username: byEmail[0].email,
            };
        }
    } catch (err: any) {
        const msg = String(err?.message || err);
        console.error('⚠️ [auth] Email lookup failed:', msg);
    }

    return null;
}

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
    console.log('🔵 [auth] POST /login handler called');
    console.log('   Body:', JSON.stringify(req.body).substring(0, 100));
    
    try {
        const { username, email, password } = req.body;
        const loginId = email || username;

        console.log('   Processing login for:', loginId);

        if (!loginId || !password) {
            console.log('   ❌ Missing credentials');
            res.status(400).json({
                success: false,
                message: 'Email dan password wajib diisi',
            });
            return;
        }

        console.log('   🔍 Looking up admin in database...');
        const admin = await findAdminForLogin(loginId);

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
        let admin: { id: number; username: string; createdAt: Date } | null = null;

        try {
            const byUsername = await prisma.$queryRaw<Array<{ id: number; username: string; createdAt: Date }>>`
                SELECT id, username, createdAt
                FROM admins
                WHERE id = ${adminId}
                LIMIT 1
            `;
            admin = byUsername[0] ?? null;
        } catch (err: any) {
            console.error('⚠️ [auth/me] Username read failed:', String(err?.message || err));
        }

        if (!admin) {
            try {
                const byEmail = await prisma.$queryRaw<Array<{ id: number; email: string; createdAt: Date }>>`
                    SELECT id, email, createdAt
                    FROM admins
                    WHERE id = ${adminId}
                    LIMIT 1
                `;
                if (byEmail[0]) {
                    admin = {
                        id: byEmail[0].id,
                        username: byEmail[0].email,
                        createdAt: byEmail[0].createdAt,
                    };
                }
            } catch (err: any) {
                console.error('⚠️ [auth/me] Email read failed:', String(err?.message || err));
            }
        }

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
