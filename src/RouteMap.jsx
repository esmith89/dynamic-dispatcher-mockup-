import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const RouteMap = ({ routes }) => {
  // Center map on the depot
  const center = [39.4667, -87.4139]; 

  return (
    <MapContainer 
      center={center} 
      zoom={12} 
      scrollWheelZoom={false} 
      style={{ height: "100%", width: "100%" }}
      className="z-0"
      preferCanvas={true} 
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {routes.map((route, routeIdx) => {
        // Combine all stops (Depot + Faint Background Stops + Highlighted Moved Stops)
        const allStopsForRoute = [
          center, // Start the route line at the depot
          ...(route.backgroundStops || []),
          ...(route.movedStops?.map(m => m.coord) || [])
        ];

        return (
          <React.Fragment key={routeIdx}>
            
            {/* The single, faint continuous line running through all stops for the route */}
            <Polyline 
              positions={allStopsForRoute} 
              pathOptions={{ 
                color: route.color, 
                weight: 1.5, 
                opacity: 0.35 // Faint opacity
              }} 
            />

            {/* The Background Stops (Fainter dots not involved in the change) */}
            {route.backgroundStops && route.backgroundStops.map((pos, idx) => (
              <CircleMarker 
                key={`bg-${routeIdx}-${idx}`} 
                center={pos}
                radius={4}
                pathOptions={{ 
                  fillColor: route.color, 
                  color: route.color, 
                  weight: 0, 
                  fillOpacity: 0.6 
                }}
              />
            ))}

            {/* The Moved Stops Themselves (Highlighted Colored Dots) */}
            {route.movedStops && route.movedStops.map((mStop, idx) => (
              <CircleMarker 
                key={`moved-${routeIdx}-${idx}`} 
                center={mStop.coord}
                radius={6} // Larger, prominent size
                pathOptions={{ 
                  fillColor: route.color, 
                  color: 'white', // White border around the dot
                  weight: 2,
                  fillOpacity: 1 
                }}
              >
                <Popup>
                  <strong>{route.id}</strong><br/>
                  Transferred Stop
                </Popup>
              </CircleMarker>
            ))}
            
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
};

export default RouteMap;