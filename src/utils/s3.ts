import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-southeast-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export const deleteS3Object = async (url: string) => {
    try {
        // Extract key from URL
        const urlObj = new URL(url);
        const key = urlObj.pathname.substring(1); // Remove leading slash

        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: key,
        });

        await s3Client.send(command);
    } catch (error) {
        console.error("Error deleting S3 object:", error);
        throw error;
    }
};
