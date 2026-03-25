import React, { useEffect } from 'react'
import { CCard, CCardBody, CCardText, CCardHeader } from '@coreui/react'
import Masonry from 'react-masonry-css'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faLock, faServer, faKey } from '@fortawesome/free-solid-svg-icons'
import { useUserProvider } from '../../components/UserProvider'

const Freight = () => {
    const navigate = useNavigate()

    useEffect(() => {
        navigate('/security/management')
    }, [navigate])
    return ''
}

export default Freight
