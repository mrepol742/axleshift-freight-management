import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CCard,
    CCardBody,
    CCardFooter,
    CCardHeader,
    CCol,
    CRow,
    CSpinner,
    CCardText,
    CCardTitle,
    CTable,
    CTableBody,
    CTableHeaderCell,
    CTableRow,
    CTableHead,
    CTableDataCell,
    CButton,
} from '@coreui/react'
import Masonry from 'react-masonry-css'
import AppPagination from '../../components/AppPagination'
import { useToast } from '../../components/AppToastProvider'
import AppSearch from '../../components/AppSearch'

// - Generated
//   The system handles the documents automatically and generates the documents
// - Not Applicable
//   The document is not applicable to the shipment
// - Pending
//   The user has not yet uploaded the document
// - Under Review
//   The user has uploaded the document and is under review
// - Approved
//   The document has been approved
// - Rejected
// The document has been rejected

const Documents = () => {
    const [data, setData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(true)
    const { addToast } = useToast()
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async (page) => {
            axios
                .post(`/documents`, { page })
                .then((response) => {
                    setData(response.data.data)
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

        fetchData(currentPage)
    }, [currentPage, addToast])

    if (loading)
        return (
            <div className="loading-overlay">
                <CSpinner color="primary" variant="grow" />
            </div>
        )

    if (data.length === 0)
        return (
            <CRow className="justify-content-center my-5">
                <CCol md={6}>
                    <div className="clearfix">
                        <h1 className="float-start display-3 me-4 text-danger">OOPS</h1>
                        <h4>There was no documents yet.</h4>
                        <p>Check it out later</p>
                    </div>
                </CCol>
            </CRow>
        )

    return (
        <div>
            <CCard className="mb-4">
                <CCardBody>
                    <CCardTitle>Shipment Documents</CCardTitle>
                    <CTable stripedColumns hover responsive className="table-even-width">
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                                    Tracking Number
                                </CTableHeaderCell>
                                <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                                    Status
                                </CTableHeaderCell>
                                <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                                    Documents
                                </CTableHeaderCell>
                                <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap"></CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {data.map((item, index) => (
                                <CTableRow key={index}>
                                    <CTableDataCell>{item.freight_tracking_number}</CTableDataCell>
                                    <CTableDataCell className="text-capitalize">
                                        {item.documents && item.documents.length > 0 ? (
                                            item.documents.map((doc, docIndex) => (
                                                <>
                                                    {doc.status !== 'not_applicable' && (
                                                        <span
                                                            key={docIndex}
                                                            className={`me-2 badge bg-${['approved', 'generated'].includes(doc.status) ? 'success' : doc.status === 'rejected' ? 'danger' : 'warning'}`}
                                                        >
                                                            {doc.status.replace('_', ' ')}
                                                        </span>
                                                    )}
                                                </>
                                            ))
                                        ) : (
                                            <span>No documents available</span>
                                        )}
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        {item.documents && item.documents.length > 0 ? (
                                            item.documents.map((doc, docIndex) => (
                                                <>
                                                    {doc.status !== 'not_applicable' && (
                                                        <span key={docIndex} className="d-block">
                                                            {doc.name}
                                                        </span>
                                                    )}
                                                </>
                                            ))
                                        ) : (
                                            <span>No documents available</span>
                                        )}
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <CButton
                                            size="sm"
                                            className="btn btn-primary"
                                            onClick={(e) =>
                                                navigate(
                                                    `/documents/${item.freight_tracking_number}`,
                                                )
                                            }
                                        >
                                            Open Documents
                                        </CButton>
                                    </CTableDataCell>
                                </CTableRow>
                            ))}
                        </CTableBody>
                    </CTable>

                    {totalPages > 1 && (
                        <AppPagination
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            totalPages={totalPages}
                            setTotalPages={setTotalPages}
                            className="mb-3"
                        />
                    )}
                </CCardBody>
            </CCard>
        </div>
    )
}

export default Documents
