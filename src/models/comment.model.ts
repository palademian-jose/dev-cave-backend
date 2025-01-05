import { and, eq, isNull } from "drizzle-orm";
import db from "../database";
import { comment } from "../schemas/post-schema";
import { user } from "../schemas/auth-schema";

export class CommentModel {
    static async getPostComments(postId: string) {
        // Get parent comments (comments without parentId)
        const parentComments = await db
            .select({
                comment,
                owner: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image
                }
            })
            .from(comment)
            .leftJoin(user, eq(comment.ownerId, user.id))
            .where(
                and(
                    eq(comment.postId, postId),
                    isNull(comment.parentId)
                )
            )
            .orderBy(comment.createdAt);

        // Get child comments for each parent
        const commentsWithReplies = await Promise.all(
            parentComments.map(async (parent) => {
                const replies = await db
                    .select({
                        comment,
                        owner: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            image: user.image
                        }
                    })
                    .from(comment)
                    .leftJoin(user, eq(comment.ownerId, user.id))
                    .where(eq(comment.parentId, parent.comment.id))
                    .orderBy(comment.createdAt);

                return {
                    ...parent,
                    replies
                };
            })
        );

        return commentsWithReplies;
    }

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

    static async updateComment(id: string, content: string) {
        const [updatedComment] = await db.update(comment)
            .set({
                content,
                updatedAt: new Date(),
            })
            .where(eq(comment.id, id))
            .returning();
        return updatedComment;
    }

    static async deleteComment(id: string) {
        // First delete all child comments
        await db.delete(comment)
            .where(eq(comment.parentId, id));
            
        // Then delete the parent comment
        await db.delete(comment)
            .where(eq(comment.id, id));
    }

    static async getCommentById(id: string) {
        const [result] = await db
            .select({
                comment,
                owner: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image
                }
            })
            .from(comment)
            .leftJoin(user, eq(comment.ownerId, user.id))
            .where(eq(comment.id, id));
        return result;
    }
}