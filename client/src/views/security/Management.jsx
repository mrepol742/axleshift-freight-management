import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CTabs,
    CTabList,
    CTab,
    CTabContent,
    CTabPanel,
    CSpinner,
    CNavItem,
    CButton,
    CNavbarNav,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faChartLine,
    faTowerBroadcast,
    faBug,
    faKey,
    faList,
    faPersonDigging,
    faUser,
    faGlobe,
} from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import {
    Users,
    LogManagement,
    Dependabot,
    Maintenance,
    Sentry,
    Sessions,
    IPFiltering,
    GEO,
} from './panel/index'

const SecurityManagement = () => {
    const tabMap = {
        users: 0,
        sessions: 1,
        dependabot: 2,
        sentry: 3,
        accountLogs: 4,
        maintenance: 5,
        'ip-filtering': 6,
        geo: 7,
    }
    const navigate = useNavigate()
    const tab = window.location.hash ? window.location.hash.substring(1) : 'users'
    const [activeItemKey, setActiveItemKey] = useState(tabMap[tab] ?? 0)

    const handleTabChange = (itemKey, tabName) => {
        setActiveItemKey(itemKey)
        navigate(`#${tabName}`)
    }

    return (
        <div>
            <div className="d-flex overflow-auto mb-2">
                <CButton
                    className={`${activeItemKey === 0 ? 'btn-primary' : ''} text-nowrap me-1`}
                    onClick={() => handleTabChange(0, 'users')}
                >
                    <FontAwesomeIcon icon={faUser} className="me-1" /> Users
                </CButton>

                <CButton
                    className={`${activeItemKey === 1 ? 'btn-primary' : ''} text-nowrap me-1`}
                    onClick={() => handleTabChange(1, 'sessions')}
                >
                    <FontAwesomeIcon icon={faTowerBroadcast} className="me-1" /> Sessions
                </CButton>

                <CButton
                    className={`${activeItemKey === 2 ? 'btn-primary' : ''} text-nowrap me-1`}
                    onClick={() => handleTabChange(2, 'dependabot')}
                >
                    <FontAwesomeIcon icon={faGithub} className="me-1" /> Dependabot
                </CButton>

                <CButton
                    className={`${activeItemKey === 3 ? 'btn-primary' : ''} text-nowrap me-1`}
                    onClick={() => handleTabChange(3, 'sentry')}
                >
                    <FontAwesomeIcon icon={faBug} className="me-1" /> Sentry
                </CButton>

                <CButton
                    className={`${activeItemKey === 4 ? 'btn-primary' : ''} text-nowrap me-1`}
                    onClick={() => handleTabChange(4, 'accountLogs')}
                >
                    <FontAwesomeIcon icon={faList} className="me-1" /> Logs
                </CButton>

                <CButton
                    className={`${activeItemKey === 5 ? 'btn-primary' : ''} text-nowrap me-1`}
                    onClick={() => handleTabChange(5, 'maintenance')}
                >
                    <FontAwesomeIcon icon={faPersonDigging} className="me-1" /> Maintenance
                </CButton>

                <CButton
                    className={`${activeItemKey === 6 ? 'btn-primary' : ''} text-nowrap me-1`}
                    onClick={() => handleTabChange(6, 'ip-filtering')}
                >
                    <FontAwesomeIcon icon={faGlobe} className="me-1" /> IP Filtering
                </CButton>

                <CButton
                    className={`${activeItemKey === 7 ? 'btn-primary' : ''} text-nowrap me-1`}
                    onClick={() => handleTabChange(7, 'geo')}
                >
                    <FontAwesomeIcon icon={faGlobe} className="me-1" /> Geo
                </CButton>
            </div>
            <div className="tab-content">
                {activeItemKey === 0 && <Users />}
                {activeItemKey === 1 && <Sessions />}
                {activeItemKey === 2 && <Dependabot />}
                {activeItemKey === 3 && <Sentry />}
                {activeItemKey === 4 && <LogManagement />}
                {activeItemKey === 5 && <Maintenance />}
                {activeItemKey === 6 && <IPFiltering />}
                {activeItemKey === 7 && <GEO />}
            </div>
        </div>
    )
}

export default SecurityManagement
