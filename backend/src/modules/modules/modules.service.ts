import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { NotFoundError } from "../../lib/errors";
import { transformNode, transformEdge } from "../../lib/transform";

export namespace ModulesService {
  const moduleInclude = {
    nodes: { orderBy: { id: "asc" as const } },
    edges: { orderBy: { id: "asc" as const } },
    questions: { orderBy: { id: "asc" as const } },
    _count: { select: { questions: true } },
  } satisfies Prisma.ModuleInclude;

  const listInclude = {
    nodes: { orderBy: { id: "asc" } },
    edges: { orderBy: { id: "asc" } },
    _count: { select: { questions: true } },
  } satisfies Prisma.ModuleInclude;

  /** Deterministic daily free module slug based on current date */
  export async function getDailyFreeSlug(): Promise<string | null> {
    const count = await prisma.module.count();
    if (count === 0) return null;

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const hash = dateStr.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const index = hash % count;

    const module = await prisma.module.findMany({
      take: 1,
      skip: index,
      select: { slug: true },
      orderBy: { createdAt: "asc" },
    });

    return module[0]?.slug || null;
  }

  /** Check if user has an active subscription */
  async function hasActiveSubscription(userId?: string): Promise<boolean> {
    if (!userId) return false;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true, subscriptionEnd: true },
    });
    if (!user || user.subscriptionStatus === "FREE") return false;
    if (user.subscriptionEnd && user.subscriptionEnd < new Date()) return false;
    return true;
  }

  export async function list(query: {
    page?: number;
    limit?: number;
    category?: string;
    categories?: string;
    search?: string;
    userId?: string;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 12));
    const skip = (page - 1) * limit;

    const where: Prisma.ModuleWhereInput = {};

    if (query.categories) {
      const cats = query.categories.split(",").map((c) => c.trim()).filter(Boolean);
      if (cats.length > 0) {
        where.category = { in: cats };
      }
    } else if (query.category) {
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
        include: query.userId
          ? { ...listInclude, favorites: { where: { userId: query.userId } } }
          : listInclude,
      }),
      prisma.module.count({ where }),
    ]);

    const dailyFreeSlug = await getDailyFreeSlug();

    return {
      data: modules.map((m: any) => ({
        id: m.id,
        slug: m.slug,
        title: m.title,
        description: m.description,
        category: m.category,
        isPremium: m.isPremium,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        nodes: m.nodes.map(transformNode),
        edges: m.edges.map(transformEdge),
        _count: m._count,
        isFavorited: query.userId ? m.favorites?.length > 0 : false,
        isDailyFree: m.slug === dailyFreeSlug,
        favorites: undefined,
        content: undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  export async function getDailyFree() {
    const slug = await getDailyFreeSlug();
    if (!slug) throw new NotFoundError("No modules available");

    const module = await prisma.module.findUnique({
      where: { slug },
      include: moduleInclude,
    });

    if (!module) throw new NotFoundError("Module");

    return {
      ...module,
      isPremium: false,
      nodes: module.nodes.map(transformNode),
      edges: module.edges.map(transformEdge),
    };
  }

  export async function getBySlug(slug: string, userId?: string) {
    const dailyFreeSlug = await getDailyFreeSlug();
    const isDailyFree = dailyFreeSlug === slug;

    const module = await prisma.module.findUnique({
      where: { slug },
      include: {
        nodes: { orderBy: { id: "asc" } },
        edges: { orderBy: { id: "asc" } },
        _count: { select: { questions: true } },
      },
    });

    if (!module) throw new NotFoundError("Module");

    const isSubscribed = await hasActiveSubscription(userId);

    // Free access for daily free module OR subscribed users
    if (isDailyFree || isSubscribed) {
      const fullModule = await prisma.module.findUnique({
        where: { slug },
        include: moduleInclude,
      });
      if (!fullModule) throw new NotFoundError("Module");

      return {
        ...fullModule,
        isPremium: module.isPremium,
        nodes: fullModule.nodes.map(transformNode),
        edges: fullModule.edges.map(transformEdge),
      };
    }

    // Locked — return metadata only
    return {
      id: module.id,
      slug: module.slug,
      title: module.title,
      description: module.description,
      category: module.category,
      isPremium: true,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
      nodes: module.nodes.map(transformNode),
      edges: module.edges.map(transformEdge),
      _count: { questions: module._count?.questions || 0 },
      locked: true,
      content: undefined,
      questions: undefined,
    };
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

  export async function checkAccess(slug: string, userId?: string) {
    const dailyFreeSlug = await getDailyFreeSlug();
    if (dailyFreeSlug === slug) return { accessible: true, isDailyFree: true };

    const isSubscribed = await hasActiveSubscription(userId);
    return { accessible: isSubscribed, isDailyFree: false };
  }
}
