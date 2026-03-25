import React, { useState, useEffect } from 'react'
import { CCard, CSpinner } from '@coreui/react'
import PropTypes from 'prop-types'
import database from '../../../firebase'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { useUserProvider } from '../../../components/UserProvider'
import Inbox from './Inbox'
import MessageBox from './MessageBox'

const Messages = ({ float, isOpen, setIsOpen }) => {
    const [loading, setLoading] = useState(false)
    const [selectedUser, setselectedUser] = useState(null)
    const [isMobile, setIsMobile] = useState(false)
    const [showUserList, setshowUserList] = useState(true)
    const [threadsID, setThreadsID] = useState([])
    const { user } = useUserProvider()
    const messagesRef = collection(database, 'messages')

    useEffect(() => {
        if (!user) return

        function getThreads() {
            const urlParams = new URLSearchParams(window.location.search)
            const ref = urlParams.get('ref')
            if (!user._id) return
            if (user && !selectedUser && user.role === 'user')
                return setselectedUser({ sender_id: user.ref })
            setLoading(true)
            if (ref) setselectedUser({ sender_id: ref })
            return onSnapshot(query(messagesRef, orderBy('timestamp')), (snapshot) => {
                let latestMessagesMap = new Map()
                let thread = []

                snapshot.docs.reverse().forEach((doc) => {
                    const msg = { id: doc.id, ...doc.data() }

                    if (!thread.includes(msg.sender_id) || (ref && msg.sender_id === ref)) {
                        latestMessagesMap.set(msg.sender_id, msg)
                        thread.push(msg.sender_id)
                    }
                })

                if (ref && !thread.includes(ref)) {
                    const addition = new Map()
                    addition.set(ref, {
                        id: ref,
                        sender_id: ref,
                        message: '',
                        role: 'user',
                        timestamp: Date.now(),
                    })
                    latestMessagesMap = new Map([...addition, ...latestMessagesMap])
                }

                // i need coffeeeeeeeeee
                const latestMessagesArray = Array.from(latestMessagesMap.values())
                setThreadsID(latestMessagesArray)
                setLoading(false)
            })
        }

        const unsubscribe = getThreads()

        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => {
            window.removeEventListener('resize', checkMobile)
            if (unsubscribe) unsubscribe()
        }
    }, [user, messagesRef, selectedUser])

    const handleSelectUser = (patient) => {
        setselectedUser(patient)
        if (isMobile) {
            setshowUserList(false)
        }
    }

    const handleBackToList = () => {
        if (isMobile) {
            setshowUserList(true)
        }
    }

    if (loading)
        return (
            <div className="loading-overlay">
                <CSpinner color="primary" variant="grow" />
            </div>
        )

    if (!messagesRef)
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: '70vh' }}
            >
                <p>No messages yet</p>
            </div>
        )

    return (
        <div className="mb-3">
            <CCard>
                <div
                    className="d-flex"
                    style={{
                        height: isMobile ? 'calc(100vh - 180px)' : float ? '40vh' : '70vh',
                        flexDirection: isMobile ? 'column' : 'row',
                    }}
                >
                    {user?.role !== 'user' &&
                        (!isMobile || (isMobile && showUserList)) &&
                        !float && (
                            <Inbox
                                threadsID={threadsID}
                                selectedUser={selectedUser}
                                handleSelectUser={handleSelectUser}
                                isMobile={isMobile}
                            />
                        )}

                    {(user?.role === 'user' ||
                        !isMobile ||
                        (isMobile && !showUserList) ||
                        isOpen) && (
                        <MessageBox
                            isOpen={isOpen}
                            setIsOpen={setIsOpen}
                            messagesRef={messagesRef}
                            selectedUser={selectedUser}
                            handleBackToList={handleBackToList}
                            isMobile={isMobile}
                            showBackButton={isMobile && user?.role !== 'user'}
                        />
                    )}
                </div>
            </CCard>
        </div>
    )
}

export default Messages

Messages.propTypes = {
    float: PropTypes.bool,
    isOpen: PropTypes.bool,
    setIsOpen: PropTypes.func,
}
