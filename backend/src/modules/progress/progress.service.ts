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
      id: p.id,
      userId: p.userId,
      moduleId: p.moduleId,
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
          select: { id: true, slug: true, title: true, category: true, description: true, content: true, isPremium: true, createdAt: true, updatedAt: true },
        },
      },
    });

    return progress.map((p) => ({
      id: p.module.id,
      slug: p.module.slug,
      title: p.module.title,
      description: p.module.description,
      category: p.module.category,
      content: p.module.content,
      isPremium: p.module.isPremium,
      createdAt: p.module.createdAt.toISOString(),
      updatedAt: p.module.updatedAt.toISOString(),
      listeningProgress: p.listeningProgress,
      readingProgress: p.readingProgress,
      completed: p.completed,
      lastReadAt: p.lastReadAt.getTime(),
    }));
  }

  export async function getStats(userId: string) {
    const [progress, totalModules, completedNodes, reflections, highlights, user] = await Promise.all([
      prisma.userProgress.findMany({
        where: { userId },
        include: {
          module: { select: { content: true } },
        },
      }),
      prisma.module.count(),
      prisma.completedGraphNode.count({ where: { userId } }),
      prisma.reflection.count({ where: { userId } }),
      prisma.highlight.count({ where: { userId } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { streakCount: true },
      }),
    ]);

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

    const overallProgress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

    const listeningMinutes = Math.round(totalListenSeconds / 60);
    const readingMinutes = Math.round(totalReadSeconds / 60);
    const streak = user?.streakCount ?? 0;

    const listenXp = listeningMinutes * 10;
    const readXp = readingMinutes * 10;
    const completedXp = completedCount * 50;
    const reflectionXp = reflections * 150;
    const highlightXp = highlights * 100;
    const streakXp = streak * 5;
    const totalXp = listenXp + readXp + completedXp + reflectionXp + highlightXp + streakXp;

    const ranks = [
      { level: 1, name: "Beginner", xp: 0 },
      { level: 2, name: "Apprentice", xp: 500 },
      { level: 3, name: "Thinker", xp: 1500 },
      { level: 4, name: "Strategist", xp: 3000 },
      { level: 5, name: "Scholar", xp: 5000 },
      { level: 6, name: "Genius", xp: 8000 },
      { level: 7, name: "Sage", xp: 12000 },
      { level: 8, name: "Master", xp: 20000 },
    ];

    let currentRank = ranks[0];
    let nextRank: typeof ranks[0] | null = ranks[1];
    for (let i = ranks.length - 1; i >= 0; i--) {
      if (totalXp >= ranks[i].xp) {
        currentRank = ranks[i];
        nextRank = i < ranks.length - 1 ? ranks[i + 1] : null;
        break;
      }
    }

    return {
      totalModules,
      completedModules: completedCount,
      overallProgress,
      listeningMinutes,
      readingMinutes,
      completedNodes,
      inProgressCount,
      highlights,
      historyCount: progress.length,
      categoryBreakdown,
      // XP
      listenXp,
      readXp,
      completedXp,
      reflectionXp,
      highlightXp,
      streakXp,
      totalXp,
      rank: currentRank.name,
      rankLevel: currentRank.level,
      nextRank: nextRank?.name ?? null,
      nextLevelXp: nextRank?.xp ?? currentRank.xp,
      prevLevelXp: currentRank.xp,
    };
  }

  export async function getStreak(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streakCount: true, lastActiveDate: true },
    });
    if (!user) return { streak: 0, showPopup: false };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = user.lastActiveDate;
    if (!lastActive) {
      await prisma.user.update({
        where: { id: userId },
        data: { streakCount: 1, lastActiveDate: today },
      });
      return { streak: 1, showPopup: false };
    }

    const lastDay = new Date(lastActive);
    lastDay.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastDay.getTime() === today.getTime()) {
      return { streak: user.streakCount, showPopup: false };
    }

    if (lastDay.getTime() === yesterday.getTime()) {
      const newStreak = user.streakCount + 1;
      await prisma.user.update({
        where: { id: userId },
        data: { streakCount: newStreak, lastActiveDate: today },
      });
      return { streak: newStreak, showPopup: false };
    }

    if (user.streakCount >= 3) {
      return { streak: user.streakCount, showPopup: true };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { streakCount: 1, lastActiveDate: today },
    });
    return { streak: 1, showPopup: false };
  }

  export async function resetStreak(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.user.update({
      where: { id: userId },
      data: { streakCount: 0, lastActiveDate: today },
    });
    return { streak: 0 };
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
