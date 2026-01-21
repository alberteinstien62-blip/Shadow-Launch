import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError, ErrorCode } from '../types';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = {
        ...req.body,
        ...req.query,
        ...req.params,
      };

      const validated = schema.parse(data);

      // Replace request data with validated data
      req.body = { ...req.body, ...validated };
      req.query = { ...req.query, ...validated };
      req.params = { ...req.params, ...validated };

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        next(new ApiError(
          400,
          ErrorCode.VALIDATION_ERROR,
          'Validation failed',
          { errors }
        ));
      } else {
        next(error);
      }
    }
  };
};
