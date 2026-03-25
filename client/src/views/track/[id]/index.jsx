import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CRow, CCol, CCard, CCardText, CSpinner, CButton } from '@coreui/react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { Helmet } from 'react-helmet'
import { VITE_APP_GOOGLE_MAP } from '../../../config'

const TrackInfo = () => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: VITE_APP_GOOGLE_MAP,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [responseData, setResponseData] = useState({})
    const { id } = useParams()
    const navigate = useNavigate()

    const getStatus = (status) => {
        if (status === 'cancelled') return 'Cancelled'
        if (status === 'received') return 'Received'
        if (status === 'to_receive') return 'To Receive'
        if (status === 'to_ship') return 'To Ship'
        // for to_pay
        return 'To Pay'
    }

    useEffect(() => {
        const fetchData = async () => {
            axios
                .get(`/track/${id}`)
                .then((response) => {
                    setResponseData(response.data)
                })
                .catch((error) => setError(true))
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
                        <p>Double check tracking id for any mistake.</p>
                    </div>
                </CCol>
            </CRow>
        )

    return (
        <div>
            <Helmet>
                <title>{id} - Track | Axleshift</title>
            </Helmet>
            <CRow xs={{ cols: 1 }} sm={{ cols: 2 }}>
                <CCol>
                    {isLoaded && (
                        <div className="mb-4">
                            <GoogleMap
                                mapContainerStyle={{
                                    height: '400px',
                                    width: 'auto',
                                }}
                                zoom={18}
                            ></GoogleMap>
                        </div>
                    )}
                    <div className="mb-4">
                        <CCard className="mb-3 p-3">
                            <p className="lead">{getStatus(responseData.status)}</p>
                            <div className="mb-2">
                                <span className="d-block">Courier Name</span>
                                <span className="text-muted">{id}</span>
                            </div>
                            Address
                            <span className="d-block text-muted mb-2">
                                {responseData.destination[0].address}
                                {', '}
                                {responseData.destination[0].city}
                                {', '}
                                {responseData.destination[0].country}{' '}
                                {responseData.destination[0].zip_code}
                            </span>
                            {responseData.to[0].name}
                            <span className="d-block text-muted mb-2">
                                {responseData.to[0].phone_number}
                                <br />
                                {responseData.to[0].email}
                            </span>
                            <div className="d-flex">
                                <CButton
                                    className="bg-body-secondary me-2 rounded"
                                    onClick={(e) => navigate(`/invoices/${id}`)}
                                >
                                    Invoice
                                </CButton>
                                {responseData.documents_id && (
                                    <CButton
                                        className="bg-body-secondary me-2 rounded"
                                        onClick={(e) => navigate(`/documents/${id}`)}
                                    >
                                        Documents
                                    </CButton>
                                )}
                            </div>
                        </CCard>
                    </div>
                </CCol>
                <CCol>
                    <div className="timeline">
                        {responseData.events.map((event, index) => (
                            <div className="timeline-event" key={index}>
                                <div className="text-primary px-4">
                                    {new Date(event.date).toLocaleString('en-GB', {
                                        day: '2-digit',
                                        month: 'long',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false,
                                    })}
                                </div>
                                <div className="px-4 py-1 mb-2">
                                    <p>{event.event}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CCol>
            </CRow>
        </div>
    )
}

export default TrackInfo
