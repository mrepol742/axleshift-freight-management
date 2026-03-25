import React, { useState, useEffect } from 'react'
import {
    CDropdown,
    CDropdownMenu,
    CDropdownToggle,
    CListGroup,
    CListGroupItem,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/free-solid-svg-icons'
import { useNotif } from './AppNotificationProvider'
import parseTimestamp from '../utils/Timestamp'
import { useUserProvider } from '../components/UserProvider'

const AppNotificationDropdown = () => {
    const { notifs } = useNotif()
    const { user } = useUserProvider()
    const [hasUnread, setHasUnread] = useState(false)

    useEffect(() => {
        const unread = () => {
            setHasUnread(notifs.some((notif) => !notif.is_read))
        }

        unread()
    }, [notifs])

    const markAllAsRead = async () => {
        try {
            await axios.post('/notifications')
            setHasUnread(false)
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }

    return (
        <CDropdown variant="nav-item" className="my-auto app-header-notification">
            <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
                <FontAwesomeIcon icon={faBell} />
            </CDropdownToggle>
            <CDropdownMenu
                className="p-0"
                placement="bottom-end"
                style={{ width: '350px', maxHeight: '500px', overflowY: 'auto' }}
            >
                <CListGroup>
                    <CListGroupItem className="bg-body-secondary d-flex justify-content-between align-items-center">
                        <FontAwesomeIcon icon={faBell} />
                        <small
                            onClick={markAllAsRead}
                            disabled={hasUnread}
                            style={{ cursor: hasUnread ? 'pointer' : 'not-allowed' }}
                        >
                            Mark all as read
                        </small>
                    </CListGroupItem>
                    {notifs &&
                        notifs.map((notif) => (
                            <CListGroupItem key={notif._id} disabled={notif.is_read}>
                                <h6 className="mb-1">{notif.event.title}</h6>
                                <p className="mb-1">{notif.event.message}</p>
                                <small className="text-muted">{parseTimestamp(notif.time)}</small>
                            </CListGroupItem>
                        ))}

                    {notifs.length === 0 && (
                        <CListGroupItem className="py-3 my-3" disabled>
                            You have no Notification yet. <br /> Come back later.
                        </CListGroupItem>
                    )}
                </CListGroup>
            </CDropdownMenu>
        </CDropdown>
    )
}

export default AppNotificationDropdown
