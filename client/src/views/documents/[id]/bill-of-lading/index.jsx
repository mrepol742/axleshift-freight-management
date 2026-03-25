import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import {
    CSpinner,
    CCard,
    CCardBody,
    CCardTitle,
    CCardHeader,
    CRow,
    CCol,
    CButtonGroup,
    CButton,
    CTable,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CTableHead,
} from '@coreui/react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { PDFDocument } from 'pdf-lib'
import { QRCodeSVG } from 'qrcode.react'

const BillOfLading = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState(null)
    const billofLadingRef = React.useRef()

    const generatePDF = () => {
        const bgColor = getComputedStyle(document.body).backgroundColor

        html2canvas(billofLadingRef.current, {
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
                // pdf.save(`Bill-Of-Lading-${id}.pdf`)

                const pdfData = pdf.output('arraybuffer')

                const pdfDoc = await PDFDocument.load(pdfData)
                pdfDoc.setTitle(`Bill-Of-Lading-${id}`)
                pdfDoc.setAuthor('Axleshift (https://core1.axleshift.com)')
                pdfDoc.setSubject(`Bill of Lading for shipment #${id}`)
                pdfDoc.setProducer('Axleshift Automated PDF Generator')
                pdfDoc.setCreator(
                    `Axleshift (https://core1.axleshift.com/documents/${id}/bill-of-lading)`,
                )
                const pdfBytes = await pdfDoc.save()
                const blob = new Blob([pdfBytes], { type: 'application/pdf' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `Bill-Of-Lading-${id}.pdf`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
            })
            .catch((error) => console.error('Error generating PDF:', error))
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [freightResponse] = await Promise.all([axios.get(`/freight/${id}`)])
                setFormData(freightResponse.data)
            } catch (error) {
                console.error(error)
                setError(true)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    if (loading)
        return (
            <div className="loading-overlay">
                <CSpinner color="primary" variant="grow" />
            </div>
        )

    if (!formData)
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

    return (
        <>
            <Helmet>
                <title>{id} - Bill of Lading - Documents | Axleshift</title>
            </Helmet>
            <div className="d-flex flex-row justify-content-between align-items-center mb-4">
                <span className="d-block"></span>
                <CButtonGroup className="mb-2 mb-sm-0">
                    <CButton className="bg-body-secondary me-2 rounded" onClick={generatePDF}>
                        Download PDF
                    </CButton>
                </CButtonGroup>
            </div>
            <div className="mb-3 font-monospace" ref={billofLadingRef}>
                <CCard>
                    <CCardHeader className="text-center">
                        <CCardTitle className="text-uppercase fw-bold fs-3">
                            Bill of Lading
                        </CCardTitle>
                    </CCardHeader>
                    <CCardBody>
                        <CRow>
                            <CCol md={6}>
                                <CRow>
                                    <CCol md={3}>
                                        <strong>Shipment Number:</strong>
                                    </CCol>
                                    <CCol>
                                        <QRCodeSVG
                                            value={id}
                                            className="rounded-3 m-1"
                                            size={100}
                                        />
                                        <span className="d-block">{id}</span>
                                    </CCol>
                                </CRow>
                                <CRow>
                                    <CCol md={3}>
                                        <strong>Shipper:</strong>
                                    </CCol>
                                    <CCol>
                                        {formData.from[0].name}
                                        <br />
                                        <span>{formData.from[0].email}</span>
                                        <br />
                                        <span>{formData.from[0].phone_number}</span>
                                    </CCol>
                                </CRow>
                                <CRow>
                                    <CCol md={3}>
                                        <strong>Receiver:</strong>
                                    </CCol>
                                    <CCol>
                                        {formData.to[0].name}
                                        <br />
                                        <span>{formData.to[0].email}</span>
                                        <br />
                                        <span>{formData.to[0].phone_number}</span>
                                    </CCol>
                                </CRow>
                                <CRow>
                                    <CCol md={3}>
                                        <strong>Carrier:</strong>
                                    </CCol>
                                    <CCol>
                                        Coming soon
                                        <br />
                                        <span>Coming soon</span>
                                        <br />
                                        <span>Coming soon</span>
                                    </CCol>
                                </CRow>
                            </CCol>
                            <CCol md={6}>
                                <p>
                                    <strong>Origin:</strong> {formData.to[0].address}{' '}
                                    {formData.to[0].city}
                                </p>
                                <p>
                                    <strong>Destination:</strong> {formData.to[0].address}{' '}
                                    {formData.to[0].city}
                                </p>
                                <p>
                                    <strong>Date:</strong>{' '}
                                    {new Date(formData.created_at).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: '2-digit',
                                        year: 'numeric',
                                    })}
                                </p>
                                <p>
                                    <strong>Mode of Transport:</strong> Coming soon
                                </p>
                            </CCol>
                        </CRow>
                        <CRow className="row mt-4">
                            <CCol md={12}>
                                <h6>Item Details</h6>
                                <CTable
                                    stripedColumns
                                    bordered
                                    hover
                                    responsive
                                    className="table-even-width"
                                >
                                    <CTableHead>
                                        <CTableRow>
                                            <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                                                #
                                            </CTableHeaderCell>
                                            <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                                                Height
                                            </CTableHeaderCell>
                                            <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                                                Width
                                            </CTableHeaderCell>
                                            <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                                                Length
                                            </CTableHeaderCell>
                                            <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                                                Weight
                                            </CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {formData.items.map((item, index) => (
                                            <CTableRow key={index}>
                                                <CTableDataCell>{index + 1}</CTableDataCell>
                                                <CTableDataCell>{item.height} cm</CTableDataCell>
                                                <CTableDataCell>{item.width} cm</CTableDataCell>
                                                <CTableDataCell>{item.length} cm</CTableDataCell>
                                                <CTableDataCell>{item.weight} kg</CTableDataCell>
                                            </CTableRow>
                                        ))}
                                    </CTableBody>
                                </CTable>
                            </CCol>
                        </CRow>
                        <p>
                            <strong>Contains Documents:</strong>{' '}
                            {formData.contains_documents ? 'Yes' : 'No'}
                            <br />
                            <strong>Contains Danger Goods:</strong>{' '}
                            {formData.contains_danger_goods ? 'Yes' : 'No'}
                        </p>
                    </CCardBody>
                </CCard>
            </div>
        </>
    )
}

export default BillOfLading
