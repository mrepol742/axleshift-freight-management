import React, { useEffect, useState } from 'react'
import {
    CForm,
    CFormInput,
    CFormLabel,
    CFormTextarea,
    CInputGroup,
    CButton,
    CInputGroupText,
    CSpinner,
} from '@coreui/react'
import ReCAPTCHA from 'react-google-recaptcha'
import { Filter } from 'bad-words'
import { VITE_APP_RECAPTCHA_SITE_KEY } from '../../config'
import { useToast } from '../../components/AppToastProvider'

const Email = () => {
    const filter = new Filter()
    const [formData, setFormData] = useState({
        email: '',
        subject: '',
        message: '',
    })
    const { addToast } = useToast()
    const [loading, setLoading] = useState(false)
    const recaptchaRef = React.useRef()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const recaptcha = await recaptchaRef.current.executeAsync()
        setLoading(true)
        const { email, subject, message } = formData
        axios
            .post(`/mail/send`, {
                email,
                subject: filter.clean(subject),
                message: filter.clean(message),
                recaptcha_ref: recaptcha,
            })
            .then((response) => {
                if (response.data.error) return addToast(response.data.error)
                addToast(response.data.message)
                setFormData({
                    email: '',
                    subject: '',
                    message: '',
                })
            })
            .catch((error) => {
                const message =
                    error.response?.data?.error ||
                    (error.message === 'network error'
                        ? 'Server is offline or restarting please wait'
                        : error.message)
                addToast(message)
            })
            .finally(() => setLoading(false))
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }))
    }

    useEffect(() => {
        function resetEmail() {
            const urlParams = new URLSearchParams(window.location.search)
            const email = urlParams.get('email')
            if (email)
                setFormData({
                    email: email,
                    subject: '',
                    message: '',
                })
        }

        resetEmail()
    }, [])

    if (loading)
        return (
            <div className="loading-overlay">
                <CSpinner color="primary" variant="grow" />
            </div>
        )

    return (
        <CForm onSubmit={handleSubmit} className="mx-auto p-4">
            <h1 className="text-center mb-4">Send an Email</h1>
            <CFormInput
                type="text"
                id="emailInput"
                name="email"
                floatingClassName="mb-1"
                floatingLabel="Email Address"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
            />
            <div className="text-muted mb-3 small">
                <strong>Note:</strong> Use <code>all</code> to send to everyone, <code>user</code>{' '}
                for users only,
                <code>email</code> for a specific email, <code>admin</code> for admins, and
                <code>super admin</code> for super admins.
            </div>
            <CFormInput
                type="text"
                id="subjectInput"
                name="subject"
                floatingClassName="mb-3"
                floatingLabel="Subject"
                maxLength={50}
                placeholder="Enter the subject"
                value={formData.subject}
                onChange={handleChange}
                required
            />
            <CFormTextarea
                id="messageInput"
                name="message"
                className="mb-3"
                maxLength={500}
                placeholder="Enter your message here"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
            />
            <div className="text-center">
                <CButton color="primary" type="submit" className="mb-3 px-4">
                    Send Email
                </CButton>
            </div>
            <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={VITE_APP_RECAPTCHA_SITE_KEY} />
        </CForm>
    )
}

export default Email
