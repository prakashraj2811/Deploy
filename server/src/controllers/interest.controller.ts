import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { created, ok } from "../utils/apiResponse";
import * as interestService from "../services/interest.service";

export const send = asyncHandler(async (req: Request, res: Response) => {
  const interest = await interestService.sendInterest(req.auth!.userId, req.body.receiverId);
  created(res, interest, "Interest sent");
});

export const accept = asyncHandler(async (req: Request, res: Response) => {
  const interest = await interestService.acceptInterest(req.auth!.userId, req.params.id);
  ok(res, interest, "Interest accepted");
});

export const decline = asyncHandler(async (req: Request, res: Response) => {
  const interest = await interestService.declineInterest(req.auth!.userId, req.params.id);
  ok(res, interest, "Interest declined");
});

export const withdraw = asyncHandler(async (req: Request, res: Response) => {
  const interest = await interestService.withdrawInterest(req.auth!.userId, req.params.id);
  ok(res, interest, "Interest withdrawn");
});

export const sent = asyncHandler(async (req: Request, res: Response) => {
  const interests = await interestService.listSentInterests(req.auth!.userId);
  ok(res, interests);
});

export const received = asyncHandler(async (req: Request, res: Response) => {
  const interests = await interestService.listReceivedInterests(req.auth!.userId);
  ok(res, interests);
});
