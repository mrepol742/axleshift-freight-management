import './instrument'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from '@react-oauth/google'
import 'core-js'
import { AppToastProvider } from './components/AppToastProvider'
import { AppModalProvider } from './components/AppModalProvider'
import { AppNotificationProvider } from './components/AppNotificationProvider'
import { UserProvider } from './components/UserProvider'
import { VITE_APP_GOOGLE_OAUTH_CLIENT_ID } from './config'
import App from './App'
import store from './store'

const div = document.createElement('div')
document.body.appendChild(div)
createRoot(div).render(
    <UserProvider>
        <Provider store={store}>
            <GoogleOAuthProvider clientId={VITE_APP_GOOGLE_OAUTH_CLIENT_ID}>
                <AppToastProvider>
                    <AppModalProvider>
                        <AppNotificationProvider>
                            <App />
                        </AppNotificationProvider>
                    </AppModalProvider>
                </AppToastProvider>
            </GoogleOAuthProvider>
        </Provider>
    </UserProvider>,
)
