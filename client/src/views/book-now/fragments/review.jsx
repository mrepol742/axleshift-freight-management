import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CForm,
    CRow,
    CCol,
    CFormSwitch,
    CFormCheck,
    CFormSelect,
    CTabs,
    CTabList,
    CTab,
    CTabContent,
    CTabPanel,
    CButton,
    CFormInput,
    CCard,
    CModal,
    CModalBody,
    CCardBody,
    CModalFooter,
    CModalHeader,
    CModalTitle,
    CSpinner,
} from '@coreui/react'
import PropTypes from 'prop-types'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faEnvelope,
    faPrint,
    faCopy,
    faRotate,
    faAddressBook,
} from '@fortawesome/free-solid-svg-icons'
import ReCAPTCHA from 'react-google-recaptcha'
import { VITE_APP_RECAPTCHA_SITE_KEY } from '../../../config'
import AppPagination from '../../../components/AppPagination'
import { useToast } from '../../../components/AppToastProvider'
import Form from '../../my-addresses/Form'

// TODO: do rate stuff here
const Review = ({ data, shipmentRef }) => {
    const navigate = useNavigate()
    const { form, setForm } = data
    const formRef = React.useRef(null)
    const recaptchaRef = React.useRef()
    const { addToast } = useToast()
    const pdfRef = React.useRef()
    const [result, setResult] = useState([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [viewForm, setViewForm] = useState(false)
    const [modal, setModal] = useState(false)
    const [expectedDate, setExpectedDate] = useState('')

    const generatePDF = () => {
        pdfRef.current.style.display = 'none'
        const bgColor = getComputedStyle(document.body).backgroundColor

        html2canvas(shipmentRef.current, {
            scale: 2,
            backgroundColor: bgColor,
        })
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/png')
                const pdf = new jsPDF('p', 'mm', 'a4')
                const imgWidth = 210
                const imgHeight = (canvas.height * imgWidth) / canvas.width

                pdf.setFillColor(bgColor)
                pdf.rect(
                    0,
                    0,
                    pdf.internal.pageSize.getWidth(),
                    pdf.internal.pageSize.getHeight(),
                    'F',
                )

                pdf.addImage(imgData, 'PNG', 0, 10, imgWidth, imgHeight)
                pdf.save(`Shipment-${form.tracking_number ? form.tracking_number : Date.now()}.pdf`)
            })
            .catch((error) => console.error('Error generating PDF:', error))
            .finally(() => {
                pdfRef.current.style.display = 'block'
            })
    }

    const handleSubmit = async (action) => {
        const recaptcha = await recaptchaRef.current.executeAsync()
        setLoading(true)
        axios
            .post(action === 'book' ? `/freight/book` : `/freight/update/${form.tracking_number}`, {
                ...form,
                recaptcha_ref: recaptcha,
            })
            .then((response) => {
                if (response.data.error) return addToast(response.data.error)
                window.location.href = response.data.r_url
            })
            .catch((error) => {
                const message =
                    error.response?.data?.error ||
                    (error.message === 'network error'
                        ? 'Server is offline or restarting please wait'
                        : error.message)
                addToast(message)
            })
    }

    const totalWeight = (items) => {
        return items.reduce((acc, item) => acc + parseFloat(item.weight), 0)
    }

    const totalDimensions = (items) => {
        return items.reduce((acc, item) => {
            const quantity = item.quantity || 1
            return acc + (item.length * item.width * item.height * quantity) / 1000
        }, 0)
    }

    const price = (form) => {
        let amount = totalWeight(form.items) * totalDimensions(form.items) + 50
        if (!amount) return '$0'
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount)
    }

    const [showModal, setShowModal] = useState(false)

    const handleModalConfirm = () => {
        form.internal ? handleSubmit('update') : handleSubmit('book')
    }

    const handleShippingForm = async (address) => {
        setViewForm(false)
        if (form.selected_address !== address._id)
            setForm({
                ...form,
                from: [address.from],
                to: [address.to],
                selected_address: address._id,
            })
    }

    const handleCancelButton = async () => {
        const recaptcha = await recaptchaRef.current.executeAsync()
        setLoading(true)
        axios
            .post(`/freight/cancel/${form.tracking_number}`, {
                recaptcha_ref: recaptcha,
            })
            .then((response) => {
                addToast('Shipment has been cancelled.')
                window.location.reload()
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

    const toggleModal = () => {
        setModal(!modal)
    }

    useEffect(() => {
        const expectedDate = () => {
            if (form.expected_delivery_date && form.expected_delivery_date !== expectedDate) {
                setExpectedDate(new Date(form.expected_delivery_date).toDateString())
            }
        }

        expectedDate()
    }, [form.expected_delivery_date, expectedDate])

    useEffect(() => {
        const fetchShippingAddress = async (page) => {
            if (!showModal) return
            setLoading(true)
            axios
                .post(`/addresses/`, { page })
                .then((response) => {
                    setResult(response.data.data)
                    setTotalPages(response.data.totalPages)
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

        fetchShippingAddress(currentPage)
    }, [showModal, currentPage, addToast])

    useEffect(() => {
        const fetchAutoFill = async () => {
            if (form.selected_address) return
            const recaptcha = await recaptchaRef.current.executeAsync()
            setLoading(true)
            axios
                .post(`/addresses/find/`, {
                    from: form.from[0],
                    to: form.to[0],
                    recaptcha_ref: recaptcha,
                })
                .then((response) => {
                    if (!response.data.error)
                        setForm({
                            ...form,
                            to: [response.data.to],
                            from: [response.data.from],
                            selected_address: address._id,
                        })
                })
                .finally(() => setLoading(false))
        }

        fetchAutoFill()
    }, [form, setForm])

    return (
        <div ref={formRef}>
            <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={VITE_APP_RECAPTCHA_SITE_KEY} />
            <h3 className="text-primary mt-4" id="review">
                Review
            </h3>
            <CRow>
                <CCol md className="mb-4">
                    <CCard className="mb-2">
                        <CCardBody>
                            <div>
                                {!form.selected_address ? (
                                    <div className="text-center">
                                        <span className="d-block text-muted small">
                                            {' '}
                                            Click &quot;Choose&quot; to select an form from the
                                            addressess.
                                        </span>
                                        <CButton
                                            size="sm"
                                            className="btn btn-primary mt-2 me-2 rounded"
                                            onClick={() => fetchAutoFill()}
                                        >
                                            <FontAwesomeIcon icon={faRotate} /> Reload
                                        </CButton>
                                        <CButton
                                            size="sm"
                                            className="btn btn-primary mt-2 me-2 rounded"
                                            onClick={() =>
                                                window.open('/my-addresses/new', '_blank')
                                            }
                                        >
                                            <FontAwesomeIcon icon={faCopy} /> New
                                        </CButton>
                                        <CButton
                                            size="sm"
                                            className="btn btn-primary mt-2 rounded"
                                            onClick={() => setShowModal(true)}
                                        >
                                            <FontAwesomeIcon icon={faAddressBook} /> Choose
                                        </CButton>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="mb-2 mb-sm-0">
                                            <div className="mb-2">
                                                <h5 className="text-truncate">
                                                    {' '}
                                                    <span className="text-primary fw-medium text-uppercase me-1">
                                                        From
                                                    </span>{' '}
                                                    {form.from[0].name}
                                                </h5>
                                                <p className="text-muted text-truncate">
                                                    {form.from[0].phone_number} •{' '}
                                                    {form.from[0].address}
                                                    {', '}
                                                    {form.from[0].country}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="mb-2">
                                                <h5 className="text-truncate">
                                                    <span className="text-primary fw-medium text-uppercase me-1">
                                                        To
                                                    </span>
                                                    {form.to[0].name}
                                                </h5>
                                                <p className="text-muted text-truncate">
                                                    {form.to[0].phone_number} • {form.to[0].address}{' '}
                                                    {', '} {form.to[0].country}
                                                </p>
                                            </div>
                                        </div>
                                        <CButton
                                            size="sm"
                                            className="btn btn-small"
                                            onClick={() => setViewForm(true)}
                                        >
                                            View Shipping Form
                                        </CButton>
                                    </div>
                                )}
                            </div>
                        </CCardBody>
                    </CCard>
                    <CFormInput
                        type="text"
                        floatingLabel="Shipment Date"
                        className="mb-2"
                        value={expectedDate}
                        disabled
                    />
                    <CButton
                        ref={pdfRef}
                        size="sm"
                        className="btn btn-outline-primary mt-2 me-2 d-none"
                        onClick={generatePDF}
                    >
                        <FontAwesomeIcon icon={faPrint} className="me-2" />
                        Print Quotes
                    </CButton>
                </CCol>
                <CCol md>
                    <div className="d-flex justify-content-end flex-column">
                        <h1 className="text-primary">{price(form)}</h1>
                        <div className="d-flex">
                            {form.internal &&
                                !['to_receive', 'received', 'cancelled'].includes(form.status) && (
                                    <>
                                        <CButton
                                            size="sm"
                                            color="danger"
                                            className="me-2 rounded"
                                            onClick={(e) => setModal(true)}
                                        >
                                            Cancel
                                        </CButton>
                                        <CModal
                                            backdrop="static"
                                            alignment="center"
                                            visible={modal}
                                            scrollable
                                            aria-labelledby="delete-confirmation"
                                        >
                                            <CModalHeader onClose={toggleModal}>
                                                <CModalTitle id="delete-confirmation">
                                                    Confirm Cancel
                                                </CModalTitle>
                                            </CModalHeader>
                                            <CModalBody>
                                                Do you really want to cancel this shipment?
                                                <br />
                                                <b className="small">
                                                    <u>This is irreversable!</u>
                                                </b>
                                            </CModalBody>
                                            <CModalFooter>
                                                <CButton color="secondary" onClick={toggleModal}>
                                                    No
                                                </CButton>
                                                <CButton
                                                    color="danger"
                                                    onClick={handleCancelButton}
                                                >
                                                    Yes, I am sure
                                                </CButton>
                                            </CModalFooter>
                                        </CModal>
                                    </>
                                )}
                            {form.status === 'to_pay' && (
                                <CButton
                                    size="sm"
                                    className="btn btn-primary rounded px-4"
                                    onClick={handleModalConfirm}
                                    disabled={loading || !form.selected_address}
                                >
                                    {loading ? 'Loading...' : 'Ship Now'}
                                </CButton>
                            )}
                        </div>
                    </div>
                </CCol>
            </CRow>
            {viewForm && (
                <CModal
                    alignment="center"
                    fullscreen
                    scrollable
                    visible={viewForm}
                    onClose={() => setViewForm(false)}
                    aria-labelledby="ViewForm"
                >
                    <CModalHeader>
                        <CModalTitle>Shipping Form</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <Form
                            data={{
                                formData: {
                                    from: form.from[0],
                                    to: form.to[0],
                                    internal: true,
                                },
                                setFormData: setForm,
                            }}
                            callback={(updatedData) => {
                                if (updatedData === 'cancel') return setViewForm(false)
                                setForm({
                                    ...form,
                                    from: [updatedData.from],
                                    to: [updatedData.to],
                                })
                            }}
                        />
                    </CModalBody>
                </CModal>
            )}
            {showModal && (
                <CModal
                    alignment="center"
                    fullscreen="sm"
                    scrollable
                    visible={showModal}
                    onClose={() => setShowModal(false)}
                    aria-labelledby="ScheduleShipment"
                >
                    <CModalHeader>
                        <CModalTitle>Select Shipping Forms</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        {loading && (
                            <div className="loading-overlay">
                                <CSpinner color="primary" variant="grow" />
                            </div>
                        )}
                        {!loading &&
                            result &&
                            result.map((address, index) => (
                                <CCard
                                    key={index}
                                    className={`mb-3 ${form.selected_address === address._id ? 'active' : ''}`}
                                    onClick={() => handleShippingForm(address)}
                                    style={{
                                        cursor: 'pointer',
                                        border:
                                            form.selected_address === address._id
                                                ? '2px solid #0d6efd'
                                                : '1px solid #ced4da',
                                    }}
                                >
                                    <CCardBody>
                                        <div className="mb-2">
                                            <span className="fw-bold small">
                                                Address #{index + 1}
                                            </span>
                                            <div className="mb-2 mb-sm-0">
                                                <div className="mb-2">
                                                    <h5 className="text-truncate">
                                                        {address.from.name}
                                                    </h5>
                                                    <p className="text-muted text-wrap">
                                                        {address.from.phone_number} •{' '}
                                                        {address.from.address}
                                                        {', '}
                                                        {address.from.country}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="mb-2">
                                                    <h5 className="text-truncate">
                                                        {address.to.name}
                                                    </h5>
                                                    <p className="text-muted text-wrap">
                                                        {address.to.phone_number} •{' '}
                                                        {address.to.address} {', '}{' '}
                                                        {address.to.country}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CCardBody>
                                </CCard>
                            ))}
                        {totalPages > 1 && (
                            <AppPagination
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                totalPages={totalPages}
                                setTotalPages={setTotalPages}
                            />
                        )}
                    </CModalBody>
                </CModal>
            )}
        </div>
    )
}

export default Review

Review.propTypes = {
    data: PropTypes.object.isRequired,
    shipmentRef: PropTypes.object.isRequired,
}
