import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, MapPin, Navigation } from 'lucide-react';

// FIX: Leafler marker icon loading in React environment
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

/** Internal helper to recenter map when address changes */
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

export function MapModal({ isOpen, onClose, address, zoneName, description }) {
  if (!isOpen) return null;

  /** Robust parsing for common coordinate formats */
  const parseCoordinates = (str) => {
    if (!str) return [31.6295, -7.9811]; // Default Coordinates (Agadir area usually)
    
    // Look for decimals separated by comma or space
    const matches = str.match(/(-?\d+\.\d+)/g);
    if (matches && matches.length >= 2) {
      return [parseFloat(matches[0]), parseFloat(matches[1])];
    }
    // Specific check for Degree format 31.6° N, 7.9° W
    const numMatches = str.match(/(\d+\.\d+)/g);
    if (numMatches && numMatches.length >= 2) {
        let lat = parseFloat(numMatches[0]);
        let lng = parseFloat(numMatches[1]);
        if (str.includes('S')) lat *= -1;
        if (str.includes('W')) lng *= -1;
        return [lat, lng];
    }

    return [31.6295, -7.9811];
  };

  const position = parseCoordinates(address);

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[85vh] border border-white/20 animate-in zoom-in-95 duration-300">
        
        {/* Header Section */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-50 rounded-2xl">
              <MapPin className="h-6 w-6 text-primary-800" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{zoneName || "Shelter Location"}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                  <Navigation className="h-3 w-3" /> GPS Coordinates
                </span>
                <span className="text-xs text-slate-500 font-medium">{address}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all duration-200 group active:scale-95"
            aria-label="Close Map"
          >
            <X className="h-6 w-6 text-slate-400 group-hover:text-slate-600" />
          </button>
        </div>
        
        {/* Map Container */}
        <div className="flex-1 relative z-0">
          <MapContainer 
            center={position} 
            zoom={14} 
            scrollWheelZoom={true} 
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup className="custom-popup">
                <div className="p-1">
                  <h4 className="font-bold text-slate-900 mb-1">{zoneName}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{description || "Strategic shelter point for emergency response."}</p>
                </div>
              </Popup>
            </Marker>
            <ChangeView center={position} />
          </MapContainer>

          {/* Floating Action Button (External Maps) */}
          <div className="absolute bottom-6 right-6 z-[400]">
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${position[0]},${position[1]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 bg-white text-slate-800 font-bold text-sm rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 border border-slate-100"
            >
              <img src="https://www.gstatic.com/images/branding/product/2x/maps_96in128dp.png" alt="Google Maps" className="h-4 w-4" />
              Open in Google Maps
            </a>
          </div>
        </div>

        {/* Footer Info */}
        {description && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 hidden sm:block">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Zone Information</h4>
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl font-medium tracking-tight">
              {description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
