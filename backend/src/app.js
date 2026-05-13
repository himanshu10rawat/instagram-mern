import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import hpp from "hpp";
import mongoSanitize from "mongo-sanitize";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import followRoutes from "./routes/follow.routes.js";
import postRoutes from "./routes/post.routes.js";
import storyRoutes from "./routes/story.routes.js";
import closeFriendRoutes from "./routes/closeFriend.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import messageRoutes from "./routes/message.routes.js";
import reelRoutes from "./routes/reel.routes.js";
import exploreRoutes from "./routes/explore.routes.js";
import agoraRoutes from "./routes/agora.routes.js";
import safetyRoutes from "./routes/safety.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import liveRoutes from "./routes/live.routes.js";
import recommendationRoutes from "./routes/recommendation.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import twoFactorRoutes from "./routes/twoFactor.routes.js";
import collectionRoutes from "./routes/collection.routes.js";
import shareRoutes from "./routes/share.routes.js";
import hashtagRoutes from "./routes/hashtag.routes.js";
import searchHistoryRoutes from "./routes/searchHistory.routes.js";
import highlightRoutes from "./routes/highlight.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(helmet());
app.use(hpp());
app.use(compression());

app.use(morgan("dev"));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use((req, _res, next) => {
  mongoSanitize(req.body);
  mongoSanitize(req.params);

  Object.defineProperty(req, "query", {
    value: mongoSanitize(req.query),
    writable: true,
    configurable: true,
    enumerable: true,
  });

  next();
});

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/follow", followRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/stories", storyRoutes);
app.use("/api/v1/close-friends", closeFriendRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/reels", reelRoutes);
app.use("/api/v1/explore", exploreRoutes);
app.use("/api/v1/live", liveRoutes);
app.use("/api/v1/agora", agoraRoutes);
app.use("/api/v1/safety", safetyRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/recommendations", recommendationRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/sessions", sessionRoutes);
app.use("/api/v1/2fa", twoFactorRoutes);
app.use("/api/v1/collections", collectionRoutes);
app.use("/api/v1/share", shareRoutes);
app.use("/api/v1/hashtags", hashtagRoutes);
app.use("/api/v1/search-history", searchHistoryRoutes);
app.use("/api/v1/highlights", highlightRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
