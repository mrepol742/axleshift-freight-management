import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    CCol,
    CRow,
    CSpinner,
    CButton,
    CButtonGroup,
    CModal,
    CModalHeader,
    CModalBody,
    CModalFooter,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQrcode } from '@fortawesome/free-solid-svg-icons'
import { QRCodeSVG } from 'qrcode.react'
import html2canvas from 'html2canvas'
import { Helmet } from 'react-helmet'
import ReCAPTCHA from 'react-google-recaptcha'
import { VITE_APP_RECAPTCHA_SITE_KEY } from '../../../config'
import { useToast } from '../../../components/AppToastProvider'

import { useUserProvider } from '../../../components/UserProvider'
import ShipmentInfo from '../../book-now/fragments/info'

const FreightInfo = () => {
    const { user } = useUserProvider()
    const recaptchaRef = React.useRef()
    const { addToast } = useToast()
    const [form, setForm] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [showQR, setShowQR] = useState(false)
    const svgRef = useRef(null)
    const navigate = useNavigate()
    const { id } = useParams()

    const handleInputChange = (e, section) => {
        const { id, value } = e.target
        form((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [id]: value,
            },
        }))
    }

    const handleQRDownload = () => {
        setShowQR(false)
        html2canvas(svgRef.current, { useCORS: true }).then((canvas) => {
            const imageURL = canvas.toDataURL('image/png')

            const link = document.createElement('a')
            link.href = imageURL
            link.download = `Shipment ${id}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        })
    }

    useEffect(() => {
        const fetchData = async () => {
            axios
                .get(`/freight/${id}`)
                .then((response) => setForm({ ...response.data, internal: true }))
                .catch((error) => {
                    console.error(error)
                    setError(true)
                })
                .finally(() => setLoading(false))
        }

        fetchData()
    }, [id])

    if (loading)
        return (
            <div className="loading-overlay">
                <CSpinner color="primary" variant="grow" />
            </div>
        )

    if (error)
        return (
            <CRow className="justify-content-center my-5">
                <CCol md={6}>
                    <div className="clearfix">
                        <h1 className="float-start display-3 me-4 text-danger">OOPS</h1>
                        <h4>There was no shipment found.</h4>
                        <p>Double check tracking number for any mistake.</p>
                    </div>
                </CCol>
            </CRow>
        )

    // i tried to resuse them like how she re--use u
    return (
        <div>
            <Helmet>
                <title>{id} - Shipment | Axleshift</title>
            </Helmet>
            <CModal visible={showQR} onClose={() => setShowQR(false)} alignment="center" scrollable>
                <CModalBody>
                    <div className="text-center small">
                        <span>{id}</span>
                    </div>
                    <div className="d-flex justify-content-center align-items-center">
                        <div ref={svgRef} className="d-inline-block">
                            <QRCodeSVG
                                value={id}
                                className="rounded-3 border border-3"
                                size={200}
                            />
                        </div>
                    </div>
                    <div className="d-flex justify-content-center align-items-center">
                        <CButton onClick={handleQRDownload} className="px-5 mt-3 bg-body-secondary">
                            Save
                        </CButton>
                    </div>
                </CModalBody>
            </CModal>
            <div className="d-flex flex-row justify-content-between align-items-center mb-4">
                <div className="d-flex">
                    <CButton size="sm" className=" rounded" onClick={(e) => setShowQR(true)}>
                        <FontAwesomeIcon
                            className="bg-body-secondary rounded p-2"
                            icon={faQrcode}
                        />
                    </CButton>
                    <span className="d-block">
                        <span className="text-primary fw-bold small">Tracking Number:</span>
                        <br />
                        {id}
                    </span>
                </div>
                <CButtonGroup className="mb-2 mb-sm-0">
                    {form.invoice_id && form.status !== 'to_pay' && (
                        <CButton
                            size="sm"
                            className="bg-body-secondary me-2 rounded"
                            onClick={(e) => navigate(`/invoices/${id}`)}
                        >
                            Invoice
                        </CButton>
                    )}
                    {form.documents_id && (
                        <CButton
                            size="sm"
                            className="bg-body-secondary me-2 rounded"
                            onClick={(e) => navigate(`/documents/${id}`)}
                        >
                            Documents
                        </CButton>
                    )}
                </CButtonGroup>
            </div>

            <ShipmentInfo data={{ form, setForm, loading, setLoading }} />
            <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={VITE_APP_RECAPTCHA_SITE_KEY} />
        </div>
    )
}

export default FreightInfo
