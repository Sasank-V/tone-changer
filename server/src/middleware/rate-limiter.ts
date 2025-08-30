import rateLimit from "express-rate-limit";

export const toneLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per minute
  message: "Too many requests, please try again later.",
});
