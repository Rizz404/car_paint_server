import prisma from "@/configs/database";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/types/api-response";
import {
  calculateDistanceInKilometers,
  formatDistanceKmToM,
} from "@/utils/location";
import { UserProfile } from "@prisma/client";
import { RequestHandler } from "express";
export const getCompare: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    // Ambil profil user saat ini
    const currentUser = await prisma.userProfile.findUnique({
      where: { userId: id },
      select: { latitude: true, longitude: true },
    });

    // Validasi koordinat user
    if (!currentUser?.latitude || !currentUser?.longitude) {
      return createErrorResponse(res, "Koordinat user tidak lengkap", 400);
    }

    // Ambil semua workshop
    const workshops = await prisma.workshop.findMany({
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        brand: {
          select: {
            name: true,
          },
        },
      },
    });

    // Hitung jarak untuk setiap workshop
    const workshopDistances = await Promise.all(
      workshops.map(async (workshop) => {
        const distance = await calculateDistanceInKilometers(
          {
            latitude: currentUser.latitude!,
            longitude: currentUser.longitude!,
          },
          {
            latitude: workshop.latitude,
            longitude: workshop.longitude,
          }
        );

        // Format jarak menggunakan fungsi baru
        const distanceFormatted = formatDistanceKmToM(distance);

        return {
          ...workshop,
          distance: distanceFormatted,
          // Tambahkan raw distance untuk sorting
          rawDistance: parseFloat(distance || "0"),
        };
      })
    );

    // Urutkan workshop berdasarkan jarak terdekat
    const sortedWorkshops = workshopDistances.sort(
      (a, b) => a.rawDistance - b.rawDistance
    );

    // Kirim response dengan workshop terurut berdasarkan jarak
    createSuccessResponse(res, {
      totalWorkshops: sortedWorkshops.length,
      workshops: sortedWorkshops.map(
        ({ rawDistance, ...workshop }) => workshop
      ),
    });
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// ======================= POST =======================
export const getProfileById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: id },
    });
    if (!userProfile) {
      return createErrorResponse(res, "Profile not found", 404);
    }
    createSuccessResponse(res, userProfile);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// ======================= PATCH =======================
export const updateProfile: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const payload: UserProfile = req.body;
    const profile = await prisma.userProfile.findUnique({
      where: {
        userId: id,
      },
    });

    if (!profile) {
      createErrorResponse(res, "Profile Not Found", 500);
    }
    const updatedProfile = await prisma.userProfile.update({
      data: payload,
      where: { userId: id },
    });
    createSuccessResponse(res, updatedProfile, "Updated");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};
