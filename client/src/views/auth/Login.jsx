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
    CModal,
    CModalHeader,
    CModalBody,
    CModalFooter,
} from '@coreui/react'
import { useGoogleLogin } from '@react-oauth/google'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faEnvelope,
    faLock,
    faXmark,
    faQrcode,
    faEye,
    faEyeSlash,
} from '@fortawesome/free-solid-svg-icons'
import { faGithub, faGoogle, faMicrosoft } from '@fortawesome/free-brands-svg-icons'
import { QRCodeSVG } from 'qrcode.react'
import ReCAPTCHA from 'react-google-recaptcha'
import {
    VITE_APP_RECAPTCHA_SITE_KEY,
    VITE_APP_SESSION,
    VITE_APP_GITHUB_OAUTH_CLIENT_ID,
    VITE_APP_MICROSOFT_OAUTH_CLIENT_ID,
} from '../../config'

const Login = () => {
    const navigate = useNavigate()
    const recaptchaRef = React.useRef()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [loading, setLoading] = useState(true)
    const [showQR, setShowQR] = useState(false)
    const [error, setError] = useState({
        error: false,
        message: '',
    })
    const svgRef = React.useRef(null)
    const urlParams = new URLSearchParams(window.location.search)
    const url = urlParams.get('n') ? urlParams.get('n') : '/auth/verify'
    const [showPassword, setShowPassword] = useState(false)

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (credentialResponse) => {
            handleSubmit(null, 'google', credentialResponse.access_token)
        },
        onError: () => {
            setError({
                error: true,
                message: 'Please try again later',
            })
        },
    })

    const handleGithubLogin = () => {
        setLoading(true)
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${VITE_APP_GITHUB_OAUTH_CLIENT_ID}`
    }

    const handleMicrosoftLogin = () => {
        setLoading(true)
        window.location.href = `https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?client_id=${VITE_APP_MICROSOFT_OAUTH_CLIENT_ID}&response_type=code&redirect_uri=https://core1.axleshift.com/auth/microsoft/callback&response_mode=query&scope=openid%20profile%20email%20User.Read&state=12345`
    }

    useEffect(() => {
        if (cookies.get(VITE_APP_SESSION) !== undefined) return (window.location.href = url)
        setLoading(false)
    }, [url])

    const generateUUID = () => {
        const array = new Uint8Array(16)
        window.crypto.getRandomValues(array)
        array[6] = (array[6] & 0x0f) | 0x40
        // Set the 8th byte (variant) to 8, 9, A, or B
        array[8] = (array[8] & 0x3f) | 0x80

        const uuid = array.reduce((str, byte, index) => {
            if (index === 4 || index === 6 || index === 8 || index === 10) {
                str += '-'
            }
            str += byte.toString(16).padStart(2, '0')
            return str
        }, '')

        return uuid
    }

    const getUUID = () => {
        const _uuid = cookies.get('uuid')
        const uuid = _uuid ? _uuid : generateUUID()
        if (!_uuid) cookies.set('uuid', uuid, { expires: 30 })
        return uuid
    }

    const handleSubmit = async (e, type, credential) => {
        if (e) e.preventDefault()
        if (!navigator.geolocation)
            setError({
                error: true,
                message: 'Geolocation is not supported by this browser. Login failed!',
            })

        navigator.geolocation.getCurrentPosition(
            (position) => {
                login(e, type, credential, {
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
                    error: true,
                    message: errorMessage,
                })
                return true
            },
        )
    }

    const login = async (e, type, credential, location) => {
        const recaptcha = await recaptchaRef.current.executeAsync()
        setError({
            error: false,
            message: '',
        })
        setLoading(true)
        const formData = {}
        if (type === 'form') {
            formData.email = email
            formData.password = password
            formData.phoneNumber = phoneNumber
        } else if (type === 'google') {
            formData.credential = credential
        } else {
            setLoading(false)
            setError({
                error: true,
                message: 'Server is offline or restarting please wait',
            })
            return
        }
        formData.type = type
        formData.recaptcha_ref = recaptcha
        formData.location = JSON.stringify([location])

        axios
            .post(`/auth/login`, formData)
            .then((response) => {
                if (response.data.error)
                    return setError({
                        error: true,
                        message: response.data.error,
                    })

                cookies.set(VITE_APP_SESSION, response.data.token, { expires: 30 })
                window.location.href = url
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

    return (
        <div className="bg-dark min-vh-100 d-flex flex-row align-items-center">
            <div className="auth-bg" />
            <CContainer>
                {loading && (
                    <div className="loading-overlay">
                        <CSpinner color="primary" variant="grow" />
                    </div>
                )}
                {showQR && !loading && (
                    <CModal
                        visible={true}
                        onClose={() => setShowQR(false)}
                        alignment="center"
                        scrollable
                    >
                        <CModalHeader closeButton></CModalHeader>
                        <CModalBody>
                            <div
                                className="d-flex justify-content-center align-items-center"
                                ref={svgRef}
                            >
                                <QRCodeSVG
                                    value={() => getUUID()}
                                    className="border border-4 rounded-2"
                                />
                            </div>
                        </CModalBody>
                        <CModalFooter className="px-4">
                            Open Axleshift App and go to Settings &gt; Account &gt; Login using
                            QRCode
                        </CModalFooter>
                    </CModal>
                )}

                <CRow className="justify-content-center">
                    <CCol md={8} lg={6} xl={5} className="my-2">
                        <CCard className="p-1 p-sm-4 shadow">
                            <CCardBody>
                                {error.error && (
                                    <CAlert color="danger" className="d-flex align-items-center">
                                        <FontAwesomeIcon
                                            className="flex-shrink-0 me-2"
                                            icon={faXmark}
                                            size="xl"
                                        />
                                        <div>{error.message}</div>
                                    </CAlert>
                                )}
                                <CForm onSubmit={(e) => handleSubmit(e, 'form', null)}>
                                    <h1>Axleshift</h1>
                                    <p className="text-body-secondary">Sign In to your account</p>
                                    <CFormInput
                                        type="text"
                                        name="axle_pot"
                                        className="axle_pot"
                                        placeholder="Phone number"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                    />
                                    <CInputGroup className="mb-3">
                                        <CInputGroupText>
                                            <FontAwesomeIcon icon={faEnvelope} />
                                        </CInputGroupText>
                                        <CFormInput
                                            type="text"
                                            placeholder="Username or email"
                                            autoComplete="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </CInputGroup>
                                    <CInputGroup className="mb-3">
                                        <CInputGroupText>
                                            <FontAwesomeIcon icon={faLock} />
                                        </CInputGroupText>
                                        <CFormInput
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Password"
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <CInputGroupText>
                                            <span
                                                onClick={togglePasswordVisibility}
                                                aria-label={
                                                    showPassword ? 'Hide password' : 'Show password'
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    icon={showPassword ? faEyeSlash : faEye}
                                                    onClick={togglePasswordVisibility}
                                                />
                                            </span>
                                        </CInputGroupText>
                                    </CInputGroup>
                                    <p>
                                        <small>
                                            By continuing, you agree to our
                                            <a
                                                className="link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
                                                onClick={() =>
                                                    (window.location.href =
                                                        'https://axleshift.com/privacy-policy')
                                                }
                                            >
                                                {' '}
                                                Privacy Policy
                                            </a>
                                            ,
                                            <a
                                                className="link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
                                                onClick={() =>
                                                    (window.location.href =
                                                        'https://axleshift.com/refund-policy')
                                                }
                                            >
                                                {' '}
                                                Refund Policy{' '}
                                            </a>
                                            and
                                            <a
                                                className="link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
                                                onClick={() =>
                                                    (window.location.href =
                                                        'https://axleshift.com/terms-of-service')
                                                }
                                            >
                                                {' '}
                                                Terms of Service
                                            </a>
                                            .
                                        </small>
                                    </p>
                                    <div className="d-grid mb-3">
                                        <CButtonGroup>
                                            <CButton
                                                type="submit"
                                                color="primary"
                                                className="me-2 rounded"
                                            >
                                                Login
                                            </CButton>
                                            <CButton
                                                color="outline-primary"
                                                className="me-2 rounded"
                                                onClick={() => navigate(`/register?n=${url}`)}
                                            >
                                                Signup
                                            </CButton>
                                        </CButtonGroup>
                                    </div>
                                    <span className="small text-muted d-block mb-1">
                                        or continue with
                                    </span>
                                    <CButton
                                        color="outline-primary"
                                        className="me-2"
                                        onClick={handleGoogleLogin}
                                    >
                                        <FontAwesomeIcon icon={faGoogle} />
                                    </CButton>
                                    <CButton
                                        color="outline-primary"
                                        className="me-2"
                                        onClick={handleGithubLogin}
                                    >
                                        <FontAwesomeIcon icon={faGithub} />
                                    </CButton>
                                    <CButton
                                        color="outline-primary"
                                        className="me-2"
                                        onClick={handleMicrosoftLogin}
                                    >
                                        <FontAwesomeIcon icon={faMicrosoft} />
                                    </CButton>
                                    <div className="d-flex justify-content-end small">
                                        <a
                                            color="link"
                                            className="px-0 link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
                                            onClick={() => navigate('/forgot-password')}
                                        >
                                            Forgot password?
                                        </a>
                                    </div>
                                </CForm>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CContainer>
            <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={VITE_APP_RECAPTCHA_SITE_KEY} />
        </div>
    )
}

export default Login
