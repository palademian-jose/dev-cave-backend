import Elysia from "elysia";
import { userMiddleware } from "../middlewares/auth-middleware";

export const profileController = new Elysia({ prefix: "/api/profile" }).derive(userMiddleware).get("/", async ({ user }: { user: any }) => {
    return user;
}, {
    detail: {
        summary: "Get my profile",
        tags: ["profile"]
    }
});