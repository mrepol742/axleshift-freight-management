import React, { useState, useEffect } from 'react'
import {
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CButton,
    CFormInput,
    CFormSelect,
    CFormLabel,
    CSpinner,
    CRow,
    CCol,
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useToast } from '../../components/AppToastProvider'
import { useUserProvider } from '../../components/UserProvider'

const Reports = () => {
    const { user } = useUserProvider()
    const [filters, setFilters] = useState({
        endDate: '',
        startDate: '',
        status: '',
        invoiceStatus: '',
        type: '',
        query: '',
        weight: '',
    })
    const [data, setData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(false)
    const { addToast } = useToast()
    const navigate = useNavigate()

    const fetchData = useCallback(
        async (page, export_type = null) => {
            setLoading(true)
            axios
                .post(`/freight/deep-search`, { page, ...filters, export_type })
                .then((response) => {
                    const contentType = response.headers['content-type']
                    if (
                        [
                            'text/csv',
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        ].includes(contentType)
                    ) {
                        const blob = new Blob([response.data], { type: contentType })
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download =
                            new Date().toDateString() +
                            ' Freight Report' +
                            '.' +
                            (contentType === 'text/csv' ? 'csv' : 'xlsx')
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        return
                    }
                    const filteredData = filters.invoiceStatus
                        ? response.data.data.filter(
                              (item) => item.invoice?.status === filters.invoiceStatus,
                          )
                        : response.data.data
                    setData(filteredData)
                    setTotalPages(Math.ceil(filteredData.length / response.data.pageSize))
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
        },
        [addToast, filters],
    )

    useEffect(() => {
        const loadData = async () => {
            await fetchData(currentPage)
        }

        loadData()
    }, [currentPage, fetchData])

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const getStatus = (status) => {
        if (status === 'cancelled') return 'Cancelled'
        if (status === 'received') return 'Received'
        if (status === 'to_receive') return 'To Receive'
        if (status === 'to_ship') return 'To Ship'
        // for to_pay
        return 'To Pay'
    }

    const uniqueCustomers = () => {
        const ids = new Set()
        for (let i = 0; i < data.length; i++) {
            const item = data[i]
            if (item.user) {
                ids.add(item.user.first_name + ' ' + item.user.last_name)
            }
        }
        return ids.size
    }

    const hasFilters = () => {
        return (
            (filters.startDate ||
                filters.endDate ||
                filters.status ||
                filters.type ||
                filters.query ||
                filters.weight) !== ''
        )
    }

    return (
        <div>
            <Helmet>
                <title>Reports | Axleshift</title>
            </Helmet>
            {loading && (
                <div className="loading-overlay">
                    <CSpinner color="primary" variant="grow" />
                </div>
            )}
            <div
                style={{
                    marginBottom: '20px',
                    display: 'flex',
                    gap: '6px',
                    overflowY: 'auto',
                }}
            >
                <CFormLabel>Start Date:</CFormLabel>
                <CFormInput
                    type="date"
                    max={filters.endDate || ''}
                    onChange={(e) => {
                        const startDate = e.target.value
                        if (filters.endDate && new Date(startDate) > new Date(filters.endDate)) {
                            addToast('Start date cannot be after end date')
                            return
                        }
                        handleFilterChange('startDate', startDate)
                    }}
                />
                <CFormLabel>End Date:</CFormLabel>
                <CFormInput
                    type="date"
                    min={filters.startDate || ''}
                    onChange={(e) => {
                        const endDate = e.target.value
                        if (filters.startDate && new Date(endDate) < new Date(filters.startDate)) {
                            addToast('End date cannot be before start date')
                            return
                        }
                        handleFilterChange('endDate', endDate)
                    }}
                />
                <CFormSelect
                    style={{ minWidth: '140px' }}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                    <option value="">All</option>
                    <option value="to_pay">To Pay</option>
                    <option value="to_ship">To Ship</option>
                    <option value="to_receive">To Receive</option>
                    <option value="received">Received</option>
                    <option value="cancelled">Cancelled</option>
                </CFormSelect>
                <CFormSelect
                    style={{ minWidth: '120px' }}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                    <option value="">All</option>
                    <option value="private">Private</option>
                    <option value="business">Business</option>
                </CFormSelect>
                <CFormSelect
                    style={{ minWidth: '110px' }}
                    onChange={(e) => handleFilterChange('invoiceStatus', e.target.value)}
                >
                    <option value="">All</option>
                    <option value="PAID">Paid</option>
                    <option value="EXPIRED">Expired</option>
                </CFormSelect>
                <CFormSelect
                    style={{ minWidth: '100px' }}
                    onChange={(e) => handleFilterChange('weight', e.target.value)}
                >
                    <option value="">All</option>
                    <option value="1">&lt; 1 KG</option>
                    <option value="5">&lt; 5KG </option>
                    <option value="10">&lt; 10KG </option>
                    <option value="20">&lt; 20KG </option>
                    <option value="40">&lt; 40KG </option>
                    <option value="60">&lt; 60KG </option>
                    <option value="70">&lt; 70KG </option>
                    <option value="71">&gt; 71KG </option>
                </CFormSelect>
                <CFormInput
                    style={{ minWidth: '200px' }}
                    placeholder="Tracking number"
                    onChange={(e) => handleFilterChange('query', e.target.value)}
                />
                <CButton color="primary" onClick={(e) => fetchData(currentPage)}>
                    Apply Filters
                </CButton>
            </div>
            <h4 className="text-muted">Summary</h4>
            <div className="d-block d-md-flex justify-content-between mb-2">
                <div>
                    <h5>
                        Shipments: {data.length} &#183;{' '}
                        {['super_admin', 'admin'].includes(user.role) && (
                            <>Customers: {uniqueCustomers()}</>
                        )}{' '}
                        &#183; Amount:{' '}
                        {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'PHP',
                        }).format(data.reduce((acc, item) => acc + item.amount.value, 0))}{' '}
                        &#183; Weight: {data.reduce((acc, item) => acc + item.total_weight, 0)} KG
                    </h5>
                </div>
                <div>
                    <CButton
                        className="me-2"
                        color="primary"
                        onClick={() => {
                            setFilters({
                                endDate: '',
                                startDate: '',
                                status: '',
                                invoiceStatus: '',
                                type: '',
                                query: '',
                                weight: '',
                            })
                            fetchData(currentPage)
                        }}
                        disabled={!hasFilters()}
                    >
                        Clear Filters
                    </CButton>
                    <CDropdown className="bg-primary">
                        <CDropdownToggle caret={false}>Export</CDropdownToggle>
                        <CDropdownMenu>
                            <CDropdownItem
                                className="d-flex align-items-center"
                                as="button"
                                type="button"
                                onClick={(e) => fetchData(currentPage, 'csv')}
                            >
                                CSV
                            </CDropdownItem>
                            <CDropdownItem
                                className="d-flex align-items-center"
                                as="button"
                                type="button"
                                onClick={(e) => fetchData(currentPage, 'excel')}
                            >
                                Excel
                            </CDropdownItem>
                        </CDropdownMenu>
                    </CDropdown>
                </div>
            </div>

            <CTable stripedColumns hover responsive className="table-even-width">
                <CTableHead>
                    <CTableRow>
                        <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                            Tracking Number
                        </CTableHeaderCell>
                        {['super_admin', 'admin'].includes(user.role) && (
                            <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                                Customer
                            </CTableHeaderCell>
                        )}
                        <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                            Status
                        </CTableHeaderCell>
                        <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                            Type
                        </CTableHeaderCell>
                        <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                            Amount
                        </CTableHeaderCell>
                        <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                            Payment
                        </CTableHeaderCell>
                        <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                            Date
                        </CTableHeaderCell>
                        <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                            Weight
                        </CTableHeaderCell>
                    </CTableRow>
                </CTableHead>
                {data.length !== 0 && (
                    <CTableBody>
                        {data.map((item, index) => (
                            <CTableRow key={index}>
                                <CTableHeaderCell>{item.tracking_number}</CTableHeaderCell>
                                {['super_admin', 'admin'].includes(user.role) && (
                                    <CTableHeaderCell>
                                        {item.user.first_name + ' ' + item.user.last_name}
                                    </CTableHeaderCell>
                                )}
                                <CTableHeaderCell>{getStatus(item.status)}</CTableHeaderCell>
                                <CTableHeaderCell className="text-capitalize">
                                    {item.type}
                                </CTableHeaderCell>
                                <CTableHeaderCell>
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: item.amount.currency,
                                    }).format(item.amount.value)}
                                </CTableHeaderCell>
                                <CTableHeaderCell>
                                    {item.invoice ? (
                                        <>
                                            {item.invoice.status === 'PAID' ? (
                                                <>
                                                    {item.invoice.status} via{' '}
                                                    {item.invoice.payment_method}
                                                </>
                                            ) : (
                                                <>{item.invoice.status}</>
                                            )}
                                        </>
                                    ) : (
                                        'NaN'
                                    )}
                                </CTableHeaderCell>
                                <CTableHeaderCell>
                                    {new Date(item.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </CTableHeaderCell>
                                <CTableHeaderCell>{item.total_weight + 'kg'}</CTableHeaderCell>
                            </CTableRow>
                        ))}
                    </CTableBody>
                )}
            </CTable>
            {data.length === 0 && (
                <CRow className="justify-content-center my-5">
                    <CCol md={6}>
                        <h1 className="text-truncate text-center">{filters.query}</h1>
                        <div className="clearfix">
                            <h1 className="float-start display-3 me-4 text-danger">OOPS</h1>
                            <h4>There was no shipment found.</h4>
                            <p>Double check your search query.</p>
                        </div>
                    </CCol>
                </CRow>
            )}
        </div>
    )
}

export default Reports
