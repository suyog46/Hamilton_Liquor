"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Default view before a location is picked — centered on Baltimore, MD.
const DEFAULT_CENTER: [number, number] = [39.343, -76.529];


const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface AddressLocationMapProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (event) => onChange(event.latlng.lat, event.latlng.lng),
  });
  return null;
}


function RecenterOnChange({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([latitude, longitude], Math.max(map.getZoom(), 15));
  }, [latitude, longitude, map]);
  return null;
}

const AddressLocationMap = ({ latitude, longitude, onChange }: AddressLocationMapProps) => {
  const hasPosition = latitude !== null && longitude !== null;
  const center: [number, number] = hasPosition ? [latitude, longitude] : DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={hasPosition ? 15 : 12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onChange={onChange} />
      {hasPosition && (
        <>
          <Marker
            position={[latitude, longitude]}
            icon={markerIcon}
            draggable
            eventHandlers={{
              dragend: (event) => {
                const position = (event.target as L.Marker).getLatLng();
                onChange(position.lat, position.lng);
              },
            }}
          />
          <RecenterOnChange latitude={latitude} longitude={longitude} />
        </>
      )}
    </MapContainer>
  );
};

export default AddressLocationMap;
