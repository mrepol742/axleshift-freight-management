import React, { useEffect, useState } from 'react'
import {
    CSpinner,
    CForm,
    CButton,
    CFormInput,
    CInputGroup,
    CInputGroupText,
    CFormCheck,
    CModal,
    CModalBody,
    CModalHeader,
    CModalTitle,
    CModalFooter,
} from '@coreui/react'
import ReCAPTCHA from 'react-google-recaptcha'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../components/AppToastProvider'
import { VITE_APP_RECAPTCHA_SITE_KEY } from '../../config.js'
import countries from '../book-now/fragments/countries.jsx'

const FormAddress = ({ data, callback }) => {
    const { formData, setFormData } = data
    const recaptchaRef = React.useRef()
    const navigate = useNavigate()
    const { addToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [modal, setModal] = useState(false)
    const form = useState(formData)

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (JSON.stringify(form) !== JSON.stringify(formData)) {
                event.preventDefault()
                event.returnValue = 'You have unsaved changes. Do you really want to leave?'
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [formData, form])

    const handleChange = (section, e) => {
        const { name, value } = e.target

        if (callback) {
            const updatedData = {
                ...formData,
                [section]: {
                    ...formData[section],
                    [name]: value,
                },
            }
            setFormData(updatedData)
            return callback(updatedData)
        }
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [name]: value,
            },
        }))
    }

    const toggleModal = () => {
        setModal(!modal)
    }

    const handleSubmit = async (e) => {
        if (callback) return
        e.preventDefault()
        const recaptcha = await recaptchaRef.current.executeAsync()
        const action = formData._id ? `/update/${formData._id}` : '/add'
        setLoading(true)
        axios
            .post(`/addresses${action}`, { ...formData, recaptcha_ref: recaptcha })
            .then((response) => {
                addToast(response.data.message)
                navigate('/my-addresses')
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

    const handleDelete = async (e) => {
        if (callback) return
        e.preventDefault()
        const recaptcha = await recaptchaRef.current.executeAsync()
        setLoading(true)
        axios
            .post(`/addresses/delete/${formData._id}`, { recaptcha_ref: recaptcha })
            .then((response) => {
                addToast(response.data.message)
                navigate(`/my-addresses`)
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
            <div className="d-block d-lg-flex gap-5">
                <div>
                    <h4>From</h4>
                    <CFormInput
                        type="text"
                        className="mb-3"
                        floatingLabel="First and Last Name"
                        name="name"
                        value={formData.from?.name}
                        onChange={(e) => handleChange('from', e)}
                        required
                    />
                    <CFormInput
                        type="text"
                        className="mb-3"
                        floatingLabel="Company"
                        name="company"
                        value={formData.from?.company}
                        onChange={(e) => handleChange('from', e)}
                        required
                    />
                    <CFormCheck
                        className="mb-3"
                        name="business_contract"
                        label="Business Contract"
                        checked={formData.from?.business_contract}
                        onChange={(e) => handleChange('from', e)}
                    />
                    <CFormInput
                        type="text"
                        className="mb-3"
                        floatingLabel="Country"
                        name="country"
                        value={formData.from?.country}
                        onChange={(e) => handleChange('from', e)}
                        required
                    />
                    <CFormInput
                        type="text"
                        className="mb-3"
                        floatingLabel="Address"
                        name="address"
                        value={formData.from?.address}
                        onChange={(e) => handleChange('from', e)}
                        required
                    />
                    <CFormInput
                        type="text"
                        className="mb-3"
                        floatingLabel="Address 2"
                        name="address2"
                        value={formData.from?.address2}
                        onChange={(e) => handleChange('from', e)}
                    />
                    <CFormInput
                        type="text"
                        className="mb-3"
                        floatingLabel="Address 3"
                        name="address3"
                        value={formData.from?.address3}
                        onChange={(e) => handleChange('from', e)}
                    />
                    <div className="d-block d-sm-flex gap-3">
                        <CFormInput
                            type="text"
                            className="mb-3"
                            floatingLabel="Zip Code"
                            name="zip_code"
                            value={formData.from?.zip_code}
                            onChange={(e) => handleChange('from', e)}
                            required
                        />
                        <CFormInput
                            type="text"
                            className="mb-3"
                            floatingLabel="City"
                            name="city"
                            value={formData.from?.city}
                            onChange={(e) => handleChange('from', e)}
                            required
                        />
                    </div>
                    <div className="d-block d-sm-flex gap-3">
                        <CFormInput
                            type="email"
                            className="mb-3"
                            floatingLabel="Email"
                            name="email"
                            value={formData.from?.email}
                            onChange={(e) => handleChange('from', e)}
                            required
                        />
                        <CFormInput
                            type="number"
                            className="mb-3"
                            floatingLabel="Phone number"
                            name="phone_number"
                            value={formData.from?.phone_number}
                            onChange={(e) => handleChange('from', e)}
                            required
                        />
                    </div>
                    <CFormInput
                        type="text"
                        className="mb-3"
                        floatingLabel="VAT/TAX ID"
                        name="vat_tax_id"
                        value={formData.from?.vat_tax_id}
                        onChange={(e) => handleChange('from', e)}
                    />
                </div>
                <div>
                    <h4>To</h4>
                    <CFormInput
                        type="text"
                        className="mb-3"
                        floatingLabel="Name"
                        name="name"
                        value={formData.to?.name}
                        onChange={(e) => handleChange('to', e)}
                        required
                    />
                    <CFormInput
                        type="text"
                        className="mb-3"
                        floatingLabel="Company"
                        name="company"
                        value={formData.to?.company}
                        onChange={(e) => handleChange('to', e)}
                        required
                    />
                    <CFormCheck
                        className="mb-3"
                        name="business_contract"
                        label="Business Contract"
                        checked={formData.to?.business_contract}
                        onChange={(e) => handleChange('to', e)}
                    />
                    <CFormInput
                        type="text"
                        className="mb-3"
                        floatingLabel="Country"
                        name="country"
                        value={formData.to?.country}
                        onChange={(e) => handleChange('to', e)}
                        required
                    />
                    <CFormInput
                        type="text"
                        className="mb-3"
                        floatingLabel="Address"
                        name="address"
                        value={formData.to?.address}
                        onChange={(e) => handleChange('to', e)}
                        required
                    />
                    <CFormInput
                        type="text"
                        className="mb-3"
                        floatingLabel="Address 2"
                        name="address2"
                        value={formData.to?.address2}
                        onChange={(e) => handleChange('to', e)}
                    />
                    <CFormInput
                        type="text"
                        className="mb-3"
                        floatingLabel="Address 3"
                        name="address3"
                        value={formData.to?.address3}
                        onChange={(e) => handleChange('to', e)}
                    />
                    <div className="d-block d-sm-flex gap-3">
                        <CFormInput
                            type="text"
                            className="mb-3"
                            floatingLabel="Zip Code"
                            name="zip_code"
                            value={formData.to?.zip_code}
                            onChange={(e) => handleChange('to', e)}
                            required
                        />
                        <CFormInput
                            type="text"
                            className="mb-3"
                            floatingLabel="City"
                            name="city"
                            value={formData.to?.city}
                            onChange={(e) => handleChange('to', e)}
                            required
                        />
                    </div>
                    <div className="d-block d-sm-flex gap-3">
                        <CFormInput
                            type="text"
                            className="mb-3"
                            floatingLabel="Email"
                            name="email"
                            value={formData.to?.email}
                            onChange={(e) => handleChange('to', e)}
                            required
                        />
                        <CFormInput
                            type="number"
                            className="mb-3"
                            floatingLabel="Phone number"
                            name="phone_number"
                            value={formData.to?.phone_number}
                            onChange={(e) => handleChange('to', e)}
                            required
                        />
                    </div>
                    <CFormInput
                        type="text"
                        className="mb-3"
                        floatingLabel="Type of ID"
                        name="id_type"
                        value={formData.to?.id_type}
                        onChange={(e) => handleChange('to', e)}
                        required
                    />
                    <CFormInput
                        type="text"
                        className="mb-3"
                        floatingLabel="ID Number"
                        name="id_number"
                        value={formData.to?.id_number}
                        onChange={(e) => handleChange('to', e)}
                        required
                    />
                </div>
            </div>
            {!callback && (
                <>
                    <div className="d-flex justify-content-between">
                        <div className="d-flex2 mt-4 mb-3">
                            <CButton
                                color="danger"
                                className="me-2 rounded"
                                onClick={(e) => setModal(true)}
                            >
                                Delete
                            </CButton>
                        </div>
                        <div className="d-flex mt-4 mb-3">
                            <CButton type="submit" color="primary" className="me-2 rounded">
                                Save
                            </CButton>
                            <CButton
                                type="button"
                                color="outline-secondary"
                                className="rounded"
                                onClick={(e) => navigate('/my-addresses')}
                            >
                                Cancel
                            </CButton>
                        </div>
                    </div>

                    <CModal
                        backdrop="static"
                        alignment="center"
                        visible={modal}
                        scrollable
                        aria-labelledby="delete-confirmation"
                    >
                        <CModalHeader onClose={toggleModal}>
                            <CModalTitle id="delete-confirmation">Confirm Delete</CModalTitle>
                        </CModalHeader>
                        <CModalBody>
                            Do you really want to delete this address?
                            <br />
                            <b className="small">
                                <u>This is irreversable!</u>
                            </b>
                        </CModalBody>
                        <CModalFooter>
                            <CButton color="secondary" onClick={toggleModal}>
                                Cancel
                            </CButton>
                            <CButton color="danger" onClick={handleDelete}>
                                Delete
                            </CButton>
                        </CModalFooter>
                    </CModal>
                    <ReCAPTCHA
                        ref={recaptchaRef}
                        size="invisible"
                        sitekey={VITE_APP_RECAPTCHA_SITE_KEY}
                    />
                </>
            )}
        </CForm>
    )
}

export default FormAddress

FormAddress.propTypes = {
    data: PropTypes.object.isRequired,
    callback: PropTypes.func,
}
