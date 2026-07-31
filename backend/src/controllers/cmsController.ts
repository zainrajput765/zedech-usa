import { Request, Response, NextFunction } from 'express';
import prisma from '../models/db';
import { AppError } from '../middlewares/errorHandler';

export const getCMSSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key } = req.params;

    const setting = await prisma.cMSSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      return next(new AppError(`CMS setting with key '${key}' not found`, 404));
    }

    res.status(200).json({
      success: true,
      key: setting.key,
      value: setting.value,
    });
  } catch (error) {
    next(error);
  }
};
