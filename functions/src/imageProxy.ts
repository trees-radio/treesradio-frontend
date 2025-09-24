import { onRequest } from "firebase-functions/v2/https";
import { getStorage } from "firebase-admin/storage";

export const imageProxy = onRequest(
  { cors: true },
  async (req, res) => {
    try {
      const { path } = req.query;
      
      if (!path || typeof path !== "string") {
        res.status(400).send("Missing path parameter");
        return;
      }

      const bucket = getStorage().bucket();
      const file = bucket.file(path);
      
      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        res.status(404).send("Image not found");
        return;
      }

      // Get file metadata
      const [metadata] = await file.getMetadata();
      
      // Set appropriate headers
      res.set({
        "Content-Type": metadata.contentType,
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      });

      // Stream the file
      const stream = file.createReadStream();
      stream.pipe(res);
      
    } catch (error) {
      console.error("Error proxying image:", error);
      res.status(500).send("Internal server error");
    }
  }
);
