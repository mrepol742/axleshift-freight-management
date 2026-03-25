import React, { useEffect, useState } from 'react'
import {
    CCard,
    CButton,
    CSpinner,
    CCardBody,
    CContainer,
    CAlert,
    CModal,
    CModalHeader,
    CModalBody,
    CModalTitle,
    CModalFooter,
    CRow,
    CCol,
} from '@coreui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import ReCAPTCHA from 'react-google-recaptcha'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from '@fortawesome/free-solid-svg-icons'
import { VITE_APP_RECAPTCHA_SITE_KEY } from '../../config'
import { useToast } from '../../components/AppToastProvider'
import AppPagination from '../../components/AppPagination'
import parseTimestamp from '../../utils/Timestamp'

const API = () => {
    const navigate = useNavigate()
    const { addToast } = useToast()
    const [loading, setLoading] = useState(true)
    const recaptchaRef = React.useRef()
    const [result, setResult] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [deleteToken, setDeleteToken] = useState(null)
    const [modal, setModal] = useState(false)
    const location = useLocation()
    const token = location.state?.token

    const deleteModal = (token) => {
        setDeleteToken(token)
        setModal(true)
    }

    const handleDelete = async () => {
        setModal(false)
        const recaptcha = await recaptchaRef.current.executeAsync()
        setLoading(true)
        axios
            .post(`/auth/token/delete`, {
                id: deleteToken._id,
                recaptcha_ref: recaptcha,
            })
            .then((response) => fetchData(1))
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
                .post(`/auth/token/`, { page })
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
            {token && (
                <div>
                    Make sure to copy your personal access token now. You won’t be able to see it
                    again!
                    <CAlert
                        color="info"
                        className="d-flex justify-content-between align-items-center"
                    >
                        <span>{token}</span>
                        <CButton
                            color="primary"
                            size="sm"
                            onClick={() => {
                                navigator.clipboard.writeText(token)
                                addToast('Token copied to clipboard')
                            }}
                        >
                            <FontAwesomeIcon icon={faCopy} />
                        </CButton>
                    </CAlert>
                </div>
            )}
            <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={VITE_APP_RECAPTCHA_SITE_KEY} />
            <CRow className="align-items-center mb-2">
                <CCol>
                    <h4 className="mb-0">Access Token</h4>
                </CCol>
                <CCol className="text-right d-flex justify-content-end">
                    <CButton
                        color="primary"
                        size="sm"
                        onClick={(e) => navigate('/security/access-token/new')}
                        className="text-right d-flex justify-content-end"
                    >
                        Generate new token
                    </CButton>
                </CCol>
            </CRow>
            {!result ||
                (result.length == 0 && (
                    <CContainer className="my-5">
                        <div className="text-center">
                            <div className="text-body-secondary">
                                <h1 className="d-block text-danger">No Access Tokens added yet.</h1>
                                <span>
                                    Please click &quot;Generate New Token&quot; to create a Token.
                                </span>
                            </div>
                        </div>
                    </CContainer>
                ))}
            {result &&
                result.map((token, index) => (
                    <CCard key={index} className="mb-3">
                        <CCardBody>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h3 className="text-primary text-truncate">{token.note}</h3>
                                <CButton
                                    color="danger"
                                    onClick={(e) => deleteModal(token)}
                                    className="ms-auto"
                                >
                                    Delete
                                </CButton>
                            </div>
                            <div className="d-block d-sm-flex">
                                <div className="me-3 mb-2">
                                    <span className="text-muted">Last accessed</span>
                                    <span className="d-block small">
                                        {token.last_accessed
                                            ? parseTimestamp(token.last_accessed)
                                            : 'Never'}{' '}
                                        | {token.user_agent ? token.user_agent : 'NaN'}
                                    </span>
                                </div>
                                <div className="me-3 mb-2">
                                    <span className="text-muted">Date created</span>
                                    <span className="d-block small">
                                        {new Date(token.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted">IP Address</span>
                                    <span className="d-block small text-capitalize">
                                        {token.ip_address === '::1'
                                            ? 'localhost'
                                            : token.ip_address}
                                    </span>
                                </div>
                            </div>
                        </CCardBody>
                    </CCard>
                ))}
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
                    <CModalTitle>Confirm Delete {deleteToken?.note}?</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    Are you sure you want to delete the selected Token? This action cannot be
                    undone.
                </CModalBody>
                <CModalFooter className="d-flex justify-content-end">
                    <CButton color="secondary" onClick={handleDelete}>
                        Delete
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
        </div>
    )
}

export default API
