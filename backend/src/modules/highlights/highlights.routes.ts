import { Router } from "express";
import { HighlightsController } from "./highlights.controller";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createHighlightSchema, updateHighlightSchema } from "./highlights.schema";

const router = Router();

router.use(authenticate);

router.get("/", HighlightsController.list);
router.get("/:id", HighlightsController.getById);
router.post("/", validate(createHighlightSchema), HighlightsController.create);
router.put("/:id", validate(updateHighlightSchema), HighlightsController.update);
router.delete("/:id", HighlightsController.remove);

export default router;
