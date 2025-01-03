import {Elysia, t} from "elysia";
import { userMiddleware } from "../middlewares/auth-middleware";
import { ReactionModel } from "../models/reaction.model";

export const reactionController = new Elysia({ prefix: "/api/reactions" })
    .derive(userMiddleware)
    .post("/:postId/reactions", async ({ params: { postId }, body, user }: { params: { postId: string }, body: any, user: any }) => {
        return await ReactionModel.addReaction({
            ...body,
            postId,
            userId: user.id
        });
    }, {
        detail: {
            summary: "Add a reaction",
            tags: ["reaction"]
        },
        params: t.Object({
            postId: t.String()
        }),
        body: t.Object({
            type: t.String()
        })
    })
    .get("/:postId/reactions", async ({ params: { postId } }) => {
        return await ReactionModel.getPostReactions(postId);
    }, {
        detail: {
            summary: "Get reactions for a post",
            tags: ["reaction"]
        },
        params: t.Object({
            postId: t.String()
        })
    })
    .delete("/:id", async ({ params: { id }, user }: { params: { id: string }, user: any }) => {
        const existingReaction = await ReactionModel.getReactionById(id);
        if (!existingReaction) throw new Error("Reaction not found");
        if (existingReaction.userId !== user.id) throw new Error("Not authorized");

        await ReactionModel.deleteReaction(id);
        return { success: true };
    }, {
        detail: {
            summary: "Delete a reaction",
            tags: ["reaction"]
        },
        params: t.Object({
            id: t.String()
        })
    });