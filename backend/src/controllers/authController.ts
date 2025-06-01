import { Request, Response } from 'express';
import { supabase } from '../lib/supabaseClient';
// Assuming you might want to interact with your public.users table via Prisma
// import { PrismaClient } from '../generated/prisma'; 
// const prisma = new PrismaClient();

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      res.status(401).json({ error: error.message });
      return;
    }

    if (!data.session || !data.user) {
      res.status(401).json({ error: 'Login failed: No session or user data returned.' });
      return;
    }
    
    // Optional: Check if user exists in your public.users table and has 'admin' role
    // This requires that your public.users table is populated when a user signs up
    // and that the 'role' field is set.
    // const userProfile = await prisma.user.findUnique({ where: { id: data.user.id } });
    // if (!userProfile || userProfile.role !== 'admin') {
    //   // Even if Supabase auth is successful, if they are not an admin in our system, deny access.
    //   // You might want to sign them out from Supabase as well here.
    //   await supabase.auth.signOut();
    //   res.status(403).json({ error: 'Access denied: User is not an administrator.' });
    //   return;
    // }

    res.status(200).json({
        message: 'Login successful',
        session: data.session,
        user: data.user
        // userProfile // if you fetched and validated the profile
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Internal server error during logout.' });
  }
};