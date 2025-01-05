import { Elysia, t } from "elysia";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../utils/s3";
import { randomUUID } from "crypto";
import { userMiddleware } from "../middlewares/auth-middleware";
import { User } from "better-auth/types";

export const uploadController = new Elysia({ prefix: "/api/upload" })
    .derive(userMiddleware)
    .post("/",
        async ({ body, user, set }: { body: { file: File }, user: User, set: any }) => {
            try {
                const { file } = body;
                console.log(file)
                if (!file) {
                    set.status = 400;
                    return { error: "No file provided" };
                }

                const buffer = await file.arrayBuffer();
                const key = `uploads/${randomUUID()}-${file.name}-${user.id}`;

                const command = new PutObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: key,
                    Body: Buffer.from(buffer),
                    ContentType: file.type,
                });

                await s3Client.send(command);

                const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
                
                return {
                    url: imageUrl
                };
            } catch (error) {
                console.error("Upload error:", error);
                set.status = 500;
                return { error: "Failed to upload file" };
            }
        },
        {
            body: t.Object({
                file: t.File()
            })
        }
    );
