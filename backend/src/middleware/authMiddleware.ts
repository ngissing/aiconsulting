import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabaseClient';
// Assuming you might want to interact with your public.users table via Prisma
// import { PrismaClient } from '../generated/prisma';
// const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: any; // Add a 'user' property to the Request object
}

export const requireAdminAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided.' });
    return;
  }

  const token = authHeader.substring(7, authHeader.length); // Remove 'Bearer ' prefix

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
      return;
    }

    // Optional: Verify the user is an admin in your public.users table
    // const userProfile = await prisma.user.findUnique({ where: { id: user.id } });
    // if (!userProfile || userProfile.role !== 'admin') {
    //   res.status(403).json({ error: 'Forbidden: User is not an administrator.' });
    //   return;
    // }

    // If using the above check, you might want to attach userProfile to req instead of just user
    req.user = user; // Attach user information to the request object
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
};