import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";
import * as searchService from "../services/search.service";
import type { SearchQuery } from "../validators/search.validators";

export const search = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as SearchQuery;
  const result = await searchService.searchProfiles(query, req.auth?.userId);
  ok(res, result.items, "Search results", result.pagination);
});
