import { isPluginAvailable } from "./capacitor";

/**
 * Capture a photo using the native camera (Capacitor).
 * Returns base64 string or null if native camera is not available.
 */
export async function capturePhotoNative(): Promise<{
  base64: string;
  mediaType: string;
} | null> {
  if (!isPluginAvailable("Camera")) return null;

  try {
    const { Camera, CameraResultType, CameraSource } = await import(
      "@capacitor/camera"
    );
    const photo = await Camera.getPhoto({
      quality: 85,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      correctOrientation: true,
    });

    if (photo.base64String) {
      return {
        base64: photo.base64String,
        mediaType: `image/${photo.format}`,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Pick a photo from the native gallery (Capacitor).
 * Returns base64 string or null if native gallery is not available.
 */
export async function pickPhotoNative(): Promise<{
  base64: string;
  mediaType: string;
} | null> {
  if (!isPluginAvailable("Camera")) return null;

  try {
    const { Camera, CameraResultType, CameraSource } = await import(
      "@capacitor/camera"
    );
    const photo = await Camera.getPhoto({
      quality: 85,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
      correctOrientation: true,
    });

    if (photo.base64String) {
      return {
        base64: photo.base64String,
        mediaType: `image/${photo.format}`,
      };
    }
    return null;
  } catch {
    return null;
  }
}
