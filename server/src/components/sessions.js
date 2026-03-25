import { ObjectId } from 'mongodb'
import database from '../models/mongodb.js'
import logger from '../utils/logger.js'
import activity from './activity.js'
import { send } from './mail.js'
import redis, { getCache, setCache, remCache, decrypt } from '../models/redis.js'
import { getClientIp } from './ip.js'

/**
 * Creates a new session.
 *
 * @param {Object} theUser
 * @param {String} sessionToken
 * @param {String} ip
 * @param {String} userAgent
 * @param {Object} location
 */
export const addSession = async (theUser, sessionToken, ip, userAgent, location) => {
    try {
        const data = {
            _id: new ObjectId(),
            user_id: theUser._id,
            token: sessionToken,
            active: false,
            ip_address: ip,
            user_agent: userAgent,
            location: location,
            last_accessed: Date.now(),
        }
        setCache(`internal-${sessionToken}`, data)

        const req = {
            headers: {
                'user-agent': userAgent,
                'x-forwarded-for': ip,
            },
            user: { _id: theUser._id },
            session: { _id: data._id },
        }

        if (theUser.log) activity(req, theUser.log)
        if (theUser.log1) activity(req, theUser.log1)
        activity(req, 'login')
    } catch (e) {
        logger.error(e)
    }
}

/**
 * Fetch the user from cache or database.
 *
 * @param {Object} cachedSession
 * @return {Promise<Object>}
 */
export const getUser = async (cachedSession) => {
    try {
        const cachedUser = await getCache(`user-id-${cachedSession.user_id}`)
        if (cachedUser) return cachedUser

        const db = await database()
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(cachedSession.user_id) },
            {
                projection: {
                    _id: 1,
                    avatar: 1,
                    username: 1,
                    username_last_updated_at: 1,
                    email: 1,
                    email_last_updated_at: 1,
                    first_name: 1,
                    last_name: 1,
                    role: 1,
                    email_verify_at: 1,
                    oauth2: 1,
                    password: {
                        $cond: { if: { $ne: ['$password', null] }, then: 'OK', else: null },
                    },
                    password_changed_on: 1,
                    timezone: 1,
                    ref: 1,
                },
            },
        )
        if (!user) return null
        await setCache(`user-id-${user._id.toString()}`, user, 24 * 60 * 60 * 1000)
        return user
    } catch (e) {
        logger.error(e)
    }
    return null
}

/**
 * Remove a session.
 *
 * @param {String} sessionToken
 */
export const removeSession = async (sessionToken) => {
    try {
        remCache(`internal-${sessionToken}`)
    } catch (e) {
        logger.error(e)
    }
}

/**
 * Get the session from cache, database if return null the user is logged out.
 *
 * @param {Object} req
 * @param {String} sessionToken
 * @return {Promise<Object>}
 */
export const getSession = async (req, sessionToken) => {
    try {
        const cachedSession = await getCache(`internal-${sessionToken}`)
        if (!cachedSession) return null

        const diff = Date.now() - cachedSession.last_accessed
        const week = 7 * 24 * 60 * 60 * 1000
        if (diff >= week) return null

        const now = Date.now()
        if (now - cachedSession.last_accessed > 60 * 1000) {
            cachedSession.last_accessed = now
            ;((cachedSession.ip_address = getClientIp(req)),
                (cachedSession.user_agent = req.headers['user-agent'] || 'unknown'),
                setCache(`internal-${sessionToken}`, cachedSession))
        }
        return cachedSession
    } catch (e) {
        logger.error(e)
    }
    return null
}

/**
 * Check if the IP is new and send an email to the user.
 *
 * @param {String} ip
 * @param {Object} theUser
 * @return {Promise<void>}
 */
export const isNewIP = async (ip, theUser) => {
    try {
        const redisClient = await redis()
        const stream = redisClient.scanStream()
        const IP = []

        for await (const keys of stream) {
            if (keys.length > 0) {
                const filteredKeys = keys.map((key) => key.replace('axleshift-core1:', ''))
                const values = await redisClient.mget(filteredKeys)
                keys.forEach(async (key, index) => {
                    const value = JSON.parse(await decrypt(values[index]))
                    if (value && /^axleshift-core1:internal-[0-9a-f]{32}$/.test(key)) {
                        if (value.user_id === theUser._id.toString()) {
                            IP.push(value.ip_address)
                        }
                    }
                })
            }
        }

        if (IP.includes(ip)) return
        const date = new Date().toUTCString()
        send(
            {
                to: theUser.email,
                subject: `Login Attempted from New IP address ${ip} - ${date}`,
                text: `We notice a login from a New Device or Location.<br/>Your axleshift account <b><u>${theUser.email}</u></b> was accessed from a new IP address.<br/><br/><b>Date</b> : ${date} <br/><b>IP Address</b> : ${ip}<br /><br /><i>This is an automated message, please do not reply.`,
            },
            theUser.first_name,
        )
    } catch (e) {
        logger.error(e)
    }
}
