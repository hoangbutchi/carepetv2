import { useState, useEffect } from 'react';
import axios from 'axios';

const VietnamAddressSelector = ({ onAddressChange, initialAddress = {} }) => {
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [selectedCity, setSelectedCity] = useState(initialAddress.city || null);
    const [selectedDistrict, setSelectedDistrict] = useState(initialAddress.district || null);
    const [selectedWard, setSelectedWard] = useState(initialAddress.ward || null);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCities();
    }, []);

    useEffect(() => {
        if (selectedCity?.code) {
            fetchDistricts(selectedCity.code);
            // Reset lower levels if they don't belong to this city
            if (selectedDistrict && !districts.some(d => d.code === selectedDistrict.code)) {
                setSelectedDistrict(null);
                setSelectedWard(null);
            }
        } else {
            setDistricts([]);
            setWards([]);
        }
    }, [selectedCity]);

    useEffect(() => {
        if (selectedDistrict?.code) {
            fetchWards(selectedDistrict.code);
            if (selectedWard && !wards.some(w => w.code === selectedWard.code)) {
                setSelectedWard(null);
            }
        } else {
            setWards([]);
        }
    }, [selectedDistrict]);

    const fetchCities = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://provinces.open-api.vn/api/p/');
            setCities(response.data);
        } catch (error) {
            console.error('Error fetching cities:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDistricts = async (cityCode) => {
        try {
            const response = await axios.get(`https://provinces.open-api.vn/api/p/${cityCode}?depth=2`);
            setDistricts(response.data.districts);
        } catch (error) {
            console.error('Error fetching districts:', error);
        }
    };

    const fetchWards = async (districtCode) => {
        try {
            const response = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            setWards(response.data.wards);
        } catch (error) {
            console.error('Error fetching wards:', error);
        }
    };

    const handleCityChange = (e) => {
        const city = cities.find(c => c.code === parseInt(e.target.value));
        const cityData = city ? { name: city.name, code: city.code.toString() } : null;
        setSelectedCity(cityData);
        setSelectedDistrict(null);
        setSelectedWard(null);
        onAddressChange({ city: cityData, district: null, ward: null });
    };

    const handleDistrictChange = (e) => {
        const district = districts.find(d => d.code === parseInt(e.target.value));
        const districtData = district ? { name: district.name, code: district.code.toString() } : null;
        setSelectedDistrict(districtData);
        setSelectedWard(null);
        onAddressChange({ city: selectedCity, district: districtData, ward: null });
    };

    const handleWardChange = (e) => {
        const ward = wards.find(w => w.code === parseInt(e.target.value));
        const wardData = ward ? { name: ward.name, code: ward.code.toString() } : null;
        setSelectedWard(wardData);
        onAddressChange({ city: selectedCity, district: selectedDistrict, ward: wardData });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tỉnh/Thành phố</label>
                <select
                    className="input w-full"
                    onChange={handleCityChange}
                    value={selectedCity?.code || ''}
                >
                    <option value="">-- Chọn Tỉnh/Thành --</option>
                    {cities.map(city => (
                        <option key={city.code} value={city.code}>{city.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Quận/Huyện</label>
                <select
                    className="input w-full"
                    onChange={handleDistrictChange}
                    value={selectedDistrict?.code || ''}
                    disabled={!selectedCity}
                >
                    <option value="">-- Chọn Quận/Huyện --</option>
                    {districts.map(district => (
                        <option key={district.code} value={district.code}>{district.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phường/Xã</label>
                <select
                    className="input w-full"
                    onChange={handleWardChange}
                    value={selectedWard?.code || ''}
                    disabled={!selectedDistrict}
                >
                    <option value="">-- Chọn Phường/Xã --</option>
                    {wards.map(ward => (
                        <option key={ward.code} value={ward.code}>{ward.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default VietnamAddressSelector;
