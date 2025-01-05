import { Elysia, t } from "elysia";
import { userMiddleware } from "../middlewares/auth-middleware";
import { CommentModel } from "../models/comment.model";
import { User } from "better-auth/types";

export const commentController = new Elysia({ prefix: "/api/comments" }).derive(userMiddleware)
    .post("/:postId/comments", async ({ params: { postId }, body, user }: { params: { postId: string }, body: any, user: any }) => {
        return await CommentModel.addComment({
            ...body, postId, ownerId: user.id
        });
    }, {
        detail: {
            summary: "Add a comment",
            tags: ["comment"]
        },
        params: t.Object({
            postId: t.String()
        }),
        body: t.Object({
            content: t.String(),
            parentId: t.Optional(t.String())
        })
    }).get("/:postId/comments", async ({ params: { postId } }) => {
        return await CommentModel.getPostComments(postId);
    }, {
        detail: {
            summary: "Get comments for a post",
            tags: ["comment"]
        },
        params: t.Object({
            postId: t.String()
        })
    }).put("/:id", async ({ params: { id }, body, user }: { params: { id: string }, body: any, user: User }) => {
        const existingComment = await CommentModel.getCommentById(id);
        if (!existingComment) throw new Error("Comment not found");
        if (existingComment.owner?.id !== user.id) throw new Error("Not authorized");

        return await CommentModel.updateComment(id, body);
    }, {
        detail: {
            summary: "Update a comment",
            tags: ["comment"]
        },
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            content: t.Optional(t.String())
        })
    }).delete("/:id", async ({ params: { id }, user }: { params: { id: string }, user: User }) => {
        const existingComment = await CommentModel.getCommentById(id);
        if (!existingComment) throw new Error("Comment not found");
        if (existingComment.owner?.id !== user.id) throw new Error("Not authorized");

        await CommentModel.deleteComment(id);
        return { success: true };
    }, {
        detail: {
            summary: "Delete a comment",
            tags: ["comment"]
        },
        params: t.Object({
            id: t.String()
        })
    });