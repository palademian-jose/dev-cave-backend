import db from "../database";
import { user } from "../schemas/auth-schema";
import { post, comment, reaction } from "../schemas/post-schema";
import { eq, sql } from "drizzle-orm";

export class ProfileModel {
    static async getProfileWithPosts(userId: string) {
        const [profile] = await db
            .select({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    emailVerified: user.emailVerified,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                },
                stats: {
                    postCount: sql<number>`cast(count(distinct ${post.id}) as int)`,
                    commentCount: sql<number>`cast(count(distinct ${comment.id}) as int)`,
                    reactionCount: sql<number>`cast(count(distinct ${reaction.id}) as int)`
                }
            })
            .from(user)
            .leftJoin(post, eq(user.id, post.ownerId))
            .leftJoin(comment, eq(user.id, comment.ownerId))
            .leftJoin(reaction, eq(user.id, reaction.userId))
            .where(eq(user.id, userId))
            .groupBy(
                user.id,
                user.name,
                user.email,
                user.image,
                user.emailVerified,
                user.createdAt,
                user.updatedAt
            );

        if (!profile) return null;

        // Get user's posts with their comment and reaction counts
        const posts = await db
            .select({
                post: post,
                commentCount: sql<number>`cast(count(distinct ${comment.id}) as int)`,
                reactionCount: sql<number>`cast(count(distinct ${reaction.id}) as int)`
            })
            .from(post)
            .leftJoin(comment, eq(post.id, comment.postId))
            .leftJoin(reaction, eq(post.id, reaction.postId))
            .where(eq(post.ownerId, userId))
            .groupBy(
                post.id,
                post.title,
                post.content,
                post.image,
                post.createdAt,
                post.updatedAt,
                post.ownerId
            )
            .orderBy(sql`${post.createdAt} DESC`);

        return {
            ...profile,
            posts
        };
    }
}
