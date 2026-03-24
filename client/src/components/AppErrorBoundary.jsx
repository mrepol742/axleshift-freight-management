import React from 'react'
import { CContainer, CButton } from '@coreui/react'
import PropTypes from 'prop-types'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        if (error?.message?.includes('Loading chunk')) return window.location.reload()
        console.error('Error caught by ErrorBoundary: ', error, errorInfo)
        this.setState({ error, errorInfo })
    }

    render() {
        if (this.state.hasError && !this.state.error?.message?.includes('Loading chunk')) {
            return (
                <CContainer className="m-5 rounded-3">
                    <h1 className="mt-4">Something went wrong.</h1>
                    {this.state.errorInfo && <code>{this.state.errorInfo.componentStack}</code>}
                    <CButton
                        color="primary"
                        onClick={() => window.location.reload()}
                        className="mt-3 d-block"
                    >
                        Reload Page
                    </CButton>
                </CContainer>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary

ErrorBoundary.propTypes = {
    children: PropTypes.node,
}
