import { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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

const MapEvents = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) {
            onLocationSelect([e.latlng.lng, e.latlng.lat]);
        },
    });
    return null;
};

const MapPicker = ({ initialLocation = [105.8544, 21.0285], onLocationSelect }) => {
    // Leaflet uses [lat, lng], we store [lng, lat]
    const [markerPos, setMarkerPos] = useState({ lat: initialLocation[1], lng: initialLocation[0] });
    const markerRef = useRef(null);

    // Listen for initialLocation changes from parent
    useEffect(() => {
        if (Math.abs(markerPos.lng - initialLocation[0]) > 0.0001 || Math.abs(markerPos.lat - initialLocation[1]) > 0.0001) {
            setMarkerPos({ lat: initialLocation[1], lng: initialLocation[0] });
        }
    }, [initialLocation]);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const latLng = marker.getLatLng();
                    setMarkerPos(latLng);
                    if (onLocationSelect) {
                        onLocationSelect([latLng.lng, latLng.lat]);
                    }
                }
            },
        }),
        [onLocationSelect]
    );

    const handleMapClick = (lngLat) => {
        const newPos = { lat: lngLat[1], lng: lngLat[0] };
        setMarkerPos(newPos);
        if (onLocationSelect) {
            onLocationSelect(lngLat);
        }
    };

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
            </MapContainer>
            
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                 <div className="bg-red-500 text-white text-[10px] px-3 py-1.5 rounded-full shadow-lg font-bold border border-white/20">
                    📍 {markerPos.lat.toFixed(6)}, {markerPos.lng.toFixed(6)}
                </div>
            </div>

            <div className="absolute bottom-4 left-4 z-[1000] space-y-2">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl border border-white/30 animate-pulse">
                    🚀 THỬ KÉO GHIM MÀU XANH HOẶC NHẤN VÀO BẢN ĐỒ
                </div>
            </div>
        </div>
    );
};

export default MapPicker;
