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
} from '@coreui/react'
import Masonry from 'react-masonry-css'
import AppPagination from '../../components/AppPagination'
import { useToast } from '../../components/AppToastProvider'
import AppSearch from '../../components/AppSearch'
import ShipmentCard from './ShipmentCard'

const Dashboard = () => {
    const [data, setData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(true)
    const { addToast } = useToast()
    const navigate = useNavigate()

    const fetchData = useCallback(
        async (page) => {
            axios
                .post(`/freight`, { page })
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
        },
        [addToast],
    )

    useEffect(() => {
        const loadData = async () => {
            await fetchData(currentPage)
        }

        loadData()
    }, [currentPage, fetchData])

    if (loading)
        return (
            <div className="loading-overlay">
                <CSpinner color="primary" variant="grow" />
            </div>
        )

    if (data.length == 0)
        return (
            <>
                <div className="shipment-bg position-absolute top-0 start-0 w-100 h-100" />
                <CRow className="justify-content-center my-5">
                    <CCol md={7}>
                        <div className="text-center">
                            <h1 className="display-4 fw-bold">
                                Welcome to
                                <span className="text-primary d-block">Your Dashboard</span>
                            </h1>
                            <p className="lead">
                                It looks like you haven&apos;t created any shipments yet. Let&apos;s
                                get started!
                            </p>
                            <AppSearch className="mb-3" />
                        </div>
                        <CRow xs={{ cols: 1 }} sm={{ cols: 3 }}>
                            <CCol onClick={(e) => navigate('/book-now')} className="mb-3">
                                <h4>Ship Right Now</h4>
                                <p>Create a new shipment and get started with our services.</p>
                            </CCol>
                            <CCol onClick={(e) => navigate('/support')} className="mb-3">
                                <h4>Customer Support</h4>
                                <p>
                                    Get help with your shipments or learn more about our services.
                                </p>
                            </CCol>
                            <CCol onClick={(e) => navigate('/learn-more')} className="mb-3">
                                <h4>Learn More</h4>
                                <p>Find out more about our services and how we can help you.</p>
                            </CCol>
                        </CRow>
                    </CCol>
                </CRow>
            </>
        )

    return (
        <div>
            <Masonry
                breakpointCols={{
                    default: 4,
                    1100: 3,
                    700: 2,
                    500: 1,
                }}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
            >
                {data.map((item, index) => (
                    <div key={index}>
                        <ShipmentCard shipment={item} />
                    </div>
                ))}
            </Masonry>

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

export default Dashboard
