import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CSpinner,
    CRow,
    CCol,
    CCard,
    CCardBody,
    CCardTitle,
    CButton,
} from '@coreui/react'
import { useToast } from '../../components/AppToastProvider'

import parseTimestamp from '../../utils/Timestamp'
import AppPagination from '../../components/AppPagination'

const Invoices = () => {
    const navigate = useNavigate()
    const { addToast } = useToast()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)

    useEffect(() => {
        const fetchData = async (page) => {
            axios
                .post(`/invoices`, { page })
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
                        <h4>There was no invoices yet.</h4>
                        <p>Check it out later</p>
                    </div>
                </CCol>
            </CRow>
        )

    return (
        <div>
            <CCard className="mb-4">
                <CCardBody>
                    <CCardTitle>Transactions</CCardTitle>
                    <CTable stripedColumns hover responsive className="table-even-width">
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                                    Ref Number
                                </CTableHeaderCell>
                                <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                                    Amount
                                </CTableHeaderCell>
                                <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                                    Status
                                </CTableHeaderCell>
                                <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap"></CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {data.map((invoice, index) => (
                                <CTableRow key={index}>
                                    <CTableDataCell>{invoice.invoice_id}</CTableDataCell>
                                    <CTableDataCell>
                                        {new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: invoice.currency,
                                        }).format(invoice.amount)}
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <span
                                            className={`badge bg-${invoice.status === 'PAID' ? 'success' : invoice.status === 'EXPIRED' ? 'danger' : 'warning'}`}
                                        >
                                            {invoice.status}
                                        </span>
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        {invoice.status !== 'EXPIRED' && (
                                            <CButton
                                                size="sm"
                                                className="btn btn-primary"
                                                onClick={(e) =>
                                                    navigate(
                                                        `/invoices/${invoice.freight_tracking_number}`,
                                                    )
                                                }
                                            >
                                                Open Invoice
                                            </CButton>
                                        )}
                                    </CTableDataCell>
                                </CTableRow>
                            ))}
                        </CTableBody>
                    </CTable>
                </CCardBody>
            </CCard>
            {totalPages > 1 && (
                <AppPagination
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                    setTotalPages={setTotalPages}
                    className="mb-3"
                />
            )}
        </div>
    )
}

export default Invoices
