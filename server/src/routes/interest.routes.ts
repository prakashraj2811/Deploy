import { Router } from "express";
import { z } from "zod";
import * as interestController from "../controllers/interest.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();
router.use(requireAuth);

router.post("/", validate({ body: z.object({ receiverId: z.string().uuid() }) }), interestController.send);
router.post("/:id/accept", interestController.accept);
router.post("/:id/decline", interestController.decline);
router.post("/:id/withdraw", interestController.withdraw);
router.get("/sent", interestController.sent);
router.get("/received", interestController.received);

export default router;
