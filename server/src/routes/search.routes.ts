import { Router } from "express";
import * as searchController from "../controllers/search.controller";
import { optionalAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { searchQuerySchema } from "../validators/search.validators";

const router = Router();

router.get("/", optionalAuth, validate({ query: searchQuerySchema }), searchController.search);

export default router;
