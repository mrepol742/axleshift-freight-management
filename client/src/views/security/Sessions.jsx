import React, { useState, useEffect } from 'react'
import {
    CCard,
    CCardBody,
    CButton,
    CRow,
    CCol,
    CSpinner,
    CCardTitle,
    CCardText,
    CBadge,
    CModal,
    CModalTitle,
    CModalHeader,
    CModalBody,
    CModalFooter,
} from '@coreui/react'
import ReCAPTCHA from 'react-google-recaptcha'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMapLocationDot } from '@fortawesome/free-solid-svg-icons'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { VITE_APP_RECAPTCHA_SITE_KEY, VITE_APP_GOOGLE_MAP } from '../../config'
import { useToast } from '../../components/AppToastProvider'
import AppPagination from '../../components/AppPagination'
import parseTimestamp from '../../utils/Timestamp'

const Sessions = () => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: VITE_APP_GOOGLE_MAP,
    })
    const recaptchaRef = React.useRef()
    const { addToast } = useToast()
    const [loading, setLoading] = useState(true)
    const [result, setResult] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [modal, setModal] = useState(false)
    const [maps, setMaps] = useState(false)
    const [selectedSession, setSelectedSession] = useState(null)
    const [googleMap, setGoogleMap] = useState(null)

    const onLoad = React.useCallback(function callback(map) {
        // const bounds = new window.google.maps.LatLngBounds(center)
        // map.fitBounds(bounds)

        setGoogleMap(map)
    }, [])

    const onUnmount = React.useCallback(function callback(map) {
        setGoogleMap(null)
    }, [])

    const handleLogout = async (id) => {
        const recaptcha = await recaptchaRef.current.executeAsync()
        setLoading(true)
        axios
            .post(`/sec/sessions/logout`, {
                session_id: id,
                recaptcha_ref: recaptcha,
            })
            .then((response) => {
                addToast(response.data.message)
                if (id) {
                    setResult((prevResult) => ({
                        ...prevResult,
                        sessions: prevResult.sessions.filter((session) => session._id !== id),
                    }))
                } else {
                    setResult((prevResult) => ({
                        ...prevResult,
                        sessions: [],
                    }))
                }
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
        const fetchData = async (page) => {
            axios
                .post(`/sec/sessions`, { page })
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
            <CRow xs={{ cols: 1 }} sm={{ cols: 2 }}>
                <CCol className="mb-3">
                    <h4>This device</h4>
                    <CCard>
                        <CCardBody>
                            <div className="d-flex justify-content-between">
                                <p className="display-3">
                                    {result.current_session.ip_address === '::1' ||
                                    result.current_session.ip_address === '::ffff:127.0.0.1'
                                        ? 'localhost'
                                        : result.current_session.ip_address}
                                </p>
                                <span
                                    onClick={(e) => {
                                        setSelectedSession(result.current_session)
                                        setMaps(true)
                                    }}
                                >
                                    <FontAwesomeIcon icon={faMapLocationDot} size="xl" />
                                </span>
                            </div>
                            <span className="lead">{result.current_session.user_agent}</span>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol className="mb-3">
                    <h4>Logout other sessions</h4>
                    <CCard>
                        <CCardBody>
                            <p>
                                Clearing all device sessions will log you out from all devices and
                                browsers, except for the one you&apos;re currently using.
                            </p>
                            <CButton
                                type="submit"
                                color="danger"
                                className="mt-4 d-block me-2 rounded"
                                disabled={result.logout}
                                onClick={(e) => setModal(true)}
                            >
                                Logout other sessions
                            </CButton>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
            {result.sessions.map((session, index) => (
                <div key={index}>
                    <CCard className="mb-3">
                        <CCardBody>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h3
                                    className={
                                        (session.active ? 'text-primary' : '') + ' text-truncate'
                                    }
                                >
                                    {session.user_agent}
                                </h3>
                                <div className="text-right d-flex justify-content-end">
                                    <span
                                        className="me-4"
                                        onClick={(e) => {
                                            setSelectedSession(session)
                                            setMaps(true)
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faMapLocationDot} size="xl" />
                                    </span>
                                    <CButton
                                        color="danger"
                                        className="ms-auto"
                                        onClick={(e) => handleLogout(session._id)}
                                    >
                                        Logout
                                    </CButton>
                                </div>
                            </div>
                            <div className="d-block d-sm-flex">
                                <div className="me-3 mb-2">
                                    <span className="text-muted">Last accessed</span>
                                    <span className="d-block small">
                                        {session.last_accessed
                                            ? parseTimestamp(session.last_accessed)
                                            : 'Never'}{' '}
                                        | {session.active ? 'Verified' : 'Not verified'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted">IP Address</span>
                                    <span className="d-block small text-capitalize">
                                        {session.ip_address === '::1'
                                            ? 'localhost'
                                            : session.ip_address}
                                    </span>
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
            <CModal
                alignment="center"
                scrollable
                visible={modal}
                onClose={() => setModal(false)}
                aria-labelledby="M"
            >
                <CModalHeader>
                    <CModalTitle>Confirm Logout?</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    Are you sure you want to logout all sessions? This action cannot be undone.
                </CModalBody>
                <CModalFooter className="d-flex justify-content-end">
                    <CButton color="secondary" onClick={(e) => handleLogout(null)}>
                        Okay
                    </CButton>
                    <CButton
                        color="primary"
                        onClick={() => {
                            setModal(false)
                        }}
                        className="ms-2"
                    >
                        Cancel
                    </CButton>
                </CModalFooter>
            </CModal>
            <CModal
                alignment="center"
                scrollable
                visible={maps}
                onClose={() => setMaps(false)}
                aria-labelledby="M"
            >
                <CModalHeader>
                    <CModalTitle>{selectedSession?.user_agent}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <strong>IP Address:</strong> {selectedSession?.ip_address}
                    <div className="mb-2 border-bottom" />
                    <strong>Latitude:</strong>{' '}
                    {(() => {
                        const locationArray = selectedSession?.location
                            ? JSON.parse(selectedSession.location)
                            : null

                        return (
                            <>
                                <strong>Latitude:</strong>{' '}
                                {locationArray ? locationArray[0].latitude : 0}
                                <div className="mb-2 border-bottom" />
                                <strong>Longitude:</strong>{' '}
                                {locationArray ? locationArray[0].longitude : 0}
                            </>
                        )
                    })()}
                    <div className="mb-4 border-bottom" />
                    {isLoaded && (
                        <>
                            {(() => {
                                const locationArray = selectedSession?.location
                                    ? JSON.parse(selectedSession.location)
                                    : null

                                const center = locationArray
                                    ? {
                                          lat: locationArray[0].latitude,
                                          lng: locationArray[0].longitude,
                                      }
                                    : { lat: 0, lng: 0 }

                                return (
                                    <>
                                        <GoogleMap
                                            mapContainerStyle={{
                                                height: '400px',
                                                width: 'auto',
                                            }}
                                            center={center}
                                            zoom={18}
                                        >
                                            <Marker position={center} />
                                        </GoogleMap>
                                        <p className="text-muted mt-2">
                                            Note: GPS accuracy may vary significantly on desktop or
                                            laptop devices compared to mobile phones.
                                        </p>
                                    </>
                                )
                            })()}
                        </>
                    )}
                </CModalBody>
            </CModal>
            <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={VITE_APP_RECAPTCHA_SITE_KEY} />
        </div>
    )
}

export default Sessions
