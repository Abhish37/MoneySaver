import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  GOOGLE_VISION_CREDENTIALS: z.string().optional(),
  AWS_S3_BUCKET_NAME: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success && process.env.NODE_ENV !== 'test') {
  console.warn(
    '⚠️ Missing or unconfigured environment variables:\n',
    Object.entries(_env.error.format())
      .map(([name, value]) => `  - ${name}: ${value?._errors?.join(', ')}`)
      .join('\n')
  )
}

export const env = _env.success ? _env.data : process.env
