import { prisma } from "../../lib/prisma";
import { NotFoundError, ConflictError } from "../../lib/errors";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export namespace CategoriesService {
  export async function list(query: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 50));
    const skip = (page - 1) * limit;

    let catCounts = await prisma.module.groupBy({
      by: ["category"],
      _count: { category: true },
      orderBy: { category: "asc" },
    });

    let categories = catCounts
      .filter((c) => c.category && c.category.trim().length > 0)
      .map((c) => ({
        id: slugify(c.category),
        name: c.category,
        slug: slugify(c.category),
        description: null as string | null,
        sortOrder: 0,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        _count: { modules: c._count.category },
      }));

    if (query.search) {
      const q = query.search.toLowerCase();
      categories = categories.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q)
      );
    }

    const total = categories.length;
    const paginated = categories.slice(skip, skip + limit);

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  export async function listAll() {
    const catCounts = await prisma.module.groupBy({
      by: ["category"],
      _count: { category: true },
      orderBy: { category: "asc" },
    });

    return catCounts
      .filter((c) => c.category && c.category.trim().length > 0)
      .map((c) => ({
        id: slugify(c.category),
        name: c.category,
        slug: slugify(c.category),
        description: null as string | null,
        sortOrder: 0,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        _count: { modules: c._count.category },
      }));
  }

  export async function getById(id: string) {
    const catCounts = await prisma.module.groupBy({
      by: ["category"],
      _count: { category: true },
    });

    const matched = catCounts.find((c) => slugify(c.category) === id);

    if (!matched) throw new NotFoundError("Category");

    const modules = await prisma.module.findMany({
      where: { category: matched.category },
      select: { id: true, title: true, slug: true },
      orderBy: { title: "asc" },
    });

    return {
      id: slugify(matched.category),
      name: matched.category,
      slug: slugify(matched.category),
      description: null as string | null,
      sortOrder: 0,
      createdAt: new Date(0),
      updatedAt: new Date(0),
      _count: { modules: matched._count.category },
      modules,
    };
  }

  export async function create(data: {
    name: string;
    slug?: string;
    description?: string;
    sortOrder?: number;
  }) {
    const existing = await prisma.module.findFirst({
      where: { category: data.name },
      select: { id: true },
    });

    if (existing) throw new ConflictError("Category with this name already exists");

    return {
      id: slugify(data.name),
      name: data.name,
      slug: slugify(data.name),
      description: data.description || null,
      sortOrder: data.sortOrder || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { modules: 0 },
    };
  }

  export async function update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      sortOrder?: number;
    }
  ) {
    if (!data.name) {
      return getById(id);
    }

    const catCounts = await prisma.module.groupBy({
      by: ["category"],
      _count: { category: true },
    });

    const oldCategory = catCounts.find((c) => slugify(c.category) === id);

    if (!oldCategory) throw new NotFoundError("Category");

    if (data.name && data.name !== oldCategory.category) {
      const existing = await prisma.module.findFirst({
        where: { category: data.name },
        select: { id: true },
      });

      if (existing) throw new ConflictError("Category with this name already exists");

      await prisma.module.updateMany({
        where: { category: oldCategory.category },
        data: { category: data.name },
      });
    }

    const modules = await prisma.module.findMany({
      where: { category: data.name },
      select: { id: true, title: true, slug: true },
      orderBy: { title: "asc" },
    });

    return {
      id: slugify(data.name),
      name: data.name,
      slug: slugify(data.name),
      description: data.description || null,
      sortOrder: data.sortOrder || 0,
      createdAt: new Date(0),
      updatedAt: new Date(),
      _count: { modules: modules.length },
      modules,
    };
  }

  export async function remove(id: string) {
    const catCounts = await prisma.module.groupBy({
      by: ["category"],
      _count: { category: true },
    });

    const matched = catCounts.find((c) => slugify(c.category) === id);

    if (!matched) throw new NotFoundError("Category");

    await prisma.module.updateMany({
      where: { category: matched.category },
      data: { category: "" },
    });
  }
}
