import React, { useEffect, useState } from 'react'
import {
    CFormInput,
    CFormSelect,
    CRow,
    CCol,
    CSpinner,
    CButton,
    CAlert,
    CContainer,
    CModal,
    CModalHeader,
    CModalBody,
    CModalTitle,
    CModalFooter,
    CFormCheck,
} from '@coreui/react'
import ReCAPTCHA from 'react-google-recaptcha'
import { Helmet } from 'react-helmet'
import { VITE_APP_RECAPTCHA_SITE_KEY } from '../../../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import { useToast } from '../../../components/AppToastProvider'

const GEO = () => {
    const recaptchaRef = React.useRef()
    const { addToast } = useToast()
    const [loading, setLoading] = useState(true)
    const [state, setState] = useState(0)
    const [geoLocationList, setGeoLocationList] = useState([])
    const [geoLocationListCopy, setGeoLocationListCopy] = useState([])
    const [modal, setModal] = useState(false)

    const saveData = async () => {
        const recaptcha = await recaptchaRef.current.executeAsync()
        setLoading(true)
        axios
            .post(`/sec/management/geo`, {
                recaptcha_ref: recaptcha,
                filter_mode: state,
                geo: geoLocationList,
            })
            .then((response) => {
                if (response.data.error) return addToast(response.data.error)
                addToast('Changes saved successfully', 'Success')
                setGeoLocationListCopy(geoLocationList)
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

    useEffect(() => {
        const fetchData = async () => {
            axios
                .get(`/sec/management/geo`)
                .then((response) => {
                    setState(response.data.filter_mode)
                    setGeoLocationList(response.data.geo.map((geo) => ({ geo, checked: false })))
                    setGeoLocationListCopy(
                        response.data.geo.map((geo) => ({ geo, checked: false })),
                    )
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
    }, [addToast])

    const handleAddGeo = () => {
        setGeoLocationList([...geoLocationList, { geo: [], checked: false }])
    }

    const handleGeoChange = (index, value, type) => {
        const newgeoLocationList = [...geoLocationList]
        newgeoLocationList[index].geo = {
            ...newgeoLocationList[index].geo,
            [type]: value,
        }
        setGeoLocationList(newgeoLocationList)
    }

    const handleCheckboxChange = (index, checked) => {
        const newgeoLocationList = [...geoLocationList]
        newgeoLocationList[index].checked = checked
        setGeoLocationList(newgeoLocationList)
    }

    const promptDeleteModal = () => {
        const selectedItems = geoLocationList.filter((item) => item.checked)
        if (selectedItems.length === 0)
            return addToast('Please select at least one GEO Location to delete.')
        setModal(true)
    }

    const handleDeleteGeo = () => {
        setModal(false)
        setGeoLocationList(geoLocationList.filter((item) => !item.checked))
    }

    if (loading)
        return (
            <div className="loading-overlay">
                <CSpinner color="primary" variant="grow" />
            </div>
        )

    return (
        <div>
            <Helmet>
                <title>GeoLocation Filter - Management | Axleshift</title>
            </Helmet>
            <CAlert color="warning" className="small">
                <FontAwesomeIcon icon={faCircleExclamation} className="me-2" /> Block or allow
                specific set of coordinates on who can access this platform via login or
                registration.
            </CAlert>

            <CRow className="align-items-center mb-2">
                <CCol>
                    <h4 className="mb-0">GeoLocation Filtering</h4>
                </CCol>
                <CCol className="text-right d-flex justify-content-end">
                    <CButton color="primary" onClick={handleAddGeo}>
                        New
                    </CButton>
                    <CButton color="danger" onClick={promptDeleteModal} className="ms-2">
                        Delete
                    </CButton>
                </CCol>
            </CRow>
            <CRow className="align-items-center mb-2">
                <CCol className="d-flex align-items-center">
                    <span className="me-3">Filter Mode:</span>
                    <CFormSelect
                        aria-label="Select whitelist or blacklist"
                        onChange={(e) => setState(e.target.value)}
                        value={state}
                        className="w-auto"
                    >
                        <option value="whitelist">Whitelist</option>
                        <option value="blacklist">Blacklist</option>
                    </CFormSelect>
                </CCol>
            </CRow>
            {geoLocationList.length === 0 && geoLocationListCopy.length === 0 && (
                <CContainer className="my-5">
                    <div className="text-center">
                        <div className="text-body-secondary">
                            <h1 className="d-block text-danger">No GEO Location added yet.</h1>
                            <span>Please click &quot;New&quot; to add a GEO Location.</span>
                        </div>
                    </div>
                </CContainer>
            )}
            {geoLocationList.map((item, index) => (
                <div key={index} className="d-block d-md-flex mb-2">
                    <CFormCheck
                        checked={item.checked}
                        onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                    />
                    <CFormInput
                        type="text"
                        value={item.geo.latitude}
                        onChange={(e) => handleGeoChange(index, e.target.value, 'latitude')}
                        placeholder="Enter Latitude"
                        className="me-2 ms-0 ms-md-2 mb-2 mb-md-0"
                    />
                    <CFormInput
                        type="text"
                        value={item.geo.longitude}
                        onChange={(e) => handleGeoChange(index, e.target.value, 'longitude')}
                        placeholder="Enter Longitude"
                    />
                </div>
            ))}
            <CButton
                color="primary"
                onClick={saveData}
                className="mb-4"
                disabled={geoLocationList.length === 0 && geoLocationListCopy.length === 0}
            >
                Apply all changes
            </CButton>
            <CModal
                alignment="center"
                scrollable
                visible={modal}
                onClose={() => setModal(false)}
                aria-labelledby="M"
            >
                <CModalHeader>
                    <CModalTitle>Confirm Delete?</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <ul>
                        {geoLocationList
                            .filter((item) => item.checked)
                            .map((item, index) => (
                                <li key={index}>
                                    {item.geo.latitude} - {item.geo.longitude}
                                </li>
                            ))}
                    </ul>
                    Are you sure you want to delete the selected GEO Location? This action cannot be
                    undone.
                </CModalBody>
                <CModalFooter className="d-flex justify-content-end">
                    <CButton color="secondary" onClick={handleDeleteGeo}>
                        Delete
                    </CButton>
                    <CButton
                        color="primary"
                        onClick={() => {
                            setModal(false)
                        }}
                        className="ms-2"
                    >
                        Cancel
                    </CButton>
                </CModalFooter>
            </CModal>
            <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={VITE_APP_RECAPTCHA_SITE_KEY} />
        </div>
    )
}

export default GEO
