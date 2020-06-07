import env from "./env";

import asyncHandler from "express-async-handler";
import { getApp } from "@knots/kutt__frontend";
import cookieParser from "cookie-parser";
import passport from "passport";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import Raven from "raven";

import * as helpers from "./handlers/helpers";
import * as links from "./handlers/links";
import * as auth from "./handlers/auth";
import __v1Routes from "./__v1";
import routes from "./routes";

import "./cron";
import "./passport";

if (env.RAVEN_DSN) {
  Raven.config(env.RAVEN_DSN).install();
}

const port = env.PORT;
const app = getApp({
  isDev: env.isDev
});
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const server = express();
  server.set("trust proxy", true);

  if (env.isDev) {
    server.use(morgan("dev"));
  }

  server.use(helmet());
  server.use(cookieParser());
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  server.use(passport.initialize());
  server.use(helpers.ip);

  server.use(asyncHandler(links.redirectCustomDomain));

  server.use("/api/v2", routes);
  server.use("/api", __v1Routes);

  server.get(
    "/reset-password/:resetPasswordToken?",
    asyncHandler(auth.resetPassword),
    (req, res) => app.render(req, res, "/reset-password", { token: req.token })
  );

  server.get(
    "/verify/:verificationToken?",
    asyncHandler(auth.verify),
    (req, res) => app.render(req, res, "/verify", { token: req.token })
  );

  server.get("/:id", asyncHandler(links.redirect(app)));

  // Error handler
  server.use(helpers.error);

  // Handler everything else by Next.js
  server.get("*", (req, res) => handle(req, res));

  server.listen(port, err => {
    if (err) throw err;
    // eslint-disable-next-line no-console
    console.log(`> Ready on http://localhost:${port}`);
  });
});
