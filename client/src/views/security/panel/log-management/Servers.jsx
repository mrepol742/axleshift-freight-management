import React, { useEffect, useState } from 'react'
import { CForm, CInputGroup, CFormInput, CInputGroupText } from '@coreui/react'
import { Helmet } from 'react-helmet'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import AppPagination from '../../../../components/AppPagination'
import { useToast } from '../../../../components/AppToastProvider'

const Server = () => {
    const { addToast } = useToast()
    const [loading, setLoading] = useState(true)
    const [logs, setLogs] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [query, setQuery] = useState('')

    useEffect(() => {
        const fetchLogs = async (page) => {
            axios
                .post(`/sec/management/server-logs`, { page })
                .then((response) => {
                    setLogs(response.data.data)
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

        fetchLogs(currentPage)
    }, [currentPage, addToast])

    return (
        <div>
            <Helmet>
                <title>Server Logs - Management | Axleshift</title>
            </Helmet>
            {/* <CForm className="mb-3 w-25">
                <CInputGroup>
                    <CFormInput
                        aria-label="query"
                        name="q"
                        value={query}
                        placeholder="Find a specific data?"
                        onChange={(e) => setQuery(e.target.value)}
                        aria-describedby="basic-addon"
                        style={{
                            height: '40px',
                            fontSize: '0.9em',
                        }}
                    />
                    <CInputGroupText id="basic-addon" className="px-3">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </CInputGroupText>
                </CInputGroup>
            </CForm> */}
            <pre className="bg-body-secondary" style={{ whiteSpace: 'pre-wrap', padding: '10px' }}>
                {logs}
            </pre>
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

export default Server
