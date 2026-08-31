import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

export type ProviderApiKeyName = "OPENAI_API_KEY" | "MAGIC_HOUR_API_KEY";

let cachedSecret: Promise<Partial<Record<ProviderApiKeyName, string>>> | undefined;

async function readAwsProviderSecret() {
  const secretId = process.env.AWS_PROVIDER_SECRETS_ID;
  const region = process.env.AWS_REGION;
  if (!secretId || !region) return {};

  const result = await new SecretsManagerClient({ region }).send(
    new GetSecretValueCommand({ SecretId: secretId }),
  );
  if (!result.SecretString) return {};
  const parsed: unknown = JSON.parse(result.SecretString);
  if (!parsed || typeof parsed !== "object") return {};

  const values = parsed as Record<string, unknown>;
  return {
    OPENAI_API_KEY:
      typeof values.OPENAI_API_KEY === "string" ? values.OPENAI_API_KEY : undefined,
    MAGIC_HOUR_API_KEY:
      typeof values.MAGIC_HOUR_API_KEY === "string"
        ? values.MAGIC_HOUR_API_KEY
        : undefined,
  };
}

export async function resolveProviderApiKey(
  name: ProviderApiKeyName,
  override?: string,
): Promise<string> {
  if (override !== undefined) return override;
  const environmentValue = process.env[name];
  if (environmentValue) return environmentValue;

  cachedSecret ??= readAwsProviderSecret().catch(() => ({}));
  return (await cachedSecret)[name] ?? "";
}
