import { eq } from "drizzle-orm";
import db from "../database";
import { comment } from "../schemas/post-schema";

export class CommentModel {
    static async addComment(data: {
        content: string;
        postId: string;
        ownerId: string;
        parentId?: string;
    }) {
        const [newComment] = await db.insert(comment).values({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();
        return newComment;
    }

    static async getCommentById(id: string) {
        const [result] = await db.select().from(comment).where(eq(comment.id, id));
        return result;
    }

    static async getPostComments(postId: string) {
        return await db.select()
            .from(comment)
            .where(eq(comment.postId, postId));
    }

    static async deleteComment(id: string) {
        await db.delete(comment).where(eq(comment.id, id));
    }

    static async updateComment(id: string, data: {
        content?: string;
    }) {
        const [updatedComment] = await db.update(comment)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(comment.id, id))
            .returning();
        return updatedComment;
    }
}