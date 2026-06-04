import { Router } from "express";
import { BufferController } from "./buffer.controller";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createPostSchema, broadcastSchema } from "./buffer.schema";

const router = Router();

router.use(authenticate);

router.get("/organizations", BufferController.getOrganizations);
router.get("/channels", BufferController.getChannels);
router.get("/posts", BufferController.getPosts);
router.post("/posts", validate(createPostSchema), BufferController.createPost);
router.post("/broadcast", validate(broadcastSchema), BufferController.broadcast);

export default router;
