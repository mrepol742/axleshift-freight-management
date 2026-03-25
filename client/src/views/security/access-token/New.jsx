import React, { useEffect, useState } from 'react'
import {
    CFormInput,
    CForm,
    CRow,
    CCol,
    CCard,
    CButton,
    CSpinner,
    CCardBody,
    CAlert,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import ReCAPTCHA from 'react-google-recaptcha'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faCopy,
    faEye,
    faEyeSlash,
    faPlus,
    faTrash,
    faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { VITE_APP_RECAPTCHA_SITE_KEY } from '../../../config'
import { useToast } from '../../../components/AppToastProvider'
import AppPagination from '../../../components/AppPagination'
import parseTimestamp from '../../../utils/Timestamp'

const NewAccessToken = () => {
    const navigate = useNavigate()
    const { addToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [disabledAdd, setDisabledAdd] = useState(false)
    const recaptchaRef = React.useRef()
    const [result, setResult] = useState({
        note: '',
        whitelist_ip: [''],
    })

    const handleAddIp = () => {
        if (!Array.isArray(result.whitelist_ip))
            return setResult((prev) => ({
                ...prev,
                whitelist_ip: [''],
            }))
        if (result.whitelist_ip.length < 6)
            return setResult((prev) => ({
                ...prev,
                whitelist_ip: [...prev.whitelist_ip, ''],
            }))
        addToast('Max number of whitelisted ip address reached')
    }

    const handleIpChange = (index, value) => {
        const newInputs = [...result.whitelist_ip]
        newInputs[index] = value

        setResult((prevResult) => ({
            ...prevResult,
            whitelist_ip: newInputs,
        }))
    }

    const handleDelete = (index) => {
        if (result.whitelist_ip.length === 1) {
            addToast('Cannot delete the only IP address in the whitelist')
            return
        }
        const newInputs = result.whitelist_ip.filter((_, i) => i !== index)
        setResult((prevResult) => ({
            ...prevResult,
            whitelist_ip: newInputs,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const recaptcha = await recaptchaRef.current.executeAsync()
        setLoading(true)
        axios
            .post(`/auth/token/new`, {
                ...result,
                recaptcha_ref: recaptcha,
            })
            .then((response) => {
                if (response.data.error) return addToast(response.data.error)
                navigate('/security/access-token')
                setTimeout(() => {
                    navigate('/security/access-token', {
                        state: { token: response.data.token },
                    })
                }, 1500)
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

    if (loading)
        return (
            <div className="loading-overlay">
                <CSpinner color="primary" variant="grow" />
            </div>
        )

    return (
        <CForm onSubmit={handleSubmit}>
            <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={VITE_APP_RECAPTCHA_SITE_KEY} />
            <h4>New Access Token</h4>
            <p className="text-muted">This can be used to authenticate with the API via HTTPS.</p>
            <CFormInput
                type="text"
                id="note"
                name="note"
                label="Note"
                value={result.note}
                onChange={(e) => setResult({ ...result, note: e.target.value })}
            />
            <small className="text-muted">Whats this token for?</small>
            <div
                className="mt-3"
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <h4>Whitelist IP</h4>
                <CButton
                    size="sm"
                    className="text-white ms-auto"
                    onClick={handleAddIp}
                    disabled={disabledAdd}
                >
                    <FontAwesomeIcon icon={faPlus} /> Add
                </CButton>
            </div>

            {result.whitelist_ip && result.whitelist_ip.length !== 0 && (
                <CCard className="mb-3">
                    <CCardBody>
                        {result.whitelist_ip.map((input, index) => (
                            <div className="d-flex mb-2" key={index}>
                                <CFormInput
                                    value={input}
                                    onChange={(e) => handleIpChange(index, e.target.value)}
                                    placeholder={`192.168.0.${index + 1}`}
                                />
                                <CButton
                                    color="danger"
                                    className="text-white ms-2"
                                    onClick={(e) => handleDelete(index)}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </CButton>
                            </div>
                        ))}
                    </CCardBody>
                </CCard>
            )}
            <div className="d-flex mt-4">
                <CButton type="submit" color="primary" className="me-2 rounded">
                    Generate
                </CButton>
                <CButton
                    type="button"
                    color="outline-secondary"
                    className="rounded"
                    onClick={(e) => navigate('/security/access-token')}
                >
                    Cancel
                </CButton>
            </div>
        </CForm>
    )
}

export default NewAccessToken
