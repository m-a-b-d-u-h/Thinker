import { Router } from "express";
import { SubscriptionPlansController } from "./subscription-plans.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.get("/", SubscriptionPlansController.list);
router.get("/:id", SubscriptionPlansController.getById);

router.use(authenticate);

router.post("/", SubscriptionPlansController.create);
router.patch("/:id", SubscriptionPlansController.update);
router.delete("/:id", SubscriptionPlansController.remove);

export default router;
