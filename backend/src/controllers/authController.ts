import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../models/db';
import { AppError } from '../middlewares/errorHandler';
import { sendEmail } from '../services/emailService';
import { AuthenticatedRequest } from '../middlewares/auth';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const generateToken = (id: string) => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_token_key_for_zedech_ecommerce_platform_2026';
  return jwt.sign({ id }, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  });
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = signupSchema.parse(req.body);

    const userExists = await prisma.user.findUnique({ where: { email: body.email } });
    if (userExists) {
      return next(new AppError('User already exists with this email address', 400));
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit pin

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash,
        verificationToken,
      },
    });

    // Send verification email
    await sendEmail({
      email: user.email,
      subject: 'Verify your email address - Zedech Store',
      message: `Your 6-digit verification code is: ${verificationToken}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; max-width: 600px;">
          <h2 style="color: #111;">Welcome to Zedech Store</h2>
          <p>Thank you for signing up! Please verify your email using the 6-digit code below:</p>
          <div style="font-size: 24px; font-weight: bold; background: #f4f4f5; padding: 12px; border-radius: 4px; display: inline-block; letter-spacing: 2px;">
            ${verificationToken}
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #71717a;">If you did not request this email, please ignore it.</p>
        </div>
      `,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for a verification code.',
      userId: user.id,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    const isMatch = await bcrypt.compare(body.password, user.passwordHash);
    if (!isMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return next(new AppError('Email and verification code are required', 400));
    }

    const user = await prisma.user.findFirst({
      where: { email, verificationToken: code },
    });

    if (!user) {
      return next(new AppError('Invalid or expired verification code', 400));
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
      },
    });

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new AppError('Email is required', 400));
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success anyway for security reasons to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a reset code has been sent.',
      });
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit pin
    const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    await sendEmail({
      email: user.email,
      subject: 'Password reset request - Zedech Store',
      message: `Your password reset code is: ${resetToken}. It expires in 30 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; max-width: 600px;">
          <h2 style="color: #111;">Reset Your Password</h2>
          <p>You requested to reset your password. Please use the code below:</p>
          <div style="font-size: 24px; font-weight: bold; background: #f4f4f5; padding: 12px; border-radius: 4px; display: inline-block; letter-spacing: 2px;">
            ${resetToken}
          </div>
          <p style="margin-top: 20px;">This code is valid for 30 minutes.</p>
          <p style="font-size: 12px; color: #71717a;">If you did not request this, please contact support.</p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return next(new AppError('All fields (email, code, newPassword) are required', 400));
    }

    const user = await prisma.user.findFirst({
      where: {
        email,
        resetToken: code,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return next(new AppError('Invalid or expired reset code', 400));
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, googleId } = req.body;
    if (!email || !name) {
      return next(new AppError('Email and name are required', 400));
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create a password hash that is random so standard email/password cannot access it
      const randomPassword = Math.random().toString(36) + Math.random().toString(36);
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          isEmailVerified: true,
        },
      });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authorized', 401));
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        addresses: true,
      },
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        addresses: user.addresses,
        loyaltyPoints: user.loyaltyPoints,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Not authorized', 401));

    const { name, email, password } = req.body;
    const updateData: any = {};

    if (name) updateData.name = name;
    if (email) {
      // Check if email already taken
      const emailExists = await prisma.user.findFirst({
        where: { email, id: { not: req.user.id } },
      });
      if (emailExists) {
        return next(new AppError('Email is already taken', 400));
      }
      updateData.email = email;
    }
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
