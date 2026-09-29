function requiredEnv(name) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value.replace(/\/+$/, '')
}

export const GRAPHQL_HTTP_ENDPOINT = requiredEnv('VUE_APP_GRAPHQL_HTTP')
export const GRAPHQL_WS_ENDPOINT = requiredEnv('VUE_APP_GRAPHQL_WS')
const S3_PUBLIC_BASE_URL = requiredEnv('VUE_APP_S3_PUBLIC_URL')

export function publicVideoUrl(key) {
  return `${S3_PUBLIC_BASE_URL}/public/${String(key).replaceAll(' ', '+')}`
}
