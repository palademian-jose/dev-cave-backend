import { Elysia, t } from "elysia";
import { userMiddleware } from "../middlewares/auth-middleware";
import { ReactionModel } from "../models/reaction.model";
import { User } from "better-auth/types";

export const reactionController = new Elysia({ prefix: "/api/posts" })
    .derive(userMiddleware)
    .post("/:postId/reactions", 
        async ({ params: { postId }, body, user }: { params: { postId: string }, body: any, user: User }) => {
            return await ReactionModel.addReaction({
                ...body,
                postId,
                userId: user.id
            });
        }, 
        {
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
        }
    )
    .get("/:postId/reactions", 
        async ({ params: { postId } }: { params: { postId: string } }) => {
            return await ReactionModel.getPostReactions(postId);
        }, 
        {
            detail: {
                summary: "Get reactions for a post",
                tags: ["reaction"]
            },
            params: t.Object({
                postId: t.String()
            })
        }
    )
    .delete("/:postId/reactions", 
        async ({ params: { postId }, user }: { params: { postId: string }, user: User }) => {
            return await ReactionModel.deleteReactionByPostAndUser(postId, user.id);
        }, 
        {
            detail: {
                summary: "Delete a reaction",
                tags: ["reaction"]
            },
            params: t.Object({
                postId: t.String()
            })
        }
    );