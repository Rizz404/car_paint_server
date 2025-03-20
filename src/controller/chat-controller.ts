import { RequestHandler } from "express";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/types/api-response";
import prisma from "@/configs/database";

export const getOrCreateChatRoom: RequestHandler = async (req, res) => {
  try {
    const { id: userId } = req.user!;
    const { workshopUserId } = req.params;

    // Validasi workshop user
    const workshopUser = await prisma.user.findUnique({
      where: { id: workshopUserId },
      include: { workshops: true },
    });

    if (!workshopUser?.workshops.length) {
      throw new Error("Invalid workshop user");
    }

    // Cari chat room yang ada
    let chatRoom = await prisma.chatRoom.findFirst({
      where: {
        OR: [
          { userId, workshopUserId },
          { userId: workshopUserId, workshopUserId: userId },
        ],
      },
      include: {
        messages: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Jika belum ada, buat baru
    if (!chatRoom) {
      const newChatRoom = await prisma.chatRoom.create({
        data: {
          userId: userId,
          workshopUserId: workshopUserId,
        },
      });

      // Explicitly assign an empty messages array
      chatRoom = {
        ...newChatRoom,
        messages: [],
      };
    }

    return createSuccessResponse(res, chatRoom);
  } catch (error) {
    return createErrorResponse(res, error);
  }
};

export const getUserChatRooms: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;

    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        OR: [{ userId }, { workshopUserId: userId }],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        workshopUser: {
          select: {
            id: true,
            username: true,
            profileImage: true,
            workshops: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    return createSuccessResponse(res, chatRooms);
  } catch (error) {
    return createErrorResponse(res, error);
  }
};
