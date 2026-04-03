import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

/**
 * VietnamAddressSelector
 * Props:
 *   - onAddressChange({ city, district, ward })  — called when user changes any dropdown
 *   - initialAddress = {}                          — pre-fill on mount
 *   - mapGeocode = null                            — { city, district, ward } from reverse-geocoding the map pin.
 *   - onCoordsFound([lng, lat])                   — called after forward-geocoding chosen address
 */
const VietnamAddressSelector = ({ onAddressChange, initialAddress = {}, mapGeocode = null, onCoordsFound }) => {
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [selectedCity, setSelectedCity] = useState(initialAddress.city || null);
    const [selectedDistrict, setSelectedDistrict] = useState(initialAddress.district || null);
    const [selectedWard, setSelectedWard] = useState(initialAddress.ward || null);

    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false); // visual indicator while auto-selecting from map

    // Track previous mapGeocode to avoid re-running on same value
    const prevMapGeocode = useRef(null);

    // ── Forward geocode: address text → [lng, lat] ───────────────────────────
    const forwardGeocode = async (query) => {
        if (!query || !onCoordsFound) return;
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=vn&format=json&limit=1`,
                { headers: { 'Accept-Language': 'vi' } }
            );
            const data = await res.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                onCoordsFound([parseFloat(lon), parseFloat(lat)]);
            }
        } catch (err) {
            console.error('Forward geocode error:', err);
        }
    };

    useEffect(() => { fetchCities(); }, []);

    // ── Auto-select city/district/ward when mapGeocode changes ──────────────
    useEffect(() => {
        if (!mapGeocode) return;
        if (JSON.stringify(mapGeocode) === JSON.stringify(prevMapGeocode.current)) return;
        prevMapGeocode.current = mapGeocode;

        const autoSelect = async () => {
            setSyncing(true);
            try {
                // 1. Match City
                const citiesRes = await axios.get('https://provinces.open-api.vn/api/p/');
                const allCities = citiesRes.data;

                const normalize = (s) => s?.toLowerCase()
                    .replace(/thành phố |tỉnh |thị xã /gi, '').trim();

                const matchedCity = allCities.find(c =>
                    normalize(c.name) === normalize(mapGeocode.city) ||
                    normalize(c.name).includes(normalize(mapGeocode.city)) ||
                    normalize(mapGeocode.city)?.includes(normalize(c.name))
                );

                if (!matchedCity) { setSyncing(false); return; }

                const cityData = { name: matchedCity.name, code: matchedCity.code.toString() };
                setSelectedCity(cityData);
                setCities(allCities);

                // 2. Fetch + Match District
                const distRes = await axios.get(`https://provinces.open-api.vn/api/p/${matchedCity.code}?depth=2`);
                const allDistricts = distRes.data.districts;
                setDistricts(allDistricts);

                const matchedDistrict = allDistricts.find(d =>
                    normalize(d.name) === normalize(mapGeocode.district) ||
                    normalize(d.name).includes(normalize(mapGeocode.district)) ||
                    normalize(mapGeocode.district)?.includes(normalize(d.name))
                );

                if (!matchedDistrict) {
                    setSelectedDistrict(null);
                    setSelectedWard(null);
                    onAddressChange({ city: cityData, district: null, ward: null });
                    setSyncing(false);
                    return;
                }

                const districtData = { name: matchedDistrict.name, code: matchedDistrict.code.toString() };
                setSelectedDistrict(districtData);

                // 3. Fetch + Match Ward
                const wardRes = await axios.get(`https://provinces.open-api.vn/api/d/${matchedDistrict.code}?depth=2`);
                const allWards = wardRes.data.wards;
                setWards(allWards);

                const matchedWard = allWards.find(w =>
                    normalize(w.name) === normalize(mapGeocode.ward) ||
                    normalize(w.name).includes(normalize(mapGeocode.ward)) ||
                    normalize(mapGeocode.ward)?.includes(normalize(w.name))
                );

                const wardData = matchedWard ? { name: matchedWard.name, code: matchedWard.code.toString() } : null;
                setSelectedWard(wardData);

                onAddressChange({ city: cityData, district: districtData, ward: wardData });
            } catch (err) {
                console.error('Auto-select from map error:', err);
            } finally {
                setSyncing(false);
            }
        };

        autoSelect();
    }, [mapGeocode]);

    // ── Regular fetch helpers ────────────────────────────────────────────────
    useEffect(() => {
        if (selectedCity?.code) {
            fetchDistricts(selectedCity.code);
        } else {
            setDistricts([]);
            setWards([]);
        }
    }, [selectedCity]);

    useEffect(() => {
        if (selectedDistrict?.code) {
            fetchWards(selectedDistrict.code);
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

    // ── Manual dropdown handlers ─────────────────────────────────────────────
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
        // Forward geocode: move map to this district
        if (districtData && selectedCity) {
            forwardGeocode(`${districtData.name}, ${selectedCity.name}, Việt Nam`);
        }
    };

    const handleWardChange = (e) => {
        const ward = wards.find(w => w.code === parseInt(e.target.value));
        const wardData = ward ? { name: ward.name, code: ward.code.toString() } : null;
        setSelectedWard(wardData);
        onAddressChange({ city: selectedCity, district: selectedDistrict, ward: wardData });
        // Forward geocode: move map to this ward (more precise)
        if (wardData && selectedDistrict && selectedCity) {
            forwardGeocode(`${wardData.name}, ${selectedDistrict.name}, ${selectedCity.name}, Việt Nam`);
        }
    };

    return (
        <div className="space-y-3">
            {/* Syncing indicator */}
            {syncing && (
                <div className="flex items-center gap-2 text-xs text-primary-400 bg-primary-500/10 border border-primary-500/20 px-3 py-2 rounded-lg animate-pulse">
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Đang tự động điền địa chỉ từ bản đồ...
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tỉnh/Thành phố</label>
                    <select
                        className="input w-full"
                        onChange={handleCityChange}
                        value={selectedCity?.code || ''}
                        disabled={loading || syncing}
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
                        disabled={!selectedCity || syncing}
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
                        disabled={!selectedDistrict || syncing}
                    >
                        <option value="">-- Chọn Phường/Xã --</option>
                        {wards.map(ward => (
                            <option key={ward.code} value={ward.code}>{ward.name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default VietnamAddressSelector;
