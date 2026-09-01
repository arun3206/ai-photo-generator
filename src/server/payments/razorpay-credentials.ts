import { awsJsonRequest } from "@/server/aws/aws-sdk-lite";

export interface RazorpayCredentials {
  keyId: string;
  keySecret: string;
}

let cachedCredentials: Promise<RazorpayCredentials | null> | undefined;
let modeLogged = false;

async function readAwsCredentials(): Promise<RazorpayCredentials | null> {
  const secretId = process.env.AWS_RAZORPAY_TEST_SECRET_ID;
  const region = process.env.AWS_REGION;
  if (!secretId || !region) return null;
  const response = await awsJsonRequest(
    "secretsmanager",
    region,
    `https://secretsmanager.${region}.amazonaws.com/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target": "secretsmanager.GetSecretValue",
      },
      body: JSON.stringify({ SecretId: secretId }),
    },
  );
  const result = (await response.json()) as { SecretString?: string };
  const parsed: unknown = result.SecretString ? JSON.parse(result.SecretString) : null;
  if (!parsed || typeof parsed !== "object") return null;
  const values = parsed as Record<string, unknown>;
  return typeof values.RAZORPAY_KEY_ID === "string" &&
    typeof values.RAZORPAY_KEY_SECRET === "string"
    ? { keyId: values.RAZORPAY_KEY_ID, keySecret: values.RAZORPAY_KEY_SECRET }
    : null;
}

export async function resolveRazorpayCredentials(): Promise<RazorpayCredentials> {
  const direct = {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  };
  const credentials =
    direct.keyId && direct.keySecret
      ? { keyId: direct.keyId, keySecret: direct.keySecret }
      : await (cachedCredentials ??= readAwsCredentials().catch(() => null));
  if (!credentials?.keyId || !credentials.keySecret)
    throw new Error("Razorpay Test Mode is not configured.");
  if (!credentials.keyId.startsWith("rzp_test_"))
    throw new Error("Only Razorpay Test Mode credentials are allowed.");
  if (!modeLogged) {
    console.info("Razorpay mode: TEST");
    modeLogged = true;
  }
  return credentials;
}
