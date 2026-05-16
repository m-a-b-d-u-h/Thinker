import { prisma } from "../../lib/prisma";
import { NotFoundError } from "../../lib/errors";
import type { UpdateProgressInput } from "./progress.schema";

export namespace ProgressService {
  export async function getAll(userId: string) {
    const progress = await prisma.userProgress.findMany({
      where: { userId },
      orderBy: { lastReadAt: "desc" },
      include: {
        module: {
          select: { slug: true, title: true, category: true, content: true },
        },
      },
    });

    return progress.map((p) => ({
      slug: p.module.slug,
      title: p.module.title,
      category: p.module.category,
      listeningProgress: p.listeningProgress,
      readingProgress: p.readingProgress,
      currentCharIndex: p.currentCharIndex,
      audioRate: p.audioRate,
      completed: p.completed,
      lastReadAt: p.lastReadAt.getTime(),
    }));
  }

  export async function getBySlug(userId: string, slug: string) {
    const module = await prisma.module.findUnique({ where: { slug } });
    if (!module) throw new NotFoundError("Module");

    const progress = await prisma.userProgress.findUnique({
      where: { userId_moduleId: { userId, moduleId: module.id } },
    });

    if (!progress) return null;

    return {
      listeningProgress: progress.listeningProgress,
      readingProgress: progress.readingProgress,
      scrollPosition: progress.scrollPosition,
      currentCharIndex: progress.currentCharIndex,
      audioRate: progress.audioRate,
      completed: progress.completed,
      lastReadAt: progress.lastReadAt.getTime(),
    };
  }

  export async function upsert(userId: string, slug: string, input: UpdateProgressInput) {
    const module = await prisma.module.findUnique({ where: { slug } });
    if (!module) throw new NotFoundError("Module");

    const progress = await prisma.userProgress.upsert({
      where: { userId_moduleId: { userId, moduleId: module.id } },
      create: {
        userId,
        moduleId: module.id,
        ...input,
        lastReadAt: new Date(),
      },
      update: {
        ...input,
        lastReadAt: new Date(),
      },
    });

    return progress;
  }

  export async function getContinueLearning(userId: string) {
    const progress = await prisma.userProgress.findMany({
      where: {
        userId,
        OR: [{ listeningProgress: { gt: 0 } }, { readingProgress: { gt: 0 } }],
      },
      orderBy: { lastReadAt: "desc" },
      take: 10,
      include: {
        module: {
          select: { slug: true, title: true, category: true, content: true },
        },
      },
    });

    return progress.map((p) => ({
      slug: p.module.slug,
      title: p.module.title,
      category: p.module.category,
      listeningProgress: p.listeningProgress,
      readingProgress: p.readingProgress,
      completed: p.completed,
      lastReadAt: p.lastReadAt.getTime(),
    }));
  }

  export async function getStats(userId: string) {
    const progress = await prisma.userProgress.findMany({
      where: { userId },
      include: {
        module: { select: { content: true } },
      },
    });

    let totalListenSeconds = 0;
    let totalReadSeconds = 0;
    let completedCount = 0;
    let inProgressCount = 0;

    progress.forEach((p) => {
      const words = p.module.content.split(/\s+/).length;
      const listenSeconds = Math.ceil(words / 2.5);
      const readSeconds = Math.ceil(words / 4);

      totalListenSeconds += Math.round((p.listeningProgress / 100) * listenSeconds);
      totalReadSeconds += Math.round((p.readingProgress / 100) * readSeconds);

      if (p.completed) completedCount++;
      else if (p.listeningProgress > 0 || p.readingProgress > 0) inProgressCount++;
    });

    const completedModules = await prisma.userProgress.findMany({
      where: { userId, completed: true },
      include: { module: { select: { category: true } } },
    });

    const categoryBreakdown: Record<string, number> = {};
    completedModules.forEach((p) => {
      categoryBreakdown[p.module.category] = (categoryBreakdown[p.module.category] || 0) + 1;
    });

    return {
      totalListenMinutes: Math.round(totalListenSeconds / 60),
      totalReadMinutes: Math.round(totalReadSeconds / 60),
      completedCount,
      inProgressCount,
      historyCount: progress.length,
      categoryBreakdown,
    };
  }

  export async function addCompletedNode(userId: string, slug: string, nodeId: string) {
    const module = await prisma.module.findUnique({ where: { slug } });
    if (!module) throw new NotFoundError("Module");

    const existing = await prisma.completedGraphNode.findUnique({
      where: { userId_moduleId_nodeId: { userId, moduleId: module.id, nodeId } },
    });

    if (existing) return existing;

    return prisma.completedGraphNode.create({
      data: { userId, moduleId: module.id, nodeId },
    });
  }

  export async function getCompletedNodes(userId: string, slug: string) {
    const module = await prisma.module.findUnique({ where: { slug } });
    if (!module) throw new NotFoundError("Module");

    const nodes = await prisma.completedGraphNode.findMany({
      where: { userId, moduleId: module.id },
    });

    return nodes.map((n) => n.nodeId);
  }
}
