import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import { VITE_APP_SESSION, VITE_APP_NODE_ENV } from '../../config'

const Landing = () => {
    const navigate = useNavigate()

    useEffect(() => {
        if (cookies.get(VITE_APP_SESSION)) return navigate('/dashboard')
        if (VITE_APP_NODE_ENV !== 'development') navigate('https://axleshift.com')
        navigate('/login')
    }, [navigate])

    return (
        <div className="wrapper d-flex flex-column min-vh-100">
            <div className="body flex-grow-1">
                <div className="loading-overlay">
                    <CSpinner color="primary" variant="grow" />
                </div>
            </div>
        </div>
    )
}

export default Landing
