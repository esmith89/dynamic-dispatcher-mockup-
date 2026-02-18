import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const RouteMap = ({ routes }) => {
  // Center map on the first point of the first route
  const center = routes?.[0]?.path?.[0] || [39.4667, -87.4139]; 

  return (
    <MapContainer 
      center={center} 
      zoom={12} 
      scrollWheelZoom={false} 
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {routes.map((route, routeIdx) => (
        <React.Fragment key={routeIdx}>
          {/* The Route Line */}
          <Polyline 
            positions={route.path} 
            pathOptions={{ color: route.color, weight: 4, opacity: 0.8 }} 
          />
          
          {/* The Stops (Colored Dots) */}
          {route.path.map((pos, idx) => (
            <CircleMarker 
              key={`${routeIdx}-${idx}`} 
              center={pos}
              radius={6} // Size of the dot
              pathOptions={{ 
                fillColor: route.color, 
                color: 'white', // White border around the dot
                weight: 2,
                fillOpacity: 1 
              }}
            >
              <Popup>
                <strong>{route.id}</strong><br/>
                Stop #{idx + 1}
              </Popup>
            </CircleMarker>
          ))}
        </React.Fragment>
      ))}
    </MapContainer>
  );
};

export default RouteMap;
