import React, { useState, useEffect } from 'react'
import { CCard, CCardBody, CButton, CSpinner } from '@coreui/react'
import ReCAPTCHA from 'react-google-recaptcha'
import { Helmet } from 'react-helmet'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import { VITE_APP_RECAPTCHA_SITE_KEY } from '../../../config'
import { useToast } from '../../../components/AppToastProvider'

const Maintenance = () => {
    const recaptchaRef = React.useRef()
    const { addToast } = useToast()
    const [loading, setLoading] = useState(true)
    const [maintenance, setMaintenance] = useState('off')

    const saveData = async () => {
        const recaptcha = await recaptchaRef.current.executeAsync()
        setLoading(true)
        axios
            .post(`/sec/management/maintenance`, {
                recaptcha_ref: recaptcha,
                mode: maintenance === 'on' ? 'off' : 'on',
            })
            .then((response) => {
                if (response.data.error) return addToast(response.data.error)
                addToast('Changes saved successfully', 'Success')
                setMaintenance(response.data.mode)
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

    useEffect(() => {
        const fetchData = async () => {
            axios
                .get(`/sec/management/maintenance`)
                .then((response) => setMaintenance(response.data.mode))
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

        fetchData()
    }, [addToast])

    if (loading)
        return (
            <div className="loading-overlay">
                <CSpinner color="primary" variant="grow" />
            </div>
        )

    return (
        <div>
            <Helmet>
                <title>Maintenance - Management | Axleshift</title>
            </Helmet>
            <h4>Maintenance notice</h4>
            <CCard>
                <CCardBody>
                    <p>
                        When enabled, it prevents users from interacting with the platform until
                        maintenance is complete.
                    </p>
                    <CButton
                        type="submit"
                        color="danger"
                        className="mt-4 d-block me-2 rounded"
                        onClick={saveData}
                    >
                        {maintenance === 'on' ? (
                            <>
                                <FontAwesomeIcon icon={faCircleExclamation} className="me-2" />{' '}
                                Disable maintenance
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faCircleExclamation} className="me-2" />{' '}
                                Enable maintenance
                            </>
                        )}
                    </CButton>
                </CCardBody>
            </CCard>
            <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={VITE_APP_RECAPTCHA_SITE_KEY} />
        </div>
    )
}

export default Maintenance
