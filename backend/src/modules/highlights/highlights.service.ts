import { prisma } from "../../lib/prisma";
import { NotFoundError, ForbiddenError } from "../../lib/errors";
import type { CreateHighlightInput, UpdateHighlightInput } from "./highlights.schema";

export namespace HighlightsService {
  export async function list(userId: string, moduleSlug?: string) {
    const where: any = { userId };
    if (moduleSlug) {
      const module = await prisma.module.findUnique({ where: { slug: moduleSlug } });
      if (module) where.moduleId = module.id;
    }

    return prisma.highlight.findMany({
      where,
      orderBy: { timestamp: "desc" },
      include: {
        module: { select: { slug: true, title: true, category: true } },
      },
    });
  }

  export async function getById(userId: string, id: string) {
    const highlight = await prisma.highlight.findUnique({ where: { id } });
    if (!highlight) throw new NotFoundError("Highlight");
    if (highlight.userId !== userId) throw new ForbiddenError();
    return highlight;
  }

  export async function create(userId: string, input: CreateHighlightInput) {
    const module = await prisma.module.findUnique({ where: { slug: input.moduleSlug } });
    if (!module) throw new NotFoundError("Module");

    return prisma.highlight.create({
      data: {
        userId,
        moduleId: module.id,
        text: input.text,
        note: input.note || "",
      },
      include: {
        module: { select: { slug: true, title: true, category: true } },
      },
    });
  }

  export async function update(userId: string, id: string, input: UpdateHighlightInput) {
    const highlight = await prisma.highlight.findUnique({ where: { id } });
    if (!highlight) throw new NotFoundError("Highlight");
    if (highlight.userId !== userId) throw new ForbiddenError();

    return prisma.highlight.update({
      where: { id },
      data: input,
      include: {
        module: { select: { slug: true, title: true } },
      },
    });
  }

  export async function remove(userId: string, id: string) {
    const highlight = await prisma.highlight.findUnique({ where: { id } });
    if (!highlight) throw new NotFoundError("Highlight");
    if (highlight.userId !== userId) throw new ForbiddenError();

    await prisma.highlight.delete({ where: { id } });
    return { deleted: true };
  }
}
