import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CAlert,
    CButton,
    CCard,
    CCardBody,
    CCol,
    CContainer,
    CForm,
    CFormInput,
    CInputGroup,
    CInputGroupText,
    CRow,
    CButtonGroup,
    CSpinner,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import ReCAPTCHA from 'react-google-recaptcha'
import { VITE_APP_RECAPTCHA_SITE_KEY, VITE_APP_SESSION } from '../../config'

const ForgotPassword = () => {
    const navigate = useNavigate()
    const recaptchaRef = React.useRef()
    const [loading, setLoading] = useState(true)
    const [email, setEmail] = useState('')
    const [error, setError] = useState({
        type: '',
        error: false,
        message: '',
    })

    useEffect(() => {
        if (cookies.get(VITE_APP_SESSION) !== undefined) return navigate('/dashboard')
        setLoading(false)
    }, [navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!navigator.geolocation)
            setError({
                type: 'danger',
                error: true,
                message: 'Geolocation is not supported by this browser. Registration halted!',
            })

        navigator.geolocation.getCurrentPosition(
            (position) => {
                forgotPassword(e, {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                })
            },
            (error) => {
                let errorMessage
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'We need your location to continue.'
                        break
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable.'
                        break
                    case error.TIMEOUT:
                        errorMessage = 'Timeout occurred while getting your location.'
                        break
                    default:
                        errorMessage = 'An unknown error occurred. Please try again later.'
                }
                setError({
                    type: 'danger',
                    error: true,
                    message: errorMessage,
                })
                return true
            },
        )
    }

    const forgotPassword = async (e, location) => {
        const recaptcha = await recaptchaRef.current.executeAsync()
        setError({
            type: '',
            error: false,
            message: '',
        })
        setLoading(true)
        const formDataToSend = {}
        formDataToSend['email'] = email
        formDataToSend['recaptcha_ref'] = recaptcha
        formDataToSend['location'] = JSON.stringify(location)

        axios
            .post(`/auth/forgot-password`, formDataToSend)
            .then((response) => {
                if (response.data.error)
                    return setError({
                        type: 'danger',
                        error: true,
                        message: response.data.error,
                    })
                setError({
                    type: 'success',
                    error: true,
                    message: response.data.message,
                })
            })
            .catch((error) => {
                const message =
                    error.response?.data?.error ||
                    (error.message === 'network error'
                        ? 'Server is offline or restarting please wait'
                        : error.message)

                setError({
                    type: 'danger',
                    error: true,
                    message,
                })
            })
            .finally(() => setLoading(false))
    }

    if (loading)
        return (
            <div className="loading-overlay">
                <CSpinner color="primary" variant="grow" />
            </div>
        )

    return (
        <div className="bg-dark min-vh-100 d-flex flex-row align-items-center">
            <div className="auth-bg" />
            <CContainer>
                {loading && (
                    <div className="loading-overlay">
                        <CSpinner color="primary" variant="grow" />
                    </div>
                )}

                <CRow className="justify-content-center">
                    <CCol md={8} lg={6} xl={5}>
                        <CCard className="p-1 p-sm-4 shadow">
                            <CCardBody>
                                {error.error && (
                                    <CAlert
                                        color={error.type}
                                        className="d-flex align-items-center"
                                    >
                                        <FontAwesomeIcon
                                            className="flex-shrink-0 me-2"
                                            icon={error.type === 'success' ? faCheck : faXmark}
                                            size="xl"
                                        />
                                        <div>{error.message}</div>
                                    </CAlert>
                                )}
                                <CForm onSubmit={handleSubmit}>
                                    <h1>Axleshift</h1>
                                    <p className="text-body-secondary">Forgot password</p>
                                    <ReCAPTCHA
                                        ref={recaptchaRef}
                                        size="invisible"
                                        sitekey={VITE_APP_RECAPTCHA_SITE_KEY}
                                    />
                                    <CInputGroup className="mb-3">
                                        <CInputGroupText>
                                            <FontAwesomeIcon icon={faEnvelope} />
                                        </CInputGroupText>
                                        <CFormInput
                                            type="email"
                                            placeholder="Email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </CInputGroup>
                                    We&apos;ll send you an email with a link to reset your password.
                                    <div className="d-grid mt-2">
                                        <CButtonGroup>
                                            <CButton
                                                type="submit"
                                                color="primary"
                                                className="me-2 rounded"
                                                disabled={error.type === 'success'}
                                            >
                                                Continue
                                            </CButton>
                                            <CButton
                                                color="outline-primary"
                                                className="me-2 rounded"
                                                onClick={() => navigate('/login')}
                                            >
                                                Login
                                            </CButton>
                                            <CButton
                                                color="outline-primary"
                                                className="me-2 rounded"
                                                onClick={() => navigate('/register')}
                                            >
                                                Signup
                                            </CButton>
                                        </CButtonGroup>
                                    </div>
                                </CForm>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CContainer>
        </div>
    )
}

export default ForgotPassword
