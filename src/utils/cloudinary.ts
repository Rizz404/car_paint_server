// utils/cloudinary.ts
import cloudinary from "@/configs/cloudinary";
import logger from "@/utils/logger";

export const isCloudinaryUrl = (url: string): boolean => {
  return url.includes("res.cloudinary.com");
};

export const getCloudinaryPublicId = (url: string): string | null => {
  try {
    if (!isCloudinaryUrl(url)) return null;

    // Extract public_id from URL
    // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
    const urlParts = url.split("/");
    const fileNameWithExtension = urlParts[urlParts.length - 1];
    const fileName = fileNameWithExtension.split(".")[0];
    const folder = urlParts[urlParts.length - 2];

    return `${folder}/${fileName}`;
  } catch (error) {
    logger.error("Error extracting Cloudinary public ID:", error);
    return null;
  }
};

export const deleteCloudinaryImage = async (url: string): Promise<boolean> => {
  try {
    const publicId = getCloudinaryPublicId(url);
    if (!publicId) return false;

    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    logger.error("Error deleting image from Cloudinary:", error);
    return false;
  }
};

export const deleteCloudinaryImages = async (urls: string[]): Promise<void> => {
  try {
    const deletePromises = urls
      .filter((url) => isCloudinaryUrl(url))
      .map((url) => deleteCloudinaryImage(url));

    await Promise.allSettled(deletePromises);
  } catch (error) {
    logger.error("Error deleting multiple images from Cloudinary:", error);
  }
};
