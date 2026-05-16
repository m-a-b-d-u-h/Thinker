import { Router } from "express";
import { PaymentsController } from "./payments.controller";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createCheckoutSchema } from "./payments.schema";

const router = Router();

router.post("/webhook", PaymentsController.handleWebhook);

router.use(authenticate);

router.post("/create-checkout-session", validate(createCheckoutSchema), PaymentsController.createCheckoutSession);
router.get("/subscription", PaymentsController.getSubscription);
router.get("/history", PaymentsController.getHistory);

export default router;
