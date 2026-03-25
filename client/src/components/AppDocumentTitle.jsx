import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import routes from '../routes'

const AppDocumentTitle = ({ children }) => {
    let currentLocation = useLocation().pathname
    if (currentLocation != '/') currentLocation = currentLocation.replace(/\/$/, '')

    const getRouteName = (pathname, routes) => {
        const currentRoute = routes.find((route) => route.path === pathname)
        return currentRoute ? currentRoute.name : false
    }

    useEffect(() => {
        let routeName = getRouteName(currentLocation, routes)
        if (routeName) document.title = routeName + ' | Axleshift'
    }, [currentLocation])

    return <>{children}</>
}

export default React.memo(AppDocumentTitle)

AppDocumentTitle.propTypes = {
    children: PropTypes.node.isRequired,
}
