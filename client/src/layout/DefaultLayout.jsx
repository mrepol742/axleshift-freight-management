import React, { useEffect, useState } from 'react'
import {
    CToaster,
    CToast,
    CToastHeader,
    CToastBody,
    CImage,
    CModal,
    CButton,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
} from '@coreui/react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import { useToast } from '../components/AppToastProvider'
import { useModal } from '../components/AppModalProvider'
import { useNotif } from '../components/AppNotificationProvider'
import { useUserProvider } from '../components/UserProvider'
import parseTimestamp from '../utils/Timestamp'
import FloatingChat from '../components/FloatingChat'
import AppNetwork from '../components/AppNetwork'

const DefaultLayout = () => {
    const { toasts, addToast } = useToast()
    const { modal, addModal } = useModal()
    const { addNotif } = useNotif()
    const [visibleModals, setVisibleModals] = useState({})
    const { user } = useUserProvider()
    const [isPasswordExpired, setPasswordExpired] = useState(false)

    const handleClose = (id) => {
        setVisibleModals((prev) => ({ ...prev, [id]: false }))
    }

    useEffect(() => {
        if (!user._id) return

        const fetchNotifications = async () => {
            try {
                const response = await axios.get('/notifications')
                response.data.forEach((notif) => addNotif(notif))
            } catch (error) {
                console.error('Error fetching notifications:', error)
            }
        }
        fetchNotifications()

        const password = () => {
            if (user.password_changed_on) {
                setPasswordExpired(Date.now() - user.password_changed_on > 90 * 24 * 60 * 60 * 1000)
            }
        }
        password()
        Notification.requestPermission().then((permission) => {
            if (permission !== 'granted')
                addToast('Please allow notifications to receive updates', 'Notification')
        })
    }, [user, addToast, addNotif])

    return (
        <div>
            <AppSidebar />
            <div className="wrapper d-flex flex-column min-vh-100">
                <AppNetwork />
                <AppHeader />
                <div className="body flex-grow-1">
                    <AppContent />
                </div>
                <AppFooter />
            </div>

            <CToaster className="position-fixed top-0 end-0 p-3">
                {toasts.map((toast) => (
                    <CToast key={toast.id} autohide={true} visible={true}>
                        <CToastHeader closeButton>
                            <CImage
                                className="rounded me-2"
                                src="/favicon.ico"
                                width="20"
                                loading="lazy"
                            />
                            <div className="fw-bold me-auto">{toast.header}</div>
                            <small>{parseTimestamp(toast.id)}</small>
                        </CToastHeader>
                        <CToastBody>{toast.message}</CToastBody>
                    </CToast>
                ))}
            </CToaster>
            <div
                className="position-fixed top-50 start-50 translate-middle p-3"
                style={{ zIndex: 1050 }}
            >
                {modal.map((_modal) => (
                    <div key={_modal.id}>
                        <CModal
                            alignment="center"
                            scrollable
                            visible={visibleModals[_modal.id] || true}
                            onClose={() => handleClose(_modal.id)}
                            aria-labelledby={_modal.id}
                        >
                            <CModalHeader>
                                <CModalTitle id={_modal.id}>{_modal.header}</CModalTitle>
                            </CModalHeader>
                            <CModalBody>{_modal.body}</CModalBody>
                            <CModalFooter>
                                <CButton color="primary" onClick={(e) => handleClose(_modal.id)}>
                                    {_modal.primaryButton[0].title}
                                </CButton>
                            </CModalFooter>
                        </CModal>
                    </div>
                ))}
            </div>
            {user.role === 'user' && (
                <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 2050 }}>
                    <FloatingChat />
                </div>
            )}
            {/* 90 Days */}
            {isPasswordExpired && window.location.pathname !== '/account/security' && (
                <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 2050 }}>
                    <CModal
                        backdrop="static"
                        alignment="center"
                        scrollable
                        visible={true}
                        onClose={() => handleClose('password')}
                        aria-labelledby="password"
                    >
                        <CModalHeader>
                            <CModalTitle id="password">Password Change Required</CModalTitle>
                        </CModalHeader>
                        <CModalBody>
                            Your password has not been changed in a while. Please consider changing
                            it.
                        </CModalBody>
                        <CModalFooter>
                            <CButton color="success" onClick={() => navigate(`/account/security`)}>
                                Change Password
                            </CButton>
                        </CModalFooter>
                    </CModal>
                </div>
            )}
        </div>
    )
}

export default DefaultLayout
