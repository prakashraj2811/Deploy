import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import profileRoutes from "./profile.routes";
import searchRoutes from "./search.routes";
import matchRoutes from "./match.routes";
import interestRoutes from "./interest.routes";
import shortlistRoutes from "./shortlist.routes";
import subscriptionRoutes from "./subscription.routes";
import reportRoutes from "./report.routes";
import supportRoutes from "./support.routes";
import adminRoutes from "./admin.routes";
import lookupRoutes from "./lookup.routes";
import conversationRoutes from "./conversation.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/profiles", profileRoutes);
router.use("/search", searchRoutes);
router.use("/matches", matchRoutes);
router.use("/interests", interestRoutes);
router.use("/shortlists", shortlistRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/reports", reportRoutes);
router.use("/support", supportRoutes);
router.use("/admin", adminRoutes);
router.use("/lookups", lookupRoutes);
router.use("/conversations", conversationRoutes);

export default router;
