import dotenv from 'dotenv'
dotenv.config()
const MONGO_URL = process.env.MONGO_URL ?? ''
const MONGO_DB = process.env.MONGO_DB ?? 'core1'

const NODE_ENV = process.env.NODE_ENV ?? 'development'
const APP_KEY = process.env.APP_KEY ?? 'freight-capstone'
const EXPRESS_PORT = process.env.EXPRESS_PORT ?? 5051
const EXT_EXPRESS_PORT = process.env.EXT_EXPRESS_PORT ?? 7000
const EXT_EXPRESS_PORT_1 = process.env.EXT_EXPRESS_PORT_1 ?? 7001
const REACT_APP_ORIGIN = process.env.REACT_APP_ORIGIN ?? '::1'
const REACT_APP_URL = process.env.REACT_APP_URL ?? 'http://localhost:3000'
const REACT_APP_MAINTENANCE = process.env.REACT_APP_MAINTENANCE ?? false
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET ?? ''

const GOOGLE_MAP = process.env.GOOGLE_MAP ?? ''
const GOOGLE_OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID ?? ''
const GOOGLE_OAUTH_SECRET_ID = process.env.GOOGLE_OAUTH_SECRET_ID ?? ''

const GITHUB_OAUTH_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID ?? ''
const GITHUB_OAUTH_SECRET_ID = process.env.GITHUB_OAUTH_SECRET_ID ?? ''

const MICROSOFT_OAUTH_CLIENT_ID = process.env.MICROSOFT_OAUTH_CLIENT_ID ?? ''
const MICROSOFT_OAUTH_SECRET_ID = process.env.MICROSOFT_OAUTH_SECRET_ID ?? ''

const API_RATE_LIMIT = process.env.API_RATE_LIMIT ?? 30
const API_RATE_DELAY = process.env.API_RATE_DELAY ?? 600
const API_EXTERNAL_RATE_LIMIT = process.env.API_EXTERNAL_RATE_LIMIT ?? 1000
const API_EXTERNAL_RATE_DELAY = process.env.API_EXTERNAL_RATE_DELAY ?? 600

const MAIL_HOST = process.env.MAIL_HOST ?? 'smtp.gmail.com'
const MAIL_PORT = process.env.MAIL_HOST ?? 587
const MAIL_USERNAME = process.env.MAIL_USERNAME ?? ''
const MAIL_PASSWORD = process.env.MAIL_PASSWORD ?? ''
const MAIL_FROM_ADDRESS = process.env.MAIL_FROM_ADDRESS ?? ''

const GITHUB_AUTH_TOKEN = process.env.GITHUB_AUTH_TOKEN ?? ''
const GITHUB_REPO = process.env.GITHUB_REPO ?? 'core1'
const GITHUB_OWNER = process.env.GITHUB_OWNER ?? 'freight-capstone'

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET ?? 'freight-capstone'

const SENTRY_DNS = process.env.SENTRY_DNS ?? ''
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN ?? ''
const SENTRY_ORGANIZATION_SLUG = process.env.SENTRY_ORGANIZATION_SLUG ?? 'freight-capstone'
const SENTRY_PROJECT_SLUG = process.env.SENTRY_PROJECT_SLUG ?? 'core1'

const XENDIT_API_GATEWAY_URL = process.env.XENDIT_API_GATEWAY_URL ?? 'https://api.xendit.co'
const XENDIT_API_KEY = process.env.XENDIT_API_KEY ?? ''
const XENDIT_WEBHOOK_VERIFICATION_TOKEN = process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN ?? ''

const AWS_REGION = process.env.AWS_REGION ?? 'ap-southeast-2'
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID ?? ''
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY ?? ''
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME ?? 'axleshift'
const AUTO_CONTENT_TYPE = process.env.AUTO_CONTENT_TYPE ?? ''

export {
    MONGO_URL,
    MONGO_DB,
    NODE_ENV,
    APP_KEY,
    EXPRESS_PORT,
    EXT_EXPRESS_PORT,
    EXT_EXPRESS_PORT_1,
    REACT_APP_ORIGIN,
    REACT_APP_URL,
    REACT_APP_MAINTENANCE,
    RECAPTCHA_SECRET,
    GOOGLE_MAP,
    GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_SECRET_ID,
    GITHUB_OAUTH_CLIENT_ID,
    GITHUB_OAUTH_SECRET_ID,
    MICROSOFT_OAUTH_CLIENT_ID,
    MICROSOFT_OAUTH_SECRET_ID,
    API_RATE_LIMIT,
    API_RATE_DELAY,
    API_EXTERNAL_RATE_LIMIT,
    API_EXTERNAL_RATE_DELAY,
    MAIL_HOST,
    MAIL_PORT,
    MAIL_USERNAME,
    MAIL_PASSWORD,
    MAIL_FROM_ADDRESS,
    GITHUB_AUTH_TOKEN,
    GITHUB_REPO,
    GITHUB_OWNER,
    GITHUB_WEBHOOK_SECRET,
    SENTRY_DNS,
    SENTRY_AUTH_TOKEN,
    SENTRY_ORGANIZATION_SLUG,
    SENTRY_PROJECT_SLUG,
    XENDIT_API_GATEWAY_URL,
    XENDIT_API_KEY,
    XENDIT_WEBHOOK_VERIFICATION_TOKEN,
    AWS_REGION,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_BUCKET_NAME,
    AUTO_CONTENT_TYPE,
}
