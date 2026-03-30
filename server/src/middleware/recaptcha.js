import axios from 'axios'
import logger from '../utils/logger.js'
import { RECAPTCHA_SECRET } from '../config.js'

/**
 * Verify if the recaptcha is valid.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @return {Promise<void>}
 */
const recaptcha = async (req, res, next) => {
    const { recaptcha_ref } = req.body || {}
    if (!recaptcha_ref) return res.status(400).json({ error: 'Invalid request' })

    try {
        const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
                secret: RECAPTCHA_SECRET,
                response: recaptcha_ref,
            },
        })

        const { success, score } = response.data
        if (!success || score < 0.5)
            return res.status(403).json({ error: 'Recaptcha verification failed' })

        return next()
    } catch (err) {
        logger.error(err)
    }
    res.status(401).json({ error: 'Unauthorized' })
}

export default recaptcha
