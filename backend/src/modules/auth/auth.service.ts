import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { signToken } from "../../lib/jwt";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../lib/errors";
import type { RegisterInput, LoginInput, GoogleAuthInput, UpdateProfileInput } from "./auth.schema";

export namespace AuthService {
  export async function register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new ConflictError("Email already registered");

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name || null,
      },
    });

    const token = signToken({ userId: user.id, email: user.email });
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
    };
  }

  export async function login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !user.passwordHash) throw new UnauthorizedError("Invalid email or password");

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Invalid email or password");

    const token = signToken({ userId: user.id, email: user.email });
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
    };
  }

  export async function googleAuth(input: GoogleAuthInput) {
    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId: input.googleId }, { email: input.email }] },
    });

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: input.googleId, avatar: input.avatar || user.avatar },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          email: input.email,
          googleId: input.googleId,
          name: input.name || null,
          avatar: input.avatar || null,
        },
      });
    }

    const token = signToken({ userId: user.id, email: user.email });
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
    };
  }

  export async function getProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User");

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionEnd: user.subscriptionEnd,
      createdAt: user.createdAt,
    };
  }

  export async function updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: input,
    });

    return { id: user.id, email: user.email, name: user.name, avatar: user.avatar };
  }
}
