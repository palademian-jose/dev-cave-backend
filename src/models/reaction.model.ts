import { eq } from "drizzle-orm";
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
        const [newReaction] = await db.insert(reaction).values({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();
        return newReaction;
    }

    static async deleteReaction(id: string) {
        await db.delete(reaction).where(eq(reaction.id, id));
    }

    static async getReactionById(id: string) {
        const [result] = await db.select().from(reaction).where(eq(reaction.id, id));
        return result;
    }
}