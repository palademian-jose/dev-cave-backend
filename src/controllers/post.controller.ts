import { Elysia, t } from "elysia";
import { PostModel } from "../models/post.model";
import { userMiddleware } from "../middlewares/auth-middleware";
import { User } from "better-auth/types";
import { deleteS3Object } from "../utils/s3";

export const postController = new Elysia({ prefix: "/api/posts" })
    .derive(userMiddleware)
    .post("/", 
        async ({ body, user, set }: {body: any, user: User, set: any}) => {
            try {
                const post = await PostModel.createPost({
                    ...body,
                    ownerId: user.id
                });
                return post;
            } catch (error) {
                // If post creation fails and there was an image, delete it
                if (body.image) {
                    try {
                        await deleteS3Object(body.image);
                    } catch (deleteError) {
                        console.error("Failed to delete image after post creation failed:", deleteError);
                    }
                }
                set.status = 500;
                throw error;
            }
        }, 
        {
            body: t.Object({
                title: t.String(),
                content: t.String(),
                image: t.Optional(t.String()),
            }),
        }
    )
    .get("/", async ({ user }: {user: User}) => {
        return await PostModel.getAllPosts(user.id);
    })
    .get("/:postId", async ({ params: { id }, user }: {params: {id: string}, user: User}) => {
        const post = await PostModel.getPostById(id, user.id);
        if (!post) throw new Error("Post not found");
        return post;
    })
    .patch("/:postId", 
        async ({ params: { id }, body, user, set }: {params: {id: string}, body: any, user: User, set: any}) => {
            const existingPost = await PostModel.getPostById(id, user.id);
            if (!existingPost) throw new Error("Post not found");
            if (existingPost.owner?.id !== user.id) throw new Error("Not authorized");

            return await PostModel.updatePost(id, body);
        },
        {
            body: t.Object({
                title: t.Optional(t.String()),
                content: t.Optional(t.String()),
                image: t.Optional(t.String()),
            })
        }
    )
    .delete("/:postId", async ({ params: { id }, user, set }: {params: {id: string}, user: User, set: any}) => {
        const existingPost = await PostModel.getPostById(id, user.id);
        if (!existingPost) throw new Error("Post not found");
        if (existingPost.owner?.id !== user.id) throw new Error("Not authorized");

        await PostModel.deletePost(id);
        return { success: true };
    });