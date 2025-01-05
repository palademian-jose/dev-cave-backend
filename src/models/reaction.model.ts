import { and, eq } from "drizzle-orm";
import db from "../database";
import { reaction } from "../schemas/post-schema";

export class ReactionModel {
    static async getPostReactions(postId: string) {
        return await db.select()
            .from(reaction)
            .where(eq(reaction.postId, postId));
    }

    static async addReaction(data: {
        type: string;
        postId: string;
        userId: string;
    }) {
        // Delete existing reaction if any
        await db.delete(reaction)
            .where(
                and(
                    eq(reaction.postId, data.postId),
                    eq(reaction.userId, data.userId)
                )
            );

        // Add new reaction
        const [newReaction] = await db.insert(reaction).values({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();
        return newReaction;
    }

    static async deleteReactionByPostAndUser(postId: string, userId: string) {
        await db.delete(reaction)
            .where(
                and(
                    eq(reaction.postId, postId),
                    eq(reaction.userId, userId)
                )
            );
        return { success: true };
    }

    static async getUserReactionToPost(postId: string, userId: string) {
        const [result] = await db.select()
            .from(reaction)
            .where(
                and(
                    eq(reaction.postId, postId),
                    eq(reaction.userId, userId)
                )
            );
        return result;
    }
}