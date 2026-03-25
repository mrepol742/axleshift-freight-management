import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CForm, CFormSelect, CSpinner, CRow, CCol } from '@coreui/react'
import Masonry from 'react-masonry-css'
import { Helmet } from 'react-helmet'
import { useToast } from '../../components/AppToastProvider'
import AppSearch from '../../components/AppSearch'
import ShipmentCard from '../shipment/ShipmentCard'
import AppPagination from '../../components/AppPagination'

const Search = () => {
    const [data, setData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(true)
    const { addToast } = useToast()
    const navigate = useNavigate()
    const urlParams = new URLSearchParams(window.location.search)
    const query = urlParams.get('q') ? urlParams.get('q') : ''

    useEffect(() => {
        const fetchData = async (page) => {
            axios
                .post(`/freight`, { page, query })
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
    }, [currentPage, addToast, query])

    if (loading)
        return (
            <div className="loading-overlay">
                <CSpinner color="primary" variant="grow" />
            </div>
        )

    if (data.length == 0)
        return (
            <>
                <Helmet>
                    <title>{query} - Search | Axleshift</title>
                </Helmet>
                <CRow className="justify-content-center my-5">
                    <CCol md={6}>
                        <h1 className="text-truncate text-center">`{query}`</h1>
                        <div className="clearfix">
                            <h1 className="float-start display-3 me-4 text-danger">OOPS</h1>
                            <h4>There was no shipment found.</h4>
                            <p>Double check your search query.</p>
                        </div>
                    </CCol>
                </CRow>
            </>
        )

    return (
        <div>
            <Helmet>
                <title>{query} - Search | Axleshift</title>
            </Helmet>
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
                    <ShipmentCard key={index} shipment={item} />
                ))}
            </Masonry>

            {data.length > 20 && (
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

export default Search
