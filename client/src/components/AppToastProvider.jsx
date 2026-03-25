import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export const AppToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message = '', header = 'Axleshift') => {
        const newToast = {
            id: Date.now(),
            message,
            header,
        }
        setToasts((prevToasts) => [...prevToasts, newToast])
    }, [])

    return <ToastContext.Provider value={{ toasts, addToast }}>{children}</ToastContext.Provider>
}

export const useToast = () => useContext(ToastContext)

AppToastProvider.propTypes = {
    children: PropTypes.node.isRequired,
}
