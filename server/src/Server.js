import express from 'express'
import cors from 'cors'
import mongoSanitize from 'express-mongo-sanitize'
import helmet from 'helmet'
import compression from 'compression'
import { NODE_ENV, REACT_APP_URL } from './config.js'
import rateLimiter from './middleware/rateLimiter.js'
import logger from './utils/logger.js'
import APIv1 from './routes/v1/index.js'
import Webhookv1 from './webhook/v1/index.js'
import IPAddressFilter from './middleware/ip.js'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
    try {
        if (req.body) mongoSanitize.sanitize(req.body)
        if (req.params) mongoSanitize.sanitize(req.params)
    } catch (e) {
        console.error(e)
    }
    next()
})
app.use(compression())
app.use(rateLimiter)
app.use(IPAddressFilter)

app.get('/', (req, res) => res.redirect(301, REACT_APP_URL))
// refer to /routes/v1/index
app.use('/api/v1/', APIv1)
// refer to /webhook/v1/index
app.use('/webhook/v1/', Webhookv1)

app.use((err, req, res, next) => {
    logger.error(err)
    res.status(500).json({ error: 'Internal server error' })
})

if (NODE_ENV !== 'production')
    app.get('/debug-sentry', (req, res) => {
        throw new Error(
            "This is a test DON't PaNICCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
        )
    })

export default app
