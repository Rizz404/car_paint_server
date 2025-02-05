import { LocationCoordinates } from "@/types/location";
import prisma from "@/configs/database";

export async function calculateDistanceInKilometers(
  location1: LocationCoordinates,
  location2: LocationCoordinates
): Promise<string | null> {
  // Validasi koordinat
  if (
    !location1.latitude ||
    !location1.longitude ||
    !location2.latitude ||
    !location2.longitude
  ) {
    return null; // Kembalikan 0 jika koordinat tidak lengkap
  }

  try {
    // Konversi ke float karena PostGIS membutuhkan float
    const result = await prisma.$queryRaw<{ distance: number }[]>`
      SELECT 
        ST_Distance(
          ST_MakePoint(${Number(location1.longitude)}::float8, ${Number(location1.latitude)}::float8)::geography,
          ST_MakePoint(${Number(location2.longitude)}::float8, ${Number(location2.latitude)}::float8)::geography
        ) / 1000 as distance
    `;

    // Kembalikan jarak dalam kilometer
    return (result[0]?.distance || 0).toString();
  } catch (error) {
    console.error("Gagal menghitung jarak:", error);
    return null;
  }
}

// Contoh fungsi untuk mendapatkan workshop terdekat
export async function findClosestWorkshop(userLocation: LocationCoordinates) {
  try {
    const closestWorkshop = await prisma.$queryRaw<
      {
        id: string;
        name: string;
        distance: number;
      }[]
    >`
      SELECT 
        id, 
        name, 
        ST_Distance(
          ST_MakePoint(longitude::float8, latitude::float8)::geography,
          ST_MakePoint(${Number(userLocation.longitude)}::float8, ${Number(userLocation.latitude)}::float8)::geography
        ) / 1000 as distance
      FROM "Workshop"
      ORDER BY distance ASC
      LIMIT 1
    `;

    return closestWorkshop[0] || null;
  } catch (error) {
    console.error("Gagal mencari workshop terdekat:", error);
    return null;
  }
}

export function formatDistanceKmToM(distanceStr: string | null): string {
  if (!distanceStr) return "Unknown";

  const distance = parseFloat(distanceStr);

  // Jika kurang dari 1 km, tampilkan dalam meter
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)}m`;
  }

  // Jika 1 km atau lebih, tampilkan dengan 3 desimal
  return `${distance.toFixed(3)}km`;
}
