import React, { useEffect } from 'react'
import { CButton, CFormInput, CInputGroup, CInputGroupText, CFormCheck } from '@coreui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import Form from './Form'

const View = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const address = location.state?.address
    const [formData, setFormData] = React.useState(address ? address : {})

    useEffect(() => {
        if (!address) navigate('/my-addresses')
    }, [address, navigate])

    return (
        <div>
            <CButton
                color="primary"
                size="sm"
                onClick={(e) => navigate('/my-addresses')}
                className="ms-auto mb-3"
            >
                <FontAwesomeIcon icon={faChevronLeft} className="me-2" /> Back
            </CButton>
            <Form data={{ formData, setFormData }} />
        </div>
    )
}

export default View
