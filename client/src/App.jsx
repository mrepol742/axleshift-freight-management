import React, { Suspense, useEffect, lazy } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import AOS from 'aos'
import { CSpinner, useColorModes } from '@coreui/react'
import { TourProvider } from '@reactour/tour'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import './scss/style.scss'
import AppErrorBoundary from './components/AppErrorBoundary'
import Analytics from './components/AppAnalytics'
import DocumentTitle from './components/AppDocumentTitle'
import IdleTimeout from './components/AppIdleTimeout'
import Auth from './components/AppAuth'
import routes from './routes'
import steps from './steps'
import './bootstrap'

const DefaultLayout = lazy(() => import('./layout/DefaultLayout'))

const App = () => {
    AOS.init()
    const { colorMode, isColorModeSet, setColorMode } = useColorModes('theme')
    const storedTheme = useSelector((state) => state.theme)
    const dispatch = useDispatch()
    const disableBody = (target) => disableBodyScroll(target)
    const enableBody = (target) => enableBodyScroll(target)
    const [disableKeyboardNavigation] = ['esc']

    useEffect(() => {
        const init = () => {
            const urlParams = new URLSearchParams(window.location.href.split('?')[1])
            const theme =
                urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
            if (theme) {
                dispatch({ type: 'set', theme: theme })
                setColorMode(theme)
                return
            }

            if (isColorModeSet()) return dispatch({ type: 'set', theme: colorMode })
            setColorMode(storedTheme)
        }

        init()
    }, [colorMode, dispatch, isColorModeSet, setColorMode, storedTheme])

    return (
        <TourProvider
            steps={steps}
            afterOpen={disableBody}
            beforeClose={enableBody}
            disableKeyboardNavigation={disableKeyboardNavigation}
            onClickMask={({ setCurrentStep, currentStep, steps, setIsOpen }) => {
                if (steps) {
                    if (currentStep === steps.length - 1) {
                        setIsOpen(false)
                    }
                    setCurrentStep((s) => (s === steps.length - 1 ? 0 : s + 1))
                }
            }}
            styles={{
                popover: (base) => ({
                    ...base,
                    color: 'var(--cui-body-color)',
                    backgroundColor: 'var(--cui-body-bg)',
                    boxShadow: 'var(--cui-box-shadow-lg)',
                    borderRadius: 'var(--cui-border-radius)',
                }),
            }}
        >
            <Router>
                <Suspense
                    fallback={
                        <div className="loading-overlay">
                            <CSpinner color="primary" variant="grow" />
                        </div>
                    }
                >
                    <Analytics>
                        <AppErrorBoundary>
                            <DocumentTitle>
                                <IdleTimeout>
                                    <Routes>
                                        {routes.map((route, idx) => {
                                            return (
                                                route.external && (
                                                    <Route
                                                        key={idx}
                                                        path={route.path}
                                                        exact={route.exact}
                                                        name={route.name}
                                                        element={<route.element />}
                                                    />
                                                )
                                            )
                                        })}
                                        <Route element={<Auth />}>
                                            <Route path="*" element={<DefaultLayout />} />
                                        </Route>
                                    </Routes>
                                </IdleTimeout>
                            </DocumentTitle>
                        </AppErrorBoundary>
                    </Analytics>
                </Suspense>
            </Router>
        </TourProvider>
    )
}

export default App
