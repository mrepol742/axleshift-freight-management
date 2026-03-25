import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComments } from '@fortawesome/free-solid-svg-icons'
import { useLocation } from 'react-router-dom'
import Support from '../views/support/customer-service/index'

const FloatingChat = () => {
    const [isOpen, setIsOpen] = useState(false)
    const location = useLocation()

    useEffect(() => {
        const isCustomer = () => {
            if (location.pathname === '/customer') setIsOpen(false)
        }

        isCustomer()
    }, [location.pathname])

    if (location.pathname === '/customer') return null

    return (
        <div>
            <button className="btn btn-primary" onClick={() => setIsOpen(!isOpen)}>
                <FontAwesomeIcon icon={faComments} className="me-1" /> Support
            </button>

            {isOpen && (
                <div className="position-fixed bottom-0 end-0 me-3" style={{ zIndex: 1000 }}>
                    <Support float={true} isOpen={isOpen} setIsOpen={setIsOpen} />
                </div>
            )}
        </div>
    )
}

export default FloatingChat
