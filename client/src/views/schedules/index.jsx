import React, { useState, useEffect } from 'react'
import {
    CSpinner,
    CTable,
    CTableBody,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableDataCell,
    CCard,
    CFormInput,
    CFormCheck,
    CBadge,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import { useToast } from '../../components/AppToastProvider'
import Holidays from 'date-holidays'

const Schedules = () => {
    const { addToast } = useToast()
    const [loading, setLoading] = useState(true)
    const [result, setResult] = useState([])
    const navigate = useNavigate()
    const locale = navigator.language || 'en-US'
    const countryCode = locale.split('-')[1] || 'US'
    const hd = new Holidays(countryCode)
    const [showHolidays, setShowHolidays] = useState(
        cookies.get('showHolidays') === 'true' || cookies.get('showHolidays') === undefined,
    )
    const [showDaysOfWeek, setShowDaysOfWeek] = useState(
        cookies.get('showDaysOfWeek') === 'true' || cookies.get('showDaysOfWeek') === undefined,
    )

    useEffect(() => {
        const fetchData = async () => {
            axios
                .get(`/freight/calendar`)
                .then((response) => setResult(response.data))
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

        fetchData()
    }, [addToast])

    const [currentDate, setCurrentDate] = useState(moment())

    const handlePrevious = () => {
        setCurrentDate((prevDate) => prevDate.clone().subtract(1, 'days'))
    }

    const handleNext = () => {
        setCurrentDate((prevDate) => prevDate.clone().add(1, 'days'))
    }

    const generateTableHeaders = () => {
        const headers = []
        for (let i = 0; i < 4; i++) {
            headers.push(
                currentDate
                    .clone()
                    .add(i - 1, 'days')
                    .format(`${showDaysOfWeek ? 'dddd' : ''} MMMM DD`),
            )
        }
        return headers
    }

    const generateTableData = () => {
        const data = []
        for (let i = 0; i < 4; i++) {
            const date = currentDate.clone().add(i, 'days').startOf('day')
            const filteredItems = result.filter((item) =>
                moment(item.created_at).isSame(date, 'day'),
            )
            data.push(filteredItems.length > 0 ? filteredItems.map((item) => item) : null)
        }
        return data
    }

    const getColumnCount = () => {
        const width = window.innerWidth
        if (width >= 1400) return 5 // Ultra large
        if (width >= 1200) return 4 // Desktop
        if (width >= 992) return 3 // Laptop
        if (width >= 768) return 2 // Tablet
        return 1 // Phone
    }

    const getCardColor = (status) => {
        if (status === 'cancelled') return 'danger'
        if (status === 'received') return 'primary'
        if (status === 'to_receive' || status === 'to_ship') return 'success'
        // for to_pay
        return 'info'
    }

    const getStatus = (status) => {
        if (status === 'cancelled') return 'Cancelled'
        if (status === 'received') return 'Received'
        if (status === 'to_receive') return 'To Receive'
        if (status === 'to_ship') return 'To Ship'
        // for to_pay
        return 'To Pay'
    }

    const getHolidays = (index) => {
        const holidays = hd.isHoliday(currentDate.clone().add(index, 'days').format('YYYY-MM-DD'))
        if (!holidays) return
        for (const holiday of holidays) {
            if (holiday) {
                return (
                    <p
                        className="badge bg-info p-3"
                        data-aos="fade-in"
                        data-aos-delay={`${index * 100}`}
                    >
                        {holiday.name}
                    </p>
                )
            }
        }
    }

    useEffect(() => {
        const handleResize = () => {
            setCurrentDate((prevDate) => prevDate.clone())
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    if (loading)
        return (
            <div className="loading-overlay">
                <CSpinner color="primary" variant="grow" />
            </div>
        )

    return (
        <div>
            <div className="d-flex justify-content-between mb-3">
                <div>
                    <h2>Schedules</h2>
                    <strong>Locale:</strong> {locale}
                    <div>
                        <CFormCheck
                            className="me-3"
                            checked={showHolidays}
                            onChange={() => {
                                setShowHolidays(!showHolidays)
                                cookies.set('showHolidays', !showHolidays)
                            }}
                            label="Show Holidays"
                        />
                        <CFormCheck
                            className="me-3"
                            checked={showDaysOfWeek}
                            onChange={() => {
                                setShowDaysOfWeek(!showDaysOfWeek)
                                cookies.set('showDaysOfWeek', !showDaysOfWeek)
                            }}
                            label="Show Days of Week"
                        />
                    </div>
                </div>
                <div>
                    <CFormInput
                        type="date"
                        className="form-control w-auto"
                        value={currentDate.format('YYYY-MM-DD')}
                        min="2025-01-01"
                        onChange={(e) => setCurrentDate(moment(e.target.value))}
                        required
                    />
                </div>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <button
                    className="btn btn-primary"
                    onClick={handlePrevious}
                    disabled={currentDate.isBefore(moment('2025-01-01')) || isNaN(currentDate)}
                >
                    &lt; Previous
                </button>
                <button
                    className="btn btn-primary"
                    onClick={handleNext}
                    disabled={isNaN(currentDate)}
                >
                    Next &gt;
                </button>
            </div>

            {isNaN(currentDate) ? (
                <div className="text-center">
                    <div className="text-body-secondary">
                        <h1 className="d-block text-danger">Invalid Date</h1>
                        <span>Please select a date to view the schedule.</span>
                    </div>
                </div>
            ) : (
                <CTable
                    responsive
                    className="table-even-width"
                    style={{
                        '--cui-table-bg': 'transparent',
                        '--cui-table-border-color': 'transparent',
                    }}
                >
                    <CTableHead>
                        <CTableRow>
                            {generateTableHeaders()
                                .slice(0, getColumnCount())
                                .map((header, index) => (
                                    <CTableHeaderCell
                                        key={index}
                                        className="text-center text-uppercase fw-bold poppins-regular table-header-cell-no-wrap"
                                    >
                                        <CBadge color="secondary" className="p-2 px-4">
                                            {header}
                                        </CBadge>
                                    </CTableHeaderCell>
                                ))}
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        <CTableRow>
                            {generateTableData()
                                .slice(0, getColumnCount())
                                .map((data, index) => (
                                    <CTableDataCell key={index}>
                                        <div className="d-block text-center">
                                            {showHolidays && <div>{getHolidays(index)}</div>}
                                            {data
                                                ? data.map((shipment, index) => {
                                                      return (
                                                          <CCard
                                                              body
                                                              key={index}
                                                              className={`bg-${getCardColor(shipment.status)} rounded p-3 m-2 text-start text-white`}
                                                              onClick={() =>
                                                                  navigate(
                                                                      `/shipment/${shipment.tracking_number}`,
                                                                  )
                                                              }
                                                              data-aos="fade-in"
                                                              data-aos-delay={`${index * 100}`}
                                                          >
                                                              <div className="d-flex justify-content-between">
                                                                  <div className="mb-2">
                                                                      <small className="text-muted d-block">
                                                                          Tracing number
                                                                      </small>
                                                                      {shipment.tracking_number}
                                                                  </div>
                                                                  <div>
                                                                      <small className="text-muted d-block">
                                                                          Status
                                                                      </small>
                                                                      {getStatus(shipment.status)}
                                                                  </div>
                                                              </div>

                                                              {shipment.courier !== 'none' && (
                                                                  <div className="mb-2">
                                                                      <small className="text-muted d-block">
                                                                          Courier
                                                                      </small>
                                                                      {shipment.courier}
                                                                  </div>
                                                              )}

                                                              <div className="mb-2">
                                                                  <small className="text-muted d-block">
                                                                      To Country
                                                                  </small>
                                                                  {shipment.country}
                                                              </div>

                                                              <div className="mb-2">
                                                                  <small className="text-muted d-block">
                                                                      Items/Weight
                                                                  </small>
                                                                  {shipment.number_of_items +
                                                                      ' items'}{' '}
                                                                  {shipment.total_weight + 'kg '}
                                                              </div>

                                                              <div className="mb-2">
                                                                  <small className="text-muted d-block">
                                                                      Amount
                                                                  </small>
                                                                  {new Intl.NumberFormat('en-US', {
                                                                      style: 'currency',
                                                                      currency:
                                                                          shipment.amount.currency,
                                                                  }).format(shipment.amount.value)}
                                                              </div>
                                                          </CCard>
                                                      )
                                                  })
                                                : 'No Shipment'}
                                        </div>
                                    </CTableDataCell>
                                ))}
                        </CTableRow>
                    </CTableBody>
                </CTable>
            )}
        </div>
    )
}

export default Schedules
