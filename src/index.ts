import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import betterAuthView from "./libs/auth/auth-view";
import { postController } from "./controllers/post.controller";
import { commentController } from "./controllers/comment.controller";
import { reactionController } from "./controllers/reaction.controller";
import { profileController } from "./controllers/profile.controller";
import { uploadController } from "./controllers/upload.controller";

const app = new Elysia()
  .use(cors())
  .use(swagger())
  .use(postController)
  .use(commentController)
  .use(reactionController)
  .use(profileController)
  .use(uploadController)
  .all("/api/auth/*", betterAuthView);

app.listen(4000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
