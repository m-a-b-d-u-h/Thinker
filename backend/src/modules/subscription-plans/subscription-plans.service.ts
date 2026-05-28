import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/errors";
import type { CreatePlanInput, UpdatePlanInput } from "./subscription-plans.schema";

export namespace SubscriptionPlansService {
  export async function list() {
    return prisma.subscriptionPlan.findMany({ orderBy: { sortOrder: "asc" } });
  }

  export async function getById(id: string) {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) throw new AppError("Plan not found", 404);
    return plan;
  }

  export async function create(input: CreatePlanInput) {
    const existing = await prisma.subscriptionPlan.findUnique({ where: { slug: input.slug } });
    if (existing) throw new AppError("A plan with this slug already exists", 400);
    return prisma.subscriptionPlan.create({ data: input });
  }

  export async function update(id: string, input: UpdatePlanInput) {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) throw new AppError("Plan not found", 404);
    if (input.slug && input.slug !== plan.slug) {
      const slugExists = await prisma.subscriptionPlan.findUnique({ where: { slug: input.slug } });
      if (slugExists) throw new AppError("A plan with this slug already exists", 400);
    }
    return prisma.subscriptionPlan.update({ where: { id }, data: input });
  }

  export async function remove(id: string) {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) throw new AppError("Plan not found", 404);
    await prisma.subscriptionPlan.delete({ where: { id } });
    return { success: true };
  }
}
