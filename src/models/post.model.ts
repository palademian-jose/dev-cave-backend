import db from "../database";
import { post, comment, reaction } from "../schemas/post-schema";
import { user } from "../schemas/auth-schema";
import { eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

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

    static async getPostById(id: string, userId?: string) {
        const [result] = await db
            .select({
                post: post,
                owner: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image
                },
                comments: sql<any[]>`
                    json_agg(
                        json_build_object(
                            'id', ${comment.id},
                            'content', ${comment.content},
                            'createdAt', ${comment.createdAt},
                            'user', json_build_object(
                                'id', comment_user.id,
                                'name', comment_user.name,
                                'image', comment_user.image
                            )
                        )
                    ) FILTER (WHERE ${comment.id} IS NOT NULL)
                `,
                commentCount: sql<number>`cast(count(distinct ${comment.id}) as int)`,
                reactionCount: sql<number>`cast(count(distinct ${reaction.id}) as int)`,
                userReaction: sql<string | null>`
                    (SELECT type FROM ${reaction} 
                     WHERE ${reaction.postId} = ${post.id} 
                     AND ${reaction.userId} = ${userId ? sql`${userId}` : sql`NULL`}
                     LIMIT 1)
                `
            })
            .from(post)
            .leftJoin(user, eq(post.ownerId, user.id))
            .leftJoin(comment, eq(post.id, comment.postId))
            .leftJoin(alias(user, 'comment_user'), eq(comment.ownerId, sql`comment_user.id`))
            .leftJoin(reaction, eq(post.id, reaction.postId))
            .where(eq(post.id, id))
            .groupBy(post.id, user.id, user.name, user.email, user.image);
        
        if (result) {
            result.comments = result.comments || [];
        }
        return result;
    }

    static async getAllPosts(userId?: string) {
        const posts = await db
            .select({
                post: post,
                owner: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image
                },
                comments: sql<any[]>`
                    json_agg(
                        json_build_object(
                            'id', ${comment.id},
                            'content', ${comment.content},
                            'createdAt', ${comment.createdAt},
                            'user', json_build_object(
                                'id', comment_user.id,
                                'name', comment_user.name,
                                'image', comment_user.image
                            )
                        )
                    ) FILTER (WHERE ${comment.id} IS NOT NULL)
                `,
                commentCount: sql<number>`cast(count(distinct ${comment.id}) as int)`,
                reactionCount: sql<number>`cast(count(distinct ${reaction.id}) as int)`,
                userReaction: sql<string | null>`
                    (SELECT type FROM ${reaction} 
                     WHERE ${reaction.postId} = ${post.id} 
                     AND ${reaction.userId} = ${userId ? sql`${userId}` : sql`NULL`}
                     LIMIT 1)
                `
            })
            .from(post)
            .leftJoin(user, eq(post.ownerId, user.id))
            .leftJoin(comment, eq(post.id, comment.postId))
            .leftJoin(alias(user, 'comment_user'), eq(comment.ownerId, sql`comment_user.id`))
            .leftJoin(reaction, eq(post.id, reaction.postId))
            .groupBy(post.id, user.id, user.name, user.email, user.image)
            .orderBy(sql`${post.createdAt} DESC`);

        return posts.map(post => ({
            ...post,
            comments: post.comments || []
        }));
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
