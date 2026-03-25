import React, { useEffect, useState } from 'react'
import {
    CFormInput,
    CFormSelect,
    CRow,
    CCol,
    CSpinner,
    CButton,
    CContainer,
    CModal,
    CModalHeader,
    CModalBody,
    CModalTitle,
    CModalFooter,
    CFormCheck,
} from '@coreui/react'
import ReCAPTCHA from 'react-google-recaptcha'
import { VITE_APP_RECAPTCHA_SITE_KEY } from '../../config'
import { useToast } from '../../components/AppToastProvider'

const Webhooks = () => {
    const recaptchaRef = React.useRef()
    const { addToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [WebhooksLocationList, setWebhooksLocationList] = useState([])
    const [WebhooksLocationListCopy, setWebhooksLocationListCopy] = useState([])
    const [modal, setModal] = useState(false)

    const saveData = async () => {
        const recaptcha = await recaptchaRef.current.executeAsync()
        setLoading(true)
        axios
            .post(`/sec/webhooks`, { recaptcha_ref: recaptcha, WebhooksLocationList })
            .then((response) => {
                if (response.data.error) return addToast(response.data.error)
                addToast('Webhooks updated successfully')
                setWebhooksLocationListCopy(WebhooksLocationList)
            })
            .catch((error) => {
                const message =
                    error.response?.data?.error ||
                    error.message ||
                    'Server is offline or restarting please wait'
                addToast(message)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        const fetchData = async () => {
            axios
                .get(`/sec/webhooks`)
                .then((response) => {
                    setWebhooksLocationList(response.data)
                    setWebhooksLocationListCopy(response.data)
                })
                .catch((error) => {
                    const message =
                        error.response?.data?.error ||
                        error.message ||
                        'Server is offline or restarting please wait'
                    addToast(message)
                })
                .finally(() => setLoading(false))
        }

        fetchData()
    }, [addToast])

    const handleAddWebhooks = () => {
        setWebhooksLocationList([...WebhooksLocationList, { url: '', checked: false }])
    }

    const handleWebhooksChange = (index, value, type) => {
        const newWebhooksLocationList = [...WebhooksLocationList]
        newWebhooksLocationList[index][type] = value
        setWebhooksLocationList(newWebhooksLocationList)
    }

    const handleCheckboxChange = (index, checked) => {
        const newWebhooksLocationList = [...WebhooksLocationList]
        newWebhooksLocationList[index].checked = checked
        setWebhooksLocationList(newWebhooksLocationList)
    }

    const promptDeleteModal = () => {
        const selectedItems = WebhooksLocationList.filter((item) => item.checked)
        if (selectedItems.length === 0)
            return addToast('Please select at least one Webhook to delete.')
        setModal(true)
    }

    const handleDeleteWebhooks = () => {
        setModal(false)
        setWebhooksLocationList(WebhooksLocationList.filter((item) => !item.checked))
    }

    if (loading)
        return (
            <div className="loading-overlay">
                <CSpinner color="primary" variant="grow" />
            </div>
        )

    return (
        <div>
            <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={VITE_APP_RECAPTCHA_SITE_KEY} />

            <CRow className="align-items-center mb-2">
                <CCol>
                    <h4 className="mb-0">Webhooks</h4>
                </CCol>
                <CCol className="text-right d-flex justify-content-end">
                    <CButton color="primary" onClick={handleAddWebhooks}>
                        New
                    </CButton>
                    <CButton color="danger" onClick={promptDeleteModal} className="ms-2">
                        Delete
                    </CButton>
                </CCol>
            </CRow>
            {WebhooksLocationList.length === 0 && WebhooksLocationListCopy.length === 0 && (
                <CContainer className="my-5">
                    <div className="text-center">
                        <div className="text-body-secondary">
                            <h1 className="d-block text-danger">No Webhooks added yet.</h1>
                            <span>Please click &quot;New&quot; to add a Webhook.</span>
                        </div>
                    </div>
                </CContainer>
            )}
            {WebhooksLocationList.map((item, index) => (
                <div key={index} className="d-block d-md-flex mb-2 gap-2">
                    <CFormCheck
                        className="me-3"
                        checked={item.checked}
                        onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                    />
                    <CFormInput
                        type="text"
                        value={item.url}
                        floatingLabel="URL"
                        onChange={(e) => handleWebhooksChange(index, e.target.value, 'url')}
                        className="me-2 mb-2 mb-md-0"
                    />
                    <CFormInput
                        type="text"
                        floatingLabel="Token"
                        value={item.token}
                        onChange={(e) => handleWebhooksChange(index, e.target.value, 'token')}
                        className="me-2 mb-2 mb-md-0"
                    />
                    <CFormSelect
                        value={item.action}
                        floatingLabel="Action"
                        onChange={(e) => handleWebhooksChange(index, e.target.value, 'action')}
                        className="me-2 mb-2 mb-md-0"
                    >
                        <option value="">Choose</option>
                        <option value="all">All</option>
                        <option value="invoices">Invoices</option>
                        <option value="shipments">Shipments</option>
                        <option value="documents">Documents</option>
                    </CFormSelect>
                </div>
            ))}
            <CButton
                color="primary"
                onClick={saveData}
                className="mb-4"
                disabled={
                    WebhooksLocationList.length === 0 && WebhooksLocationListCopy.length === 0
                }
            >
                Apply all changes
            </CButton>
            <CModal
                alignment="center"
                scrollable
                visible={modal}
                onClose={() => setModal(false)}
                aria-labelledby="M"
            >
                <CModalHeader>
                    <CModalTitle>Confirm Delete?</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <ul>
                        {WebhooksLocationList.filter((item) => item.checked).map((item, index) => (
                            <li key={index}>{item.url}</li>
                        ))}
                    </ul>
                    Are you sure you want to delete the selected Webhooks? This action cannot be
                    undone.
                </CModalBody>
                <CModalFooter className="d-flex justify-content-end">
                    <CButton color="secondary" onClick={handleDeleteWebhooks}>
                        Delete
                    </CButton>
                    <CButton
                        color="primary"
                        onClick={() => {
                            setModal(false)
                        }}
                        className="ms-2"
                    >
                        Cancel
                    </CButton>
                </CModalFooter>
            </CModal>
        </div>
    )
}

export default Webhooks
