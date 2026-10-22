import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/database';
import { AuthRequest } from '../middleware/auth.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'scribespace_jwt_secret_dev_key_2026';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'scribespace_refresh_secret_dev_key_2026';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Validate inputs
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields (username, email, password) are required.' });
    }

    const trimmedUsername = String(username).trim();
    const trimmedEmail = String(email).trim().toLowerCase();

    if (trimmedUsername.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters long.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Check if user with email already exists
    const existing = await db.query('SELECT * FROM users WHERE email = $1', [trimmedEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'An account with this email address already exists.' });
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const insertResult = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
      [trimmedUsername, trimmedEmail, hashedPassword]
    );

    const newUser = insertResult.rows[0];

    // Generate tokens
    const accessToken = jwt.sign(
      { id: newUser.id, username: newUser.username, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: newUser.id },
      REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Set secure HTTP-only cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: 'User registered successfully.',
      accessToken,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        avatar_url: newUser.avatar_url,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const trimmedEmail = String(email).trim().toLowerCase();

    // Find user in database
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [trimmedEmail]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const user = userResult.rows[0];

    // Verify password with bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login successful.',
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided in cookie.' });
    }

    jwt.verify(refreshToken, REFRESH_SECRET, async (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired refresh token.' });
      }

      const userResult = await db.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
      if (userResult.rows.length === 0) {
        return res.status(403).json({ message: 'User belonging to token no longer exists.' });
      }

      const user = userResult.rows[0];

      const newAccessToken = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.json({
        accessToken: newAccessToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar_url: user.avatar_url,
        },
      });
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(500).json({ message: 'Internal server error during token refresh.' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully.' });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated.' });
    }
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const user = userResult.rows[0];
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving user profile.' });
  }
};

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const result = await db.query('SELECT id, username, email, avatar_url FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users.' });
  }
};
