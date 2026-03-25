import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import Masonry from 'react-masonry-css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlaneDeparture, faTruck, faShip } from '@fortawesome/free-solid-svg-icons'
import Info from './fragments/info'

const ShipNow = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [shipment] = useState({
        is_import: false,
        is_residential_address: false,
        contains_danger_goods: false,
        contains_documents: false,
        from: [
            {
                name: '',
                company: '',
                country: '',
                country_code: '',
                city: '',
                zip_code: '',
                address: '',
                address2: '',
                address3: '',
                phone: '',
                email: '',
                taxId: '',
            },
        ],
        to: [
            {
                name: '',
                company: '',
                country: '',
                country_code: '',
                city: '',
                zip_code: '',
                address: '',
                address2: '',
                address3: '',
                phone: '',
                email: '',
                employerId: '',
            },
        ],
        type: 'private',
        items: [],
        status: 'to_pay',
    })
    const [form, setForm] = useState(shipment)

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (JSON.stringify(shipment) !== JSON.stringify(form)) {
                event.preventDefault()
                event.returnValue = 'You have unsaved changes. Do you really want to leave?'
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [form, shipment])

    return (
        <div>
            {loading && (
                <div className="loading-overlay">
                    <CSpinner color="primary" variant="grow" />
                </div>
            )}
            <Info data={{ form, setForm, loading, setLoading }} />
        </div>
    )
}

export default ShipNow
