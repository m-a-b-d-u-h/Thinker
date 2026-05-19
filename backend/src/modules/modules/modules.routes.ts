import { Router } from "express";
import { ModulesController } from "./modules.controller";
import { optionalAuth } from "../../middleware/auth";

const router = Router();

router.get("/", optionalAuth, ModulesController.list);
router.get("/categories", ModulesController.getCategories);
router.get("/:slug", optionalAuth, ModulesController.getBySlug);
router.get("/:slug/recommended", ModulesController.getRecommended);

export default router;
