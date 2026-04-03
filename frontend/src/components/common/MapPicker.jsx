import { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// ── Click handler ────────────────────────────────────────────────────────────
const MapEvents = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) {
            onLocationSelect([e.latlng.lng, e.latlng.lat]);
        },
    });
    return null;
};

// ── FlyTo controller — moves map when targetPos changes ──────────────────────
const MapFlyController = ({ targetPos }) => {
    const map = useMap();
    const prevPos = useRef(null);

    useEffect(() => {
        if (!targetPos) return;
        const isSame = prevPos.current &&
            Math.abs(prevPos.current.lat - targetPos.lat) < 0.0001 &&
            Math.abs(prevPos.current.lng - targetPos.lng) < 0.0001;
        if (!isSame) {
            map.flyTo([targetPos.lat, targetPos.lng], 14, { duration: 1 });
            prevPos.current = targetPos;
        }
    }, [targetPos, map]);

    return null;
};

/**
 * MapPicker
 * Props:
 *   - initialLocation = [lng, lat]       — updates from parent move the marker + flyTo
 *   - onLocationSelect([lng, lat])        — fires on click/drag
 *   - onGeocode({ city, district, ward }) — fires after reverse-geocode resolves
 */
const MapPicker = ({ initialLocation = [105.8544, 21.0285], onLocationSelect, onGeocode }) => {
    const [markerPos, setMarkerPos] = useState({ lat: initialLocation[1], lng: initialLocation[0] });
    const [geocodeLabel, setGeocodeLabel] = useState('');
    const [geocoding, setGeocoding] = useState(false);
    // flyTarget drives MapFlyController — separate from markerPos so flyTo only fires on external changes
    const [flyTarget, setFlyTarget] = useState(null);
    const markerRef = useRef(null);
    const geocodeTimer = useRef(null);
    const fromUserInteraction = useRef(false); // prevent echo-loop

    // Sync with parent initialLocation changes (e.g. address dropdown updated coords)
    useEffect(() => {
        const lat = initialLocation[1];
        const lng = initialLocation[0];
        if (
            Math.abs(markerPos.lng - lng) > 0.0001 ||
            Math.abs(markerPos.lat - lat) > 0.0001
        ) {
            if (!fromUserInteraction.current) {
                setMarkerPos({ lat, lng });
                setFlyTarget({ lat, lng });
            }
            fromUserInteraction.current = false;
        }
    }, [initialLocation]);

    // ── Reverse geocode using Nominatim ──────────────────────────────────────
    const reverseGeocode = (lat, lng) => {
        if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
        geocodeTimer.current = setTimeout(async () => {
            setGeocoding(true);
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=vi`,
                    { headers: { 'Accept-Language': 'vi' } }
                );
                const data = await res.json();
                const addr = data.address || {};
                const city = addr.city || addr.town || addr.county || addr.province || addr.state || '';
                const district = addr.suburb || addr.city_district || addr.quarter || addr.county || '';
                const ward = addr.neighbourhood || addr.village || addr.hamlet || addr.road || '';

                setGeocodeLabel([ward, district, city].filter(Boolean).join(', '));
                if (onGeocode) onGeocode({ city, district, ward });
            } catch (err) {
                console.error('Reverse geocode error:', err);
            } finally {
                setGeocoding(false);
            }
        }, 600);
    };

    const handleMapClick = (lngLat) => {
        fromUserInteraction.current = true;
        const newPos = { lat: lngLat[1], lng: lngLat[0] };
        setMarkerPos(newPos);
        if (onLocationSelect) onLocationSelect(lngLat);
        reverseGeocode(lngLat[1], lngLat[0]);
    };

    const eventHandlers = useMemo(() => ({
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                fromUserInteraction.current = true;
                const latLng = marker.getLatLng();
                setMarkerPos(latLng);
                if (onLocationSelect) onLocationSelect([latLng.lng, latLng.lat]);
                reverseGeocode(latLng.lat, latLng.lng);
            }
        },
    }), [onLocationSelect, onGeocode]);

    return (
        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative" style={{ height: '350px', width: '100%', zIndex: 1 }}>
            <MapContainer
                center={[markerPos.lat, markerPos.lng]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker
                    draggable={true}
                    eventHandlers={eventHandlers}
                    position={markerPos}
                    ref={markerRef}
                />
                <MapEvents onLocationSelect={handleMapClick} />
                <MapFlyController targetPos={flyTarget} />
            </MapContainer>

            {/* Coordinates badge */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 items-end">
                <div className="bg-red-500 text-white text-[10px] px-3 py-1.5 rounded-full shadow-lg font-bold border border-white/20">
                    📍 {markerPos.lat.toFixed(6)}, {markerPos.lng.toFixed(6)}
                </div>
                {geocoding ? (
                    <div className="bg-black/70 backdrop-blur text-white text-[10px] px-3 py-1.5 rounded-full shadow flex items-center gap-1.5">
                        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Đang tra cứu địa chỉ...
                    </div>
                ) : geocodeLabel ? (
                    <div className="bg-green-600/90 backdrop-blur text-white text-[10px] px-3 py-1.5 rounded-full shadow max-w-[200px] text-center leading-tight">
                        ✓ {geocodeLabel}
                    </div>
                ) : null}
            </div>

            <div className="absolute bottom-4 left-4 z-[1000]">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl border border-white/30 animate-pulse">
                    🚀 THỬ KÉO GHIM MÀU XANH HOẶC NHẤN VÀO BẢN ĐỒ
                </div>
            </div>
        </div>
    );
};

export default MapPicker;
