import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CSpinner, CRow, CCol, CButton } from '@coreui/react'
import jsPDF from 'jspdf'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faPhone, faLocationDot } from '@fortawesome/free-solid-svg-icons'
import html2canvas from 'html2canvas'
import { Helmet } from 'react-helmet'
import { PDFDocument } from 'pdf-lib'
import { QRCodeSVG } from 'qrcode.react'
import { VITE_APP_NODE_ENV } from '../../../config'
import { useToast } from '../../../components/AppToastProvider'

const Receipt = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { addToast } = useToast()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)
    const invoiceRef = React.useRef()
    const pdfRef = React.useRef()

    const generatePDF = () => {
        pdfRef.current.style.display = 'none'
        const bgColor = getComputedStyle(document.body).backgroundColor

        html2canvas(invoiceRef.current, {
            scale: 2,
            backgroundColor: bgColor,
        })
            .then(async (canvas) => {
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
                // pdf.save(`Invoice-${id}.pdf`)
                const pdfData = pdf.output('arraybuffer')

                const pdfDoc = await PDFDocument.load(pdfData)
                pdfDoc.setTitle(`Invoice-${id}`)
                pdfDoc.setAuthor('Axleshift (https://core1.axleshift.com)')
                pdfDoc.setSubject(`Invoice for shipment #${id}`)
                pdfDoc.setProducer('Axleshift Automated PDF Generator')
                pdfDoc.setCreator(`Axleshift (https://core1.axleshift.com/invioces/${id})`)
                const pdfBytes = await pdfDoc.save()
                const blob = new Blob([pdfBytes], { type: 'application/pdf' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `Invoice-${id}.pdf`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
            })
            .catch((error) => console.error('Error generating PDF:', error))
            .finally(() => {
                pdfRef.current.style.display = 'block'
            })
    }

    useEffect(() => {
        const fetchData = async () => {
            axios
                .get(`/invoices/${id}`)
                .then((response) => setData(response.data))
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

    if (!data)
        return (
            <CRow className="justify-content-center my-5">
                <CCol md={6}>
                    <div className="clearfix">
                        <h1 className="float-start display-3 me-4 text-danger">OOPS</h1>
                        <h4>There was no shipment invoice found.</h4>
                        <p>Double check tracking number for any mistake.</p>
                    </div>
                </CCol>
            </CRow>
        )

    return (
        <div ref={invoiceRef}>
            <Helmet>
                <title>{id} - Invoice | Axleshift</title>
            </Helmet>
            <div className="font-monospace">
                <h1 className="text-uppercase fw-bold text-center">Axleshift</h1>
                <p className="text-center">
                    <FontAwesomeIcon icon={faLocationDot} className="me-1" /> 4108 IM Bestlink
                    College of the Phillippines
                    <br />
                    <FontAwesomeIcon icon={faEnvelope} className="me-1" /> axleshift@gmail.com
                    <br />
                    <FontAwesomeIcon icon={faPhone} className="me-1" /> +63 912 345 6789
                </p>
                <div className="bg-body-secondary p-4 mb-1">
                    <span className="d-block">
                        <strong>Invoice ID</strong>: {data.invoice_id}
                    </span>
                    <span className="d-block">
                        <strong>Tracking Number</strong>: {data.freight_tracking_number}
                    </span>
                    {data.freight_details.is_import === true ? (
                        <span>
                            <strong>Name</strong>: {data.freight_details.to[0].name}
                        </span>
                    ) : (
                        <span>
                            <strong>Name</strong>: {data.freight_details.from[0].name}
                        </span>
                    )}
                    <br />
                    <br />
                    {data.freight_details.is_import === true ? (
                        <>
                            <span className="d-block">{data.freight_details.to[0].address}</span>
                            <span className="d-block">
                                {data.freight_details.to[0].city}{' '}
                                {data.freight_details.to[0].zip_code}
                            </span>
                            <span>{data.freight_details.to[0].country}</span>
                        </>
                    ) : (
                        <>
                            <span className="d-block">{data.freight_details.from[0].address}</span>
                            <span className="d-block">
                                {data.freight_details.from[0].city}{' '}
                                {data.freight_details.from[0].zip_code}
                            </span>
                            <span>{data.freight_details.from[0].country}</span>
                        </>
                    )}
                    <div className="mb-4" />
                    {data.status === 'PAID' && (
                        <>
                            <div className="d-flex justify-content-between">
                                <strong>Date Paid</strong>
                                <span className="flex-grow-1 mx-3 border-bottom border-secondary mb-2 border-opacity-25"></span>
                                <span>{new Date(data.updated_at).toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <strong>Payment Method</strong>
                                <span className="flex-grow-1 mx-3 border-bottom border-secondary mb-2 border-opacity-25"></span>
                                <span>{data.payment_method}</span>
                            </div>
                        </>
                    )}
                    <div className="d-flex justify-content-between">
                        <strong>Amount Due</strong>
                        <span className="flex-grow-1 mx-3 border-bottom border-secondary mb-2 border-opacity-25"></span>
                        <span>
                            {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: data.currency,
                            }).format(data.amount)}
                        </span>
                    </div>
                </div>
            </div>
            <div className="d-flex justify-content-between p-2 small mb-2">
                <small className="d-block">
                    This invoice has been issued to{' '}
                    {data.freight_details.is_import === true
                        ? data.freight_details.to[0].email
                        : data.freight_details.from[0].email}
                    <br />
                    in reference to shipment {id}.
                    <br />
                    {VITE_APP_NODE_ENV === 'production'
                        ? 'https://core1.axleshift.com'
                        : 'http://localhost:3000'}
                    /invoices/{id}
                </small>
                <QRCodeSVG value={id} className="rounded-3 m-1" size={100} />
            </div>
            <div className="d-flex">
                {data.status === 'PENDING' && (
                    <CButton
                        className="btn btn-primary px-4 mb-3 me-2"
                        onClick={(e) =>
                            (window.location.href = `https://checkout-staging.xendit.co/web/${data.invoice_id}`)
                        }
                    >
                        PAY NOW
                    </CButton>
                )}
                <CButton className="btn btn-primary px-4 mb-3" ref={pdfRef} onClick={generatePDF}>
                    Download PDF
                </CButton>
            </div>
        </div>
    )
}

export default Receipt
