import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CCard,
    CCardBody,
    CFormInput,
    CButton,
    CContainer,
    CSpinner,
    CRow,
    CCol,
    CAlert,
    CForm,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import ReCAPTCHA from 'react-google-recaptcha'
import { VITE_APP_RECAPTCHA_SITE_KEY, VITE_APP_SESSION } from '../../config'

const OTP = () => {
    const [loading, setLoading] = useState(true)
    const [email, setEmail] = useState('')
    const [error, setError] = useState({
        error: false,
        message: '',
    })
    const [phoneNumber, setPhoneNumber] = useState('')
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const token = cookies.get(VITE_APP_SESSION)
    const navigate = useNavigate()
    const recaptchaRef = React.useRef()

    useEffect(() => {
        const checkAuthentication = async () => {
            if (token === undefined) return navigate('/login')

            axios
                .post(`/auth/verify`, null)
                .then((response) => {
                    if (!response.data.otp) return navigate('/dashboard')
                    setEmail(response.data.email)
                })
                .catch((error) => {
                    const message =
                        error.response?.data?.error ||
                        (error.message === 'network error'
                            ? 'Server is offline or restarting please wait'
                            : error.message)

                    setError({
                        error: true,
                        message,
                    })
                })
                .finally(() => setLoading(false))
        }

        checkAuthentication()
    }, [navigate, token])

    const handleChange = (e, index) => {
        const value = e.target.value.replace(/[^0-9]/g, '')
        if (value.length <= 1) {
            const newOtp = [...otp]
            newOtp[index] = value

            if (value && index < 5) {
                document.getElementById(`otp-input-${index + 1}`).focus()
            }

            setOtp(newOtp)
        }
    }

    const handleLogout = () => {
        cookies.remove(VITE_APP_SESSION)
        window.location.href = '/login'
    }

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-input-${index - 1}`).focus()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const recaptcha = await recaptchaRef.current.executeAsync()
        setError({
            error: false,
            message: '',
        })
        setLoading(true)
        axios
            .post(`/auth/verify/otp`, {
                phoneNumber: phoneNumber,
                otp: otp,
                recaptcha_ref: recaptcha,
            })
            .then((response) => {
                if (response.data.error)
                    return setError({
                        error: true,
                        message: response.data.error,
                    })
                const urlParams = new URLSearchParams(window.location.search)
                const url = urlParams.get('n') ? urlParams.get('n') : '/'
                navigate(url)
            })
            .catch((error) => {
                const message =
                    error.response?.data?.error ||
                    (error.message === 'network error'
                        ? 'Server is offline or restarting please wait'
                        : error.message)

                setError({
                    error: true,
                    message,
                })
            })
            .finally(() => setLoading(false))
    }

    const handleResend = async () => {
        const recaptcha = await recaptchaRef.current.executeAsync()
        setError({
            error: false,
            message: '',
        })
        setLoading(true)
        axios
            .post(`/auth/verify/otp/new`, {
                recaptcha_ref: recaptcha,
            })
            .then((response) =>
                setError({
                    error: true,
                    message: response.data.message,
                }),
            )
            .catch((error) => {
                const message =
                    error.response?.data?.error ||
                    (error.message === 'network error'
                        ? 'Server is offline or restarting please wait'
                        : error.message)

                setError({
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
                {!email && (
                    <h1 className="text-center">{error ? error.message : 'Processing...'}</h1>
                )}
                {email && (
                    <CRow className="justify-content-center">
                        <CCol md={8} lg={6} xl={5}>
                            <CCard className="p-1 p-md-4 shadow">
                                <CCardBody>
                                    {error.error && (
                                        <CAlert
                                            color="danger"
                                            className="d-flex align-items-center"
                                        >
                                            <FontAwesomeIcon
                                                className="flex-shrink-0 me-2"
                                                icon={faXmark}
                                                size="xl"
                                            />
                                            <div>{error.message}</div>
                                        </CAlert>
                                    )}
                                    <CForm onSubmit={handleSubmit}>
                                        <div className="text-center">
                                            <h1>Verify Your Account</h1>
                                            <p className="text-body-secondary small">
                                                Enter the 6 digit code that was sent to{' '}
                                                <b>{email}</b>.
                                            </p>
                                        </div>
                                        <CFormInput
                                            type="text"
                                            name="axle_pot"
                                            className="axle_pot"
                                            placeholder="Phone number"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                        />
                                        <div className="d-flex justify-content-center gap-2 mb-3">
                                            {otp.map((digit, index) => (
                                                <CFormInput
                                                    key={index}
                                                    type="text"
                                                    id={`otp-input-${index}`}
                                                    value={digit}
                                                    onChange={(e) => handleChange(e, index)}
                                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                                    className="otp-input"
                                                    maxLength="1"
                                                />
                                            ))}
                                        </div>
                                        <p className="text-center text-muted small">
                                            Want to switch account? <a href="/logout">Logout</a>
                                        </p>
                                        <div className="d-flex justify-content-center mb-3">
                                            <CButton
                                                type="submit"
                                                color="primary"
                                                className="px-4 rounded-pill"
                                            >
                                                Confirm Code
                                            </CButton>
                                        </div>
                                        <div className="d-flex justify-content-center">
                                            <CButton
                                                color="primary-outline"
                                                className="rounded-pill"
                                                onClick={handleResend}
                                            >
                                                Resend OTP
                                            </CButton>
                                        </div>
                                    </CForm>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    </CRow>
                )}
            </CContainer>
            <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={VITE_APP_RECAPTCHA_SITE_KEY} />
        </div>
    )
}

export default OTP
