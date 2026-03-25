import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
import {
    faEnvelope,
    faCheck,
    faXmark,
    faLock,
    faEye,
    faEyeSlash,
} from '@fortawesome/free-solid-svg-icons'
import ReCAPTCHA from 'react-google-recaptcha'
import { VITE_APP_RECAPTCHA_SITE_KEY, VITE_APP_SESSION } from '../../../../config'

const ForgotPassword = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const recaptchaRef = React.useRef()
    const [loading, setLoading] = useState(true)
    const [grantPasswordReset, setGrantPasswordReset] = useState(false)
    const [email, setEmail] = useState('')
    const [formData, setFormData] = useState({
        password: '',
        repeat_password: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState({
        type: '',
        error: false,
        message: '',
    })

    const handleInputChange = (e) => {
        const { id, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }))
    }

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev)
    }

    const passwordRequirements = [
        {
            id: 1,
            text: 'At least 8 characters',
            test: (password) => password.length >= 8,
        },
        {
            id: 2,
            text: 'At least one uppercase letter',
            test: (password) => /[A-Z]/.test(password),
        },
        {
            id: 3,
            text: 'At least one lowercase letter',
            test: (password) => /[a-z]/.test(password),
        },
        {
            id: 4,
            text: 'At least one number',
            test: (password) => /[0-9]/.test(password),
        },
        {
            id: 5,
            text: 'At least one special character',
            test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
        },
    ]

    const checkRequirements = (password) => {
        return passwordRequirements.map((req) => ({
            ...req,
            passed: req.test(password),
        }))
    }

    const [requirementsStatus, setRequirementsStatus] = useState(
        checkRequirements(formData.password),
    )

    useEffect(() => {
        const verifyPasswordResetToken = async () => {
            const recaptcha = await recaptchaRef.current.executeAsync()
            setError({
                type: '',
                error: false,
                message: '',
            })

            axios
                .post(`/auth/forgot-password/verify`, {
                    token: id,
                    recaptcha_ref: recaptcha,
                })
                .then((response) => {
                    if (response.data.error)
                        return setError({
                            type: 'danger',
                            error: true,
                            message: response.data.error,
                        })
                    setGrantPasswordReset(true)
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

        verifyPasswordResetToken()
    }, [id])

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
        if (formData.password !== formData.repeat_password)
            return setError({
                type: 'danger',
                error: true,
                message: 'Passwords do not match',
            })
        setError({
            type: '',
            error: false,
            message: '',
        })
        setLoading(true)
        const formDataToSend = formData
        formDataToSend['token'] = id
        formDataToSend['recaptcha_ref'] = recaptcha
        formDataToSend['location'] = JSON.stringify(location)

        axios
            .post(`/auth/forgot-password/reset`, formDataToSend)
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
                setFormData({
                    password: '',
                    repeat_password: '',
                })
                setTimeout(() => {
                    navigate('/auth/login')
                }, 2000)
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

    return (
        <div className="bg-dark min-vh-100 d-flex flex-row align-items-center">
            <div className="auth-bg" />
            <CContainer>
                {loading && (
                    <div className="loading-overlay">
                        <CSpinner color="primary" variant="grow" />
                    </div>
                )}
                {!grantPasswordReset && (
                    <h1 className="text-center">{error ? error.message : 'Processing...'}</h1>
                )}
                {grantPasswordReset && (
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
                                        <p className="text-body-secondary">Set a new Password</p>
                                        <CInputGroup className="mb-3">
                                            <CInputGroupText>
                                                <FontAwesomeIcon icon={faLock} />
                                            </CInputGroupText>
                                            <CFormInput
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Password"
                                                autoComplete="current"
                                                value={formData.password}
                                                onChange={(e) => handleInputChange(e)}
                                                required
                                            />
                                            <CInputGroupText>
                                                <span
                                                    onClick={togglePasswordVisibility}
                                                    aria-label={
                                                        showPassword
                                                            ? 'Hide password'
                                                            : 'Show password'
                                                    }
                                                >
                                                    <FontAwesomeIcon
                                                        icon={showPassword ? faEyeSlash : faEye}
                                                        onClick={togglePasswordVisibility}
                                                    />
                                                </span>
                                            </CInputGroupText>
                                        </CInputGroup>
                                        {formData.password.length > 0 && (
                                            <ul>
                                                {requirementsStatus.map((req) => (
                                                    <li
                                                        key={req.id}
                                                        className={`${req.passed ? 'd-none' : 'text-small text-danger'}`}
                                                    >
                                                        {req.text}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <CInputGroup className="mb-3">
                                            <CInputGroupText>
                                                <FontAwesomeIcon icon={faLock} />
                                            </CInputGroupText>
                                            <CFormInput
                                                id="repeat_password"
                                                type="password"
                                                placeholder="Repeat password"
                                                autoComplete="new-password"
                                                value={formData.repeat_password}
                                                onChange={(e) => handleInputChange(e)}
                                                required
                                            />
                                        </CInputGroup>
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
                                            </CButtonGroup>
                                        </div>
                                    </CForm>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    </CRow>
                )}
                <ReCAPTCHA
                    ref={recaptchaRef}
                    size="invisible"
                    sitekey={VITE_APP_RECAPTCHA_SITE_KEY}
                />
            </CContainer>
        </div>
    )
}

export default ForgotPassword
