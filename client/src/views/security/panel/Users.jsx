import React, { useState, useEffect } from 'react'
import {
    CSpinner,
    CAccordion,
    CAccordionBody,
    CAccordionHeader,
    CAccordionItem,
    CBadge,
    CRow,
    CCol,
    CImage,
    CCard,
    CCardBody,
    CCardTitle,
    CButton,
} from '@coreui/react'
import { Helmet } from 'react-helmet'
import { VITE_APP_AWS_S3 } from '../../../config'
import { useToast } from '../../../components/AppToastProvider'
import parseTimestamp from '../../../utils/Timestamp'
import AppPagination from '../../../components/AppPagination'
import { useNavigate } from 'react-router-dom'

const Users = () => {
    const { addToast } = useToast()
    const [loading, setLoading] = useState(true)
    const [result, setResult] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async (page) => {
            axios
                .post(`/sec/management/users`, { page })
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

    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : ''
    }

    if (loading)
        return (
            <div className="loading-overlay">
                <CSpinner color="primary" variant="grow" />
            </div>
        )

    return (
        <div>
            <Helmet>
                <title>Users - Management | Axleshift</title>
            </Helmet>
            <CCard className="mb-4">
                <CCardBody>
                    <CCardTitle>Axleshift Users</CCardTitle>
                    <CAccordion flush>
                        {result.map((user, index) => (
                            <CAccordionItem itemKey={index} key={index}>
                                <CAccordionHeader>
                                    <div className="d-flex">
                                        {user.avatar ? (
                                            <>
                                                <CImage
                                                    crossOrigin="Anonymous"
                                                    src={`${VITE_APP_AWS_S3}/images/${user.avatar}.png`}
                                                    className="rounded-pill p-1 border me-2"
                                                    width="25px"
                                                    height="25px"
                                                    loading="lazy"
                                                />
                                            </>
                                        ) : (
                                            <div
                                                className="rounded-pill bg-primary d-flex align-items-center justify-content-center me-2 fs-6"
                                                style={{
                                                    width: '25px',
                                                    height: '25px',
                                                    color: 'white',
                                                }}
                                            >
                                                {getInitials(user.first_name)}
                                            </div>
                                        )}
                                        <span
                                            className={`me-2 ${['admin', 'super_admin'].includes(user.role) && 'text-primary fw-bold'}`}
                                        >
                                            {user.first_name} {user.last_name}
                                        </span>
                                    </div>
                                </CAccordionHeader>
                                <CAccordionBody>
                                    <ul className="list-unstyled mb-3">
                                        <li className="border-bottom mb-2">
                                            <strong>First name:</strong> {user.first_name}
                                        </li>
                                        <li className="border-bottom mb-2">
                                            <strong>Last name:</strong> {user.last_name}
                                        </li>
                                        <li className="border-bottom mb-2">
                                            <strong>Username:</strong> {user.username}
                                        </li>
                                        <li className="border-bottom mb-2">
                                            <strong>Email:</strong> {user.email}
                                        </li>
                                        <li className="border-bottom mb-2">
                                            <strong>Role:</strong> {user.role}
                                        </li>
                                        <li className="border-bottom mb-2">
                                            <strong>Registration Type:</strong>{' '}
                                            {user.registration_type}
                                        </li>
                                        <li className="border-bottom mb-2">
                                            <strong>Registration Date:</strong>{' '}
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </li>
                                        <li className="border-bottom mb-2">
                                            <strong>Google:</strong>{' '}
                                            {user.oauth2 ? user.oauth2.google?.email : 'No'}
                                        </li>
                                        <li className="border-bottom mb-2">
                                            <strong>Github:</strong>{' '}
                                            {user.oauth2 ? user.oauth2.github?.email : 'No'}
                                        </li>
                                        <li className="border-bottom mb-2">
                                            <strong>Microsoft:</strong>{' '}
                                            {user.oauth2 ? user.oauth2.microsoft?.email : 'No'}
                                        </li>
                                        <li className="border-bottom mb-2">
                                            <strong>Last Password Changed:</strong>{' '}
                                            {user.password_changed_on
                                                ? new Date(
                                                      user.password_changed_on,
                                                  ).toLocaleDateString()
                                                : 'NaN'}
                                        </li>
                                        <li className="border-bottom mb-2">
                                            <strong>Last Username Changed:</strong>{' '}
                                            {user.username_last_updated_at
                                                ? new Date(
                                                      user.username_last_updated_at,
                                                  ).toLocaleDateString()
                                                : 'NaN'}
                                        </li>
                                        <li className="border-bottom mb-2">
                                            <strong>Last Email Changed:</strong>{' '}
                                            {user.email_changed_on
                                                ? new Date(
                                                      user.email_changed_on,
                                                  ).toLocaleDateString()
                                                : 'NaN'}
                                        </li>
                                        <li className="border-bottom mb-2">
                                            <strong>User ID:</strong> {user._id}
                                        </li>
                                        <li className="border-bottom mb-2">
                                            <strong>User Reference:</strong> {user.ref}
                                        </li>
                                        <li className="border-bottom mb-2">
                                            <strong>User Role:</strong>{' '}
                                            <span className="text-capitalize">
                                                {user.role.replace('_', ' ')}
                                            </span>
                                        </li>
                                        <li className="border-bottom mb-2">
                                            <strong>Last Update:</strong>{' '}
                                            <span className="text-capitalize">
                                                {new Date(user.updated_at).toLocaleDateString()}
                                            </span>
                                        </li>
                                    </ul>
                                    <div className="d-flex">
                                        <CButton
                                            color="primary"
                                            size="sm"
                                            className="me-2"
                                            onClick={() =>
                                                navigate(`/send-email?email=${user.email}`)
                                            }
                                        >
                                            Email
                                        </CButton>
                                        <CButton
                                            color="success"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => navigate(`/customer?ref=${user.ref}`)}
                                        >
                                            Message
                                        </CButton>
                                        <CButton
                                            color="danger"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => {}}
                                        >
                                            Delete User
                                        </CButton>
                                    </div>
                                </CAccordionBody>
                            </CAccordionItem>
                        ))}
                    </CAccordion>
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
    )
}

export default Users
