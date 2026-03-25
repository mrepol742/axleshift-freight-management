import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

const AppNetwork = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine)

    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return (
        <div>
            {!isOnline && (
                <div
                    style={{
                        padding: '1rem',
                        backgroundColor: '#f8d7da',
                        color: '#721c24',
                    }}
                >
                    🚫 You are offline. Please connect to internet.
                </div>
            )}
        </div>
    )
}

export default AppNetwork
