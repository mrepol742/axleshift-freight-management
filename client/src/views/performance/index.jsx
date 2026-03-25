import React, { useEffect, useState } from 'react'
import { CRow, CCol, CWidgetStatsF } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisVertical, faChartPie, faCircleNodes } from '@fortawesome/free-solid-svg-icons'
import { useToast } from '../../components/AppToastProvider'
import parseTimestamp from '../../utils/Timestamp'
import Widgets from './Widgets'

const Dashboard = () => {
    const [mongodb, setMongoDb] = useState({
        connections: [{ current: 0, available: 0 }],
        oplog: [{ getMoreOps: 0, networkBytes: 0 }],
        operations: [{ insert: 0, query: 0, update: 0, delete: 0, getmore: 0, command: 0 }],
    })
    const [redis, setRedis] = useState(null)
    const [loading, setLoading] = useState(true)
    const { addToast } = useToast()
    const [cpuUsageData, setCpuUsageData] = useState([])
    const [totalAverageLoadData, setTotalAverageLoadData] = useState([])

    const calculateAverageLoad = (userSeconds, systemSeconds, totalSeconds, startTime) => {
        const uptime = Date.now() / 1000 - startTime
        const averageLoad = (userSeconds + systemSeconds) / uptime
        setTotalAverageLoadData((prevData) => [...prevData, parseFloat(averageLoad.toFixed(2))])
    }

    const someMath = (arr) => {
        const nonZeroValues = arr.filter((value) => value !== 0)
        const sum = nonZeroValues.reduce((acc, curr) => acc + curr, 0)
        const count = nonZeroValues.length

        return count === 0 ? 0 : sum / count
    }

    function formatTTL(ms) {
        if (ms <= 0 || isNaN(ms)) return '0 ms'

        const seconds = Math.floor((ms / 1000) % 60)
        const minutes = Math.floor((ms / (1000 * 60)) % 60)
        const hours = Math.floor(ms / (1000 * 60 * 60))

        const parts = []
        if (hours) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`)
        if (minutes) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`)
        if (seconds || (!hours && !minutes))
            parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`)

        return parts.join(' ')
    }

    useEffect(() => {
        const fetchData = async () => {
            axios
                .get(`/metrics/prometheus`)
                .then((response) => {
                    const data = response.data
                    calculateAverageLoad(
                        parseFloat(data.process_cpu_user_seconds_total[0].value),
                        parseFloat(data.process_cpu_system_seconds_total[0].value),
                        parseFloat(data.process_cpu_seconds_total[0].value),
                        parseFloat(data.process_start_time_seconds[0].value),
                    )
                    setCpuUsageData((prevData) => [
                        ...prevData,
                        parseFloat(data.process_cpu_seconds_total[0].value.toFixed(2)),
                    ])
                })
                .catch((error) => {
                    const message =
                        error.response?.data?.error ||
                        (error.message === 'network error'
                            ? 'Server is offline or restarting please wait'
                            : error.message)
                    addToast(message)
                })
            axios
                .get(`/metrics/mongodb`)
                .then((response) => {
                    setMongoDb(response.data)
                })
                .catch((error) => {
                    const message =
                        error.response?.data?.error ||
                        (error.message === 'network error'
                            ? 'Server is offline or restarting please wait'
                            : error.message)
                    addToast(message)
                })
            axios
                .get(`/metrics/redis`)
                .then((response) => {
                    setRedis(response.data)
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

        fetchData()

        const intervalId = setInterval(() => {
            fetchData()
        }, 5000)

        return () => clearInterval(intervalId)
    }, [addToast])

    if (loading) return ''

    return (
        <div>
            <h4>System</h4>
            <CRow xs={{ gutter: 4 }}>
                <CCol sm={6} xl={4} xxl={3}>
                    <Widgets
                        color="primary"
                        title="Average Load Time"
                        value={`${someMath(totalAverageLoadData).toFixed(2)}ms`}
                        data={totalAverageLoadData}
                    />
                </CCol>
                <CCol sm={6} xl={4} xxl={3}>
                    <Widgets
                        color="danger"
                        title="CPU Usage"
                        value={`${someMath(cpuUsageData).toFixed(2)}%`}
                        data={cpuUsageData}
                    />
                </CCol>
            </CRow>
            <h4 className="mt-3">Atlas</h4>
            <CRow>
                <CCol md={6}>
                    <CWidgetStatsF
                        padding={false}
                        color="primary"
                        className="mb-3"
                        icon={<FontAwesomeIcon icon={faChartPie} className="fa-3x" />}
                        title={`${mongodb.connections[0].current.toLocaleString()} Connections`}
                        value={
                            (
                                (mongodb.connections[0].current /
                                    mongodb.connections[0].available) *
                                100
                            ).toFixed(2) + '%'
                        }
                    />
                </CCol>
                <CCol md={6}>
                    <CWidgetStatsF
                        padding={false}
                        color="secondary"
                        className="mb-3"
                        icon={<FontAwesomeIcon icon={faChartPie} className="fa-3x" />}
                        value={`${mongodb.oplog[0].getMoreOps.toLocaleString()} GetMore Ops`}
                        title={`${mongodb.oplog[0].networkBytes.toLocaleString()} Network Bytes`}
                    />
                </CCol>
            </CRow>
            <CRow>
                <CCol md={6}>
                    <CWidgetStatsF
                        padding={false}
                        color="warning"
                        className="mb-3"
                        icon={<FontAwesomeIcon icon={faChartPie} className="fa-3x" />}
                        value={`${mongodb.operations[0].insert.toLocaleString()} insertions`}
                        title={`${mongodb.operations[0].query.toLocaleString()} queries`}
                    />
                </CCol>
                <CCol md={6}>
                    <CWidgetStatsF
                        padding={false}
                        color="info"
                        className="mb-3"
                        icon={<FontAwesomeIcon icon={faChartPie} className="fa-3x" />}
                        title={`${mongodb.operations[0].update.toLocaleString()} updates`}
                        value={`${mongodb.operations[0].delete.toLocaleString()} deletes`}
                    />
                </CCol>
            </CRow>
            <CRow>
                <CCol md={6}>
                    <CWidgetStatsF
                        padding={false}
                        color="danger"
                        className="mb-3"
                        icon={<FontAwesomeIcon icon={faChartPie} className="fa-3x" />}
                        value={`${mongodb.operations[0].getmore.toLocaleString()} operations`}
                        title={`${mongodb.operations[0].command.toLocaleString()} commands`}
                    />
                </CCol>
            </CRow>
            <h4 className="mt-3">Redis</h4>
            <CRow>
                <CCol md={6}>
                    <CWidgetStatsF
                        padding={false}
                        color="info"
                        className="mb-3"
                        icon={<FontAwesomeIcon icon={faChartPie} className="fa-3x" />}
                        title={`${redis.totalKeys.toLocaleString()} Total Keys`}
                        value={`${redis.keysWithExpiry.toLocaleString()} Keys Expiring`}
                    />
                </CCol>
                <CCol md={6}>
                    <CWidgetStatsF
                        padding={false}
                        color="warning"
                        className="mb-3"
                        icon={<FontAwesomeIcon icon={faChartPie} className="fa-3x" />}
                        title={`${formatTTL(redis.avgTTLms)} Average TTL`}
                        value={`${redis.usedMemory.toLocaleString()} Used Memory`}
                    />
                </CCol>
            </CRow>
            <CRow>
                <CCol md={6}>
                    <CWidgetStatsF
                        padding={false}
                        color="primary"
                        className="mb-3"
                        icon={<FontAwesomeIcon icon={faChartPie} className="fa-3x" />}
                        title={`${redis.totalCommandsProcessed.toLocaleString()} Commands Processed`}
                        value={`${redis.opsPerSec.toLocaleString()} Ops per second`}
                    />
                </CCol>
            </CRow>
        </div>
    )
}

export default Dashboard
