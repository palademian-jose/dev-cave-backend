import { pgTable, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const post = pgTable("post", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ownerId: text("owner_id").notNull().references(() => user.id)
});

export const comment = pgTable("comment", {
    id: uuid("id").primaryKey().defaultRandom(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    postId: uuid("post_id").notNull().references(() => post.id),
    ownerId: text("owner_id").notNull().references(() => user.id),
    parentId: uuid("parent_id").references((): any => comment.id, { onDelete: 'set null' }) // Optional parent comment ID
});

export const reaction = pgTable("reaction", {
    id: uuid("id").primaryKey().defaultRandom(),
    type: varchar("type", { length: 50 }).notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    postId: uuid("post_id").notNull().references(() => post.id),
    userId: text("user_id").notNull().references(() => user.id)
}, (reaction) => ({
    uniqueReaction: unique().on(reaction.postId, reaction.userId)
}));
