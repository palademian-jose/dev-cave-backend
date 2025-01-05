import Elysia from "elysia";
import { userMiddleware } from "../middlewares/auth-middleware";
import { User } from "better-auth/types";
import { ProfileModel } from "../models/profile.model";

export const profileController = new Elysia({ prefix: "/api/profile" })
    .derive(userMiddleware)
    .get("/", async ({ user, set }: { user: User, set: any }) => {
        try {
            const profile = await ProfileModel.getProfileWithPosts(user.id);
            
            if (!profile) {
                set.status = 404;
                return { error: "Profile not found" };
            }

            return profile;
        } catch (error) {
            console.error("Error fetching profile:", error);
            set.status = 500;
            return { error: "Failed to fetch profile" };
        }
    }, {
        detail: {
            summary: "Get user profile with posts",
            tags: ["Profile"]
        }
    });