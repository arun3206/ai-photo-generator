#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { PhotoStorageStack } from "../lib/photo-storage-stack.js";

const app = new App();
const environment = app.node.tryGetContext("environment") ?? "dev";
const allowedOrigin = app.node.tryGetContext("allowedOrigin") ?? "http://localhost:3000";
const region = app.node.tryGetContext("region") ?? "ap-south-1";
const account = app.node.tryGetContext("account") ?? process.env.CDK_DEFAULT_ACCOUNT;

if (environment !== "dev" && allowedOrigin.includes("localhost")) {
  throw new Error("A deployed HTTPS application origin is required outside development.");
}

new PhotoStorageStack(app, `YaadonPhotoStorage-${environment}`, {
  environmentName: environment,
  allowedOrigin,
  env: {
    account,
    region,
  },
  terminationProtection: environment === "production",
  description: `Private Yaadon photo storage for the ${environment} environment`,
});
