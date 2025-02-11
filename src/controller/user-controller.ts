import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import { parsePagination } from "@/utils/query";
import { User, UserProfile } from "@prisma/client";
import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

// *======================= POST =======================*
export const createManyUsers: RequestHandler = async (req, res) => {
  try {
    const payloads: Omit<User, "id" | "createdAt" | "updatedAt">[] = req.body;

    const usersToCreate = await Promise.all(
      payloads.map(async (payload) => {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(payload.password, salt);

        return {
          ...payload,
          password: hashedPassword,
          userProfile: {},
        };
      })
    );

    const createdUsers = await prisma.user.createMany({
      data: usersToCreate,
      skipDuplicates: true,
    });

    return createSuccessResponse(
      res,
      createdUsers,
      "Users Created Successfully",
      201
    );
  } catch (error) {
    logger.error("Error creating multiple users:", error);
    return createErrorResponse(res, "Failed to create users", 500);
  }
};

export const createUser: RequestHandler = async (req, res) => {
  try {
    const payload: User = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: payload.username }, { email: payload.email }],
      },
    });

    if (existingUser) {
      return createErrorResponse(res, "User already exist", 400);
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(payload.password, salt);

    const createdUser = await prisma.user.create({
      data: {
        ...payload,
        profileImage: faker.image.avatar(),
        password: hashedPassword,
        userProfile: {},
      },
    });

    return createSuccessResponse(res, createdUser, "Created", 201);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= GET =======================*
export const getUsers: RequestHandler = async (req, res) => {
  try {
    const { page = "1", limit = "10" } = req.query as unknown as {
      page: string;
      limit: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const users = await prisma.user.findMany({
      skip: offset,
      take: +limit,
      orderBy: { createdAt: "desc" },
    });
    const totalUsers = await prisma.user.count();

    createPaginatedResponse(res, users, currentPage, itemsPerPage, totalUsers);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const getUserById: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return createErrorResponse(res, "User not found", 404);
    }

    return createSuccessResponse(res, user);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const searchUsers: RequestHandler = async (req, res) => {
  try {
    const {
      page = "1",
      limit = "10",
      username,
    } = req.query as unknown as {
      page: string;
      limit: string;
      username: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const users = await prisma.user.findMany({
      where: { username: { contains: username } },
      skip: offset,
      take: +limit,
      orderBy: { createdAt: "desc" },
    });
    const totalUsers = await prisma.user.count({
      where: { username: { contains: username } },
    });

    createPaginatedResponse(res, users, currentPage, itemsPerPage, totalUsers);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= PATCH =======================*
export const updateUser: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const payload: User = req.body;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return createErrorResponse(res, "User Not Found", 500);
    }

    const updatedUser = await prisma.user.update({
      data: payload,
      where: { id: userId },
    });

    return createSuccessResponse(res, updatedUser, "Updated");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= DELETE =======================*
export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return createErrorResponse(res, "User Not Found", 500);
    }

    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });

    return createSuccessResponse(res, deletedUser, "Deleted");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const deleteAllUser: RequestHandler = async (req, res) => {
  try {
    const deletedAllUsers = await prisma.user.deleteMany();

    return createSuccessResponse(
      res,
      deletedAllUsers,
      "All car brands deleted"
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// * CurrentUser
export const getCurrentUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;

    const currentUser = await prisma.user.findUnique({
      where: { id },
      include: { userProfile: true },
      omit: { password: true },
    });

    if (!currentUser) {
      return createErrorResponse(res, "Current user not found", 404);
    }

    return createSuccessResponse(res, currentUser);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const updateCurrentUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const payload: Partial<User> & Partial<UserProfile> = req.body;
    const profileImage = req.file as Express.Multer.File;

    const currentUser = await prisma.user.findUnique({
      where: { id },
      include: { userProfile: true },
      omit: { password: true },
    });

    if (!currentUser) {
      return createErrorResponse(res, "Current user not found", 404);
    }

    const updatedCurrentUser = await prisma.user.update({
      data: {
        username: payload.username,
        email: payload.email,
        ...(profileImage && {
          profileImage: profileImage.cloudinary?.secure_url,
        }),
        userProfile: {
          update: {
            fullname: payload.fullname,
            phoneNumber: payload.phoneNumber,
            address: payload.address,
            longitude: payload.longitude,
            latitude: payload.latitude,
          },
        },
      },
      where: { id },
      include: { userProfile: true },
      omit: { password: true },
    });

    return createSuccessResponse(res, updatedCurrentUser);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const updateCurrentUserPassword: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { currentPassword, newPassword } = req.body;

    const currentUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!currentUser) {
      return createErrorResponse(res, "Current user not found", 404);
    }

    const match = await bcrypt.compare(currentPassword, currentUser.password);

    if (!match) {
      return createErrorResponse(res, "Password not match", 400);
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedCurrentUser = await prisma.user.update({
      data: { password: hashedPassword },
      where: { id },
    });

    return createSuccessResponse(res, updatedCurrentUser);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};
