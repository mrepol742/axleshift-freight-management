import React, { useEffect, useState } from 'react'
import {
    CCard,
    CCardTitle,
    CButton,
    CSpinner,
    CCardBody,
    CTable,
    CTableHead,
    CTableRow,
    CTableDataCell,
    CTableBody,
    CTableHeaderCell,
    CModal,
    CModalHeader,
    CModalBody,
    CModalTitle,
    CModalFooter,
} from '@coreui/react'
import { Helmet } from 'react-helmet'
import ReCAPTCHA from 'react-google-recaptcha'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import parseTimestamp from '../../../utils/Timestamp'
import { VITE_APP_RECAPTCHA_SITE_KEY } from '../../../config'
import { useToast } from '../../../components/AppToastProvider'
import AppPagination from '../../../components/AppPagination'

const Sessions = () => {
    const recaptchaRef = React.useRef()
    const { addToast } = useToast()
    const [loading, setLoading] = useState(true)
    const [result, setResult] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [modal, setModal] = useState(false)

    const handleLogout = async (id) => {
        setModal(false)
        const recaptcha = await recaptchaRef.current.executeAsync()
        setLoading(true)
        axios
            .post(`/sec/management/sessions/logout/${id}`, {
                recaptcha_ref: recaptcha,
            })
            .then((response) => {
                if (!id || response.data.logout) window.location.href = '/logout'
                if (response.data.error) return addToast(response.data.error)
                addToast(response.data.message)
                setResult((prevResult) => prevResult.filter((session) => session._id !== id))
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
                .post(`/sec/management/sessions`, { page })
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
            <Helmet>
                <title>Sessions - Management | Axleshift</title>
            </Helmet>
            <h4>Logout all sessions</h4>
            <CCard className="mb-3">
                <CCardBody>
                    <p>Clearing all active sessions will log everyone out.</p>
                    <CButton
                        type="submit"
                        color="danger"
                        className="mt-4 d-block me-2 rounded"
                        onClick={(e) => setModal(true)}
                    >
                        <FontAwesomeIcon icon={faCircleExclamation} className="me-2" /> Logout all
                        sessions
                    </CButton>
                </CCardBody>
            </CCard>

            <CCard className="mb-4">
                <CCardBody>
                    <CCardTitle>Sessions</CCardTitle>
                    <CTable stripedColumns hover responsive className="table-even-width">
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                                    User ID
                                </CTableHeaderCell>
                                <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                                    IP Address
                                </CTableHeaderCell>
                                <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                                    Device
                                </CTableHeaderCell>
                                <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                                    Status
                                </CTableHeaderCell>
                                <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap">
                                    Last Accessed
                                </CTableHeaderCell>
                                <CTableHeaderCell className="text-uppercase fw-bold text-muted poppins-regular table-header-cell-no-wrap"></CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {result.map((session, index) => (
                                <CTableRow key={index}>
                                    <CTableDataCell>{session.user_id}</CTableDataCell>
                                    <CTableDataCell>
                                        {session.ip_address === '::1' ||
                                        session.ip_address === '::ffff:127.0.0.1'
                                            ? 'Localhost'
                                            : session.ip_address}
                                    </CTableDataCell>
                                    <CTableDataCell>{session.user_agent}</CTableDataCell>
                                    <CTableDataCell>
                                        {session.active ? 'Active' : 'Inactive'}
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        {parseTimestamp(session.last_accessed)}
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <CButton
                                            size="sm"
                                            color="danger"
                                            className="ms-auto"
                                            onClick={(e) => handleLogout(session._id)}
                                        >
                                            Logout
                                        </CButton>
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
                />
            )}
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
                    <CButton color="secondary" onClick={handleLogout}>
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
            <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={VITE_APP_RECAPTCHA_SITE_KEY} />
        </div>
    )
}

export default Sessions
