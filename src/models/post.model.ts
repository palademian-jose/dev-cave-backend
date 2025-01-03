import db from "../database";
import { post, comment, reaction } from "../schemas/post-schema";
import { eq } from "drizzle-orm";

export class PostModel {
    static async createPost(data: {
        title: string;
        content: string;
        image?: string;
        ownerId: string;
    }) {
        const [newPost] = await db.insert(post).values({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();
        return newPost;
    }

    static async getPostById(id: string) {
        const [result] = await db.select().from(post).where(eq(post.id, id));
        return result;
    }

    static async getAllPosts() {
        return await db.select().from(post);
    }

    static async updatePost(id: string, data: {
        title?: string;
        content?: string;
        image?: string;
    }) {
        const [updatedPost] = await db.update(post)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(post.id, id))
            .returning();
        return updatedPost;
    }

    static async deletePost(id: string) {
        await db.delete(post).where(eq(post.id, id));
    }
}
