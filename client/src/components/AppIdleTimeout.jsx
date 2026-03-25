import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
    CToaster,
    CToast,
    CToastHeader,
    CToastBody,
    CImage,
    CModal,
    CButton,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
} from '@coreui/react'
import { useUserProvider } from './UserProvider'

const AppIdleTimeout = ({ children }) => {
    const { user } = useUserProvider()
    const IDLE_TIMEOUT = 10 * 60 * 1000
    const COUNTDOWN_TIME = 30
    const [isIdle, setIsIdle] = useState(false)
    const [countdown, setCountdown] = useState(COUNTDOWN_TIME)
    const timeoutRef = useRef(null)
    const intervalRef = useRef(null)

    const startCountdown = useCallback(() => {
        intervalRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current)
                    window.location.href = '/logout'
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }, [])

    useEffect(() => {
        const resetTimer = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            if (intervalRef.current) clearInterval(intervalRef.current)

            setIsIdle(false)
            setCountdown(countdown)

            timeoutRef.current = setTimeout(() => {
                setIsIdle(true)
                startCountdown()
            }, IDLE_TIMEOUT)
        }

        resetTimer()

        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
        const resetOnActivity = () => resetTimer()

        events.forEach((e) => window.addEventListener(e, resetOnActivity))

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            if (intervalRef.current) clearInterval(intervalRef.current)
            events.forEach((e) => window.removeEventListener(e, resetOnActivity))
        }
    }, [IDLE_TIMEOUT, countdown, startCountdown])

    return (
        <div>
            {isIdle && (
                <div
                    className="position-fixed top-50 start-50 translate-middle p-3"
                    style={{ zIndex: 1050 }}
                >
                    <CModal
                        alignment="center"
                        visible={isIdle}
                        onClose={(e) => setIsIdle(false)}
                        aria-labelledby="warningModal"
                    >
                        <CModalHeader closeButton={false}>
                            <CModalTitle id="warningModal">Are you still here?</CModalTitle>
                        </CModalHeader>
                        <CModalBody>You will be logged out in {countdown} seconds.</CModalBody>
                        <CModalFooter>
                            <CButton
                                color="primary"
                                onClick={(e) => {
                                    setVisibility(false)
                                    resetTimer()
                                }}
                            >
                                Stay Logged In
                            </CButton>
                        </CModalFooter>
                    </CModal>
                </div>
            )}
            {children}
        </div>
    )
}

export default React.memo(AppIdleTimeout)

AppIdleTimeout.propTypes = {
    children: PropTypes.node.isRequired,
}
