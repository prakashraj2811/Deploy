import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { paymentProvider } from "../integrations/payment";

export async function listPlans() {
  return prisma.subscriptionPlan.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
}

export async function createPlan(data: {
  name: string;
  slug: string;
  tagline?: string;
  priceCents: number;
  currency?: string;
  durationDays: number;
  features?: string[];
  maxInterests?: number;
  maxSearches?: number;
  sortOrder?: number;
}) {
  return prisma.subscriptionPlan.create({ data });
}

export async function updatePlan(id: string, data: Partial<Parameters<typeof createPlan>[0]> & { isActive?: boolean }) {
  return prisma.subscriptionPlan.update({ where: { id }, data });
}

export async function deletePlan(id: string) {
  await prisma.subscriptionPlan.update({ where: { id }, data: { isActive: false } });
  return { deactivated: true };
}

export async function initiateCheckout(userId: string, planId: string) {
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) throw ApiError.notFound("Plan not found", "PLAN_NOT_FOUND");

  const userSubscription = await prisma.userSubscription.create({
    data: { userId, planId, status: "PENDING" },
  });

  const order = await paymentProvider.createOrder({
    amountCents: plan.priceCents,
    currency: plan.currency,
    receipt: userSubscription.id,
  });

  const payment = await prisma.payment.create({
    data: {
      userId,
      userSubscriptionId: userSubscription.id,
      amountCents: order.amountCents,
      currency: order.currency,
      providerOrderId: order.providerOrderId,
      status: "CREATED",
    },
  });

  return { userSubscriptionId: userSubscription.id, paymentId: payment.id, providerOrderId: order.providerOrderId, amountCents: order.amountCents, currency: order.currency };
}

export async function verifyCheckout(userId: string, input: { paymentId: string; providerPaymentId: string; signature: string }) {
  const payment = await prisma.payment.findFirst({ where: { id: input.paymentId, userId }, include: { userSubscription: { include: { plan: true } } } });
  if (!payment || !payment.providerOrderId) throw ApiError.notFound("Payment not found", "PAYMENT_NOT_FOUND");

  // Never trust frontend-reported success — verify signature/status with the provider server-side.
  const verified = await paymentProvider.verifyPayment({
    providerOrderId: payment.providerOrderId,
    providerPaymentId: input.providerPaymentId,
    signature: input.signature,
  });

  if (!verified) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED", providerPaymentId: input.providerPaymentId } });
    throw ApiError.badRequest("Payment verification failed", "PAYMENT_VERIFICATION_FAILED");
  }

  const plan = payment.userSubscription?.plan;
  if (!plan || !payment.userSubscriptionId) throw ApiError.internal("Subscription context missing for payment");

  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: { status: "SUCCESS", providerPaymentId: input.providerPaymentId } }),
    prisma.userSubscription.update({ where: { id: payment.userSubscriptionId }, data: { status: "ACTIVE", startedAt, expiresAt } }),
  ]);

  const invoiceNumber = `INV-${new Date().getFullYear()}-${payment.id.slice(0, 8).toUpperCase()}`;
  await prisma.invoice.create({
    data: {
      paymentId: payment.id,
      invoiceNumber,
      amountCents: payment.amountCents,
      totalCents: payment.amountCents,
    },
  });

  await prisma.notification.create({
    data: { userId, type: "PAYMENT_SUCCESS", title: "Payment successful", body: `Your ${plan.name} subscription is now active.` },
  });

  return { verified: true, expiresAt };
}

export async function myPaymentHistory(userId: string) {
  return prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { invoice: true, userSubscription: { include: { plan: true } } },
  });
}

export async function mySubscription(userId: string) {
  return prisma.userSubscription.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    include: { plan: true },
  });
}
