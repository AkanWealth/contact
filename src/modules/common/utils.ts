import { captureException } from '@sentry/node';
import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';

import { AppError, CreateErr } from '../../types';

export const createError: CreateErr = (message, code = 403, validations = null) => {
  const err = new Error(message);
  // @ts-ignore
  err.code = code;
  // @ts-ignore
  err.validations = validations;
  return err;
};

export const success = (msg: string, data: any, meta?: object) => ({
  data,
  status: true,
  message: msg,
  ...(meta && { meta }),
});

export function errorHandler(error: AppError, req: any, res: Response, _next: any) {
  try {
    if (error.validations) {
      return res.status(422).json({
        status: false,
        message: 'All fields are required',
        data: error.validations,
      });
    }

    let code = error.code || 500;
    let msg = error.message;

    console.log(error.name || 'Error', error.message);

    captureException(error);
    req.transaction.finish();
    return res.status(code || 500).json({ status: false, message: msg });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: false });
  }
}
