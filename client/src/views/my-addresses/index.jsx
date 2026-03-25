import React, { useState, useEffect } from 'react'
import { CButton, CSpinner, CCard, CCardBody, CContainer, CRow, CCol } from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../components/AppToastProvider'
import AppPagination from '../../components/AppPagination'
import parseTimestamp from '../../utils/Timestamp'

const MyAddresses = () => {
    const navigate = useNavigate()
    const recaptchaRef = React.useRef()
    const { addToast } = useToast()
    const [loading, setLoading] = useState(true)
    const [result, setResult] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)

    useEffect(() => {
        const fetchData = async (page) => {
            axios
                .post(`/addresses`, { page })
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

        fetchData(currentPage)
    }, [currentPage, addToast])

    if (loading)
        return (
            <div className="loading-overlay">
                <CSpinner color="primary" variant="grow" />
            </div>
        )

    return (
        <div>
            <div className="d-block d-sm-flex justify-content-between align-items-center mb-3">
                <h4>Address</h4>
                <CButton
                    color="primary"
                    size="sm"
                    onClick={(e) => navigate('/my-addresses/new')}
                    className="ms-auto"
                >
                    Add new Address
                </CButton>
            </div>
            {!result ||
                (result.length == 0 && (
                    <CContainer className="mt-5">
                        <CRow className="justify-content-center">
                            <CCol md={6}>
                                <div className="clearfix">
                                    <h1 className="float-start display-3 me-4 text-danger">404</h1>
                                    <h4>Oops! No Addresses Found</h4>
                                    <p className="text-body-secondary float-start">
                                        You have not added any address yet.
                                    </p>
                                </div>
                            </CCol>
                        </CRow>
                    </CContainer>
                ))}
            {result &&
                result.map((address, index) => (
                    <div key={index}>
                        <CCard
                            className="mb-3"
                            title="Tap to view"
                            onClick={(e) => navigate(`/my-addresses/view`, { state: { address } })}
                        >
                            <CCardBody>
                                <div className="d-block d-sm-flex justify-content-between align-items-center mb-2">
                                    <div className="mb-5 mb-sm-0">
                                        <div className="mb-2">
                                            <span className="text-primary fw-bold text-uppercase">
                                                From
                                            </span>
                                            <h5 className="text-truncate">{address.from.name}</h5>
                                            <p className="text-muted text-truncate">
                                                {address.from.phone_number}
                                            </p>
                                        </div>
                                        {address.from.address}, {address.from.city},{' '}
                                        {address.from.postal_code}, {address.from.country}
                                    </div>
                                    <div>
                                        <div className="mb-2">
                                            <span className="text-primary fw-bold text-uppercase">
                                                To
                                            </span>
                                            <h5 className="text-truncate">{address.to.name}</h5>
                                            <p className="text-muted text-truncate">
                                                {address.to.phone_number}
                                            </p>
                                        </div>
                                        {address.to.address}, {address.to.city},{' '}
                                        {address.to.postal_code}, {address.to.country}
                                    </div>
                                </div>
                            </CCardBody>
                        </CCard>
                        {totalPages > 1 && (
                            <AppPagination
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                totalPages={totalPages}
                                setTotalPages={setTotalPages}
                            />
                        )}
                    </div>
                ))}
        </div>
    )
}

export default MyAddresses
