import React, { useState, useEffect } from 'react'
import {
    CCard,
    CButton,
    CFormInput,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CCardBody,
    CRow,
    CCol,
    CSpinner,
    CForm,
    CModal,
    CModalBody,
    CModalHeader,
    CModalTitle,
} from '@coreui/react'
import { Helmet } from 'react-helmet'
import { useParams, useNavigate } from 'react-router-dom'
import ReCAPTCHA from 'react-google-recaptcha'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile } from '@fortawesome/free-solid-svg-icons'
import { useToast } from '../../../components/AppToastProvider'
import { VITE_APP_RECAPTCHA_SITE_KEY } from '../../../config.js'
import { useUserProvider } from '../../../components/UserProvider.jsx'

const Document = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useUserProvider()
    const [loading, setLoading] = useState(true)
    const { addToast } = useToast()
    const recaptchaRef = React.useRef()
    const [documents, setDocuments] = useState(null)
    const [exportLicense, setExportLicense] = useState(null)
    const [certificateOfOrigin, setCertificateOfOrigin] = useState(null)
    const [isActionVisible, setIsActionVisible] = useState(false)
    const [preview, setPreview] = useState(null)
    const [file, setFile] = useState([])

    const handleFileUpload = (event, index) => {
        const file = event.target.files[0]
        if (file && file.size > 25 * 1024 * 1024) {
            addToast('File size exceeds 25MB limit. Please upload a smaller file.')
            event.target.value = null
            return
        }
        if (file) {
            const newDocs = [...documents]
            newDocs[index] = { ...newDocs[index], status: 'under_review' }
            setDocuments(newDocs)
            if (index === 0) setExportLicense(file)
            if (index === 1) setCertificateOfOrigin(file)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const recaptcha = await recaptchaRef.current.executeAsync()
        setLoading(true)
        const formData = new FormData()
        formData.append('exportLicense', exportLicense)
        formData.append('certificateOfOrigin', certificateOfOrigin)
        formData.append('recaptcha_ref', recaptcha)

        axios
            .post(`/documents/${id}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then((response) => {
                setDocuments(response.data.data)
                setFile(response.data.data.documents.filter((doc) => doc.status !== 'generated'))
                addToast('Documents uploaded successfully!', 'success')
            })
            .catch((error) => {
                const message =
                    error.response?.data?.error ||
                    (error.message === 'network error'
                        ? 'Server is offline or restarting please wait'
                        : error.message)
                addToast(message, 'danger')
            })
            .finally(() => setLoading(false))
    }

    const previewDocument = (id, file) => {
        if (/bill-of-lading-AX-[0-9]/.test(file)) return navigate(`/documents/${id}/bill-of-lading`)
        setIsActionVisible(true)
        axios
            .post(`/documents/file/${id}`, {
                file: file,
            })
            .then((response) => {
                if (response.data.error) return addToast(response.data.error)
                setPreview(response.data)
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

    const handleRequireCOOEL = async () => {
        setLoading(true)
        axios
            .post(`/documents/cooel/${id}`, {
                is_enabled: file.length > 0 ? false : true,
            })
            .then((response) => {
                if (response.data.error) return addToast(response.data.error)
                setDocuments(response.data.data)
                setFile(response.data.data.filter((doc) => doc.status !== 'generated'))
                addToast(
                    file.length > 0 ? 'Documents has been removed' : 'Documents has been added',
                    'success',
                )
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
        const fetchDocuments = async () => {
            axios
                .get(`/documents/${id}`)
                .then((response) => {
                    setDocuments(response.data.documents)
                    setFile(response.data.documents.filter((doc) => doc.status !== 'generated'))
                })
                .finally(() => setLoading(false))
        }

        fetchDocuments()
    }, [id])

    if (loading)
        return (
            <div className="loading-overlay">
                <CSpinner color="primary" variant="grow" />
            </div>
        )

    if (!documents)
        return (
            <CRow className="justify-content-center my-5">
                <CCol md={6}>
                    <div className="clearfix">
                        <h1 className="float-start display-3 me-4 text-danger">OOPS</h1>
                        <h4>There was no shipment documents found.</h4>
                        <p>Double check tracking number for any mistake.</p>
                    </div>
                </CCol>
            </CRow>
        )

    return (
        <>
            <Helmet>
                <title>{id} - Documents | Axleshift</title>
            </Helmet>
            <CForm onSubmit={handleSubmit}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h2>Documents</h2>
                        <span className="text-muted">{id}</span>
                    </div>
                    {['super_admin', 'admin'].includes(user.role) && (
                        <CButton
                            size="sm"
                            color="info"
                            disabled={file.length < 0}
                            onClick={(e) => handleRequireCOOEL()}
                        >
                            {file.length > 0 ? 'Remove COO/EL' : 'Require COO/EL'}
                        </CButton>
                    )}
                </div>
                <CCard className="mt-2 mb-3">
                    <CCardBody>
                        <CTable stripedColumns hover responsive className="table-even-width">
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                                        Document Name
                                    </CTableHeaderCell>
                                    <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                                        Type
                                    </CTableHeaderCell>
                                    <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                                        Status
                                    </CTableHeaderCell>
                                    <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                                        Upload
                                    </CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {documents.map((doc, index) => (
                                    <>
                                        {doc.status !== 'not_applicable' && (
                                            <CTableRow key={index}>
                                                <CTableDataCell>
                                                    <span className="d-block">{doc.name}</span>
                                                    {doc.file && (
                                                        <CButton
                                                            color="primary"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={(e) =>
                                                                previewDocument(id, doc.file.file)
                                                            }
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={faFile}
                                                                className="me-1"
                                                            />{' '}
                                                            Open File
                                                        </CButton>
                                                    )}
                                                </CTableDataCell>
                                                <CTableDataCell>{doc.type}</CTableDataCell>
                                                <CTableDataCell className="text-capitalize">
                                                    <span
                                                        className={`badge bg-${['approved', 'generated'].includes(doc.status) ? 'success' : doc.status === 'rejected' ? 'danger' : 'warning'}`}
                                                    >
                                                        {doc.status.replace('_', ' ')}
                                                    </span>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    {!doc.file || doc.status === 'rejected' ? (
                                                        <>
                                                            <CFormInput
                                                                type="file"
                                                                accept=".docx,.pdf"
                                                                onChange={(e) =>
                                                                    handleFileUpload(e, index)
                                                                }
                                                                disabled={
                                                                    [
                                                                        'approved',
                                                                        'not_applicable',
                                                                    ].includes(doc.status) ||
                                                                    user.role === 'admin'
                                                                }
                                                            />
                                                            {doc.file && (
                                                                <span className="text-danger text-decoration-line-through">
                                                                    {doc.file.file}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        doc.file.file
                                                    )}
                                                </CTableDataCell>
                                            </CTableRow>
                                        )}
                                    </>
                                ))}
                            </CTableBody>
                        </CTable>
                        <span className="d-block mb-2 small">
                            Please ensure that the documents you upload are accurate and comply with
                            all applicable laws and regulations.
                            <br />
                            Submitting false or fraudulent documents may result in legal
                            consequences.
                        </span>
                        <CButton
                            color="primary"
                            type="submit"
                            disabled={!exportLicense && !certificateOfOrigin}
                        >
                            Submit Documents
                        </CButton>
                        <ReCAPTCHA
                            ref={recaptchaRef}
                            size="invisible"
                            sitekey={VITE_APP_RECAPTCHA_SITE_KEY}
                        />
                    </CCardBody>
                </CCard>
            </CForm>
            <CModal
                alignment="center"
                scrollable
                fullscreen="sm"
                visible={isActionVisible}
                onClose={() => setIsActionVisible(false)}
                aria-labelledby="M"
            >
                <CModalHeader>
                    <CModalTitle>{preview?.file}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    {preview?.fileFormat === 'docx' ? (
                        <iframe
                            src={`https://view.officeapps.live.com/op/embed.aspx?src=${preview?.url}`}
                            style={{ width: '100%', height: '400px', border: 'none' }}
                        ></iframe>
                    ) : (
                        <iframe
                            src={preview?.url}
                            style={{ width: '100%', height: '400px', border: 'none' }}
                            title="Document Preview"
                        ></iframe>
                    )}
                </CModalBody>
            </CModal>
        </>
    )
}

export default Document
