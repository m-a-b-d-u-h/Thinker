import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import { registerSchema, loginSchema, googleAuthSchema, updateProfileSchema } from "./auth.schema";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.register);
router.post("/login", validate(loginSchema), AuthController.login);
router.post("/google", validate(googleAuthSchema), AuthController.googleAuth);
router.get("/me", authenticate, AuthController.getMe);
router.put("/profile", authenticate, validate(updateProfileSchema), AuthController.updateProfile);

export default router;
