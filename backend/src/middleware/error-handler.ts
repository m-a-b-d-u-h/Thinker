import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../lib/errors";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: "Validation error",
        statusCode: 400,
        details: err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      },
    });
    return;
  }

  const stripeErr = err as any;
  if (stripeErr.statusCode && stripeErr.type?.startsWith?.("stripe_")) {
    console.error("Stripe error:", stripeErr.message);
    res.status(stripeErr.statusCode).json({
      error: {
        message: stripeErr.message,
        statusCode: stripeErr.statusCode,
      },
    });
    return;
  }

  console.error("Unhandled error:", err);

  res.status(500).json({
    error: {
      message: "Internal server error",
      statusCode: 500,
    },
  });
}
