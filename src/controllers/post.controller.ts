import { Elysia, t } from "elysia";
import { PostModel } from "../models/post.model";
import { userMiddleware } from "../middlewares/auth-middleware";
import { User } from "better-auth/types";

export const postController = new Elysia({ prefix: "/api/posts" })
    .derive(userMiddleware)
    .post("/", 
        async ({ body, user }: {body: any, user: User}) => {
            const post = await PostModel.createPost({
                ...body,
                ownerId: user.id
            });
            return post;
        }, 
        {
            detail: {
                summary: "Create a post",
                tags: ["post"]
            },
            body: t.Object({
                title: t.String(),
                content: t.String(),
                image: t.Optional(t.String())
            })
        }
    )
    .get("/", async () => {
        return await PostModel.getAllPosts();
    }, {
        detail: {
            summary: "Get all posts",
            tags: ["post"]
        }
    })
    .get("/:id", 
        async ({ params: { id } }) => {
            const post = await PostModel.getPostById(id);
            if (!post) throw new Error("Post not found");
            return post;
        },
        {
            detail: {
                summary: "Get a post",
                tags: ["post"]
            },
            params: t.Object({
                id: t.String()
            })
        }
    )
    .put("/:id",
        async ({ params: { id }, body, user }: {params: {id: string}, body: any, user: User}) => {
            const existingPost = await PostModel.getPostById(id);
            if (!existingPost) throw new Error("Post not found");
            if (existingPost.ownerId !== user.id) throw new Error("Not authorized");

            return await PostModel.updatePost(id, body);
        },
        {
            detail: {
                summary: "Update a post",
                tags: ["post"]
            },
            params: t.Object({
                id: t.String()
            }),
            body: t.Object({
                title: t.Optional(t.String()),
                content: t.Optional(t.String()),
                image: t.Optional(t.String())
            })
        }
    )
    .delete("/:id",
        async ({ params: { id }, user }: {params: {id: string}, user: User}) => {
            const existingPost = await PostModel.getPostById(id);
            if (!existingPost) throw new Error("Post not found");
            if (existingPost.ownerId !== user.id) throw new Error("Not authorized");

            await PostModel.deletePost(id);
            return { success: true };
        },
        {
            detail: {
                summary: "Delete a post",
                tags: ["post"]
            },
            params: t.Object({
                id: t.String()
            })
        }
    )