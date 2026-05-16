import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { NotFoundError } from "../../lib/errors";

export namespace ModulesService {
  const moduleInclude = {
    nodes: { orderBy: { id: "asc" as const } },
    edges: { orderBy: { id: "asc" as const } },
    questions: { orderBy: { id: "asc" as const } },
  } satisfies Prisma.ModuleInclude;

  export async function list(query: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 12));
    const skip = (page - 1) * limit;

    const where: Prisma.ModuleWhereInput = {};

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [modules, total] = await Promise.all([
      prisma.module.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          nodes: { orderBy: { id: "asc" } },
          edges: { orderBy: { id: "asc" } },
          _count: { select: { questions: true } },
        },
      }),
      prisma.module.count({ where }),
    ]);

    return {
      data: modules,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  export async function getBySlug(slug: string) {
    const module = await prisma.module.findUnique({
      where: { slug },
      include: moduleInclude,
    });

    if (!module) throw new NotFoundError("Module");
    return module;
  }

  export async function getCategories() {
    const categories = await prisma.module.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });
    return categories.map((c) => c.category);
  }

  export async function getRecommended(slug: string, limit: number = 3) {
    const mod = await prisma.module.findUnique({ where: { slug } });
    if (!mod) throw new NotFoundError("Module");

    const recommendations = await prisma.module.findMany({
      where: {
        category: mod.category,
        slug: { not: slug },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { questions: true } },
      },
    });

    return recommendations;
  }
}
