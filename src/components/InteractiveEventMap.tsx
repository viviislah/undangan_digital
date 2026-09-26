/// <reference types="@types/google.maps" />

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Layers,
  Maximize2,
  Minimize2,
  RefreshCw,
  Plus,
  Minus,
  Copy,
  Check,
  Compass,
  AlertCircle,
} from 'lucide-react';
import { EventSchedule } from '../types/invitation';

// Dark map styles
const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4b6878' }],
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4b6878' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#334e68' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#023e58' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#283d6a' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6f9ba5' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#023e58' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3C7680' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#304a7d' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#98a5be' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2c6693' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#25567b' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#b0d5ce' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#023e58' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#98a5be' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry.fill',
    stylers: [{ color: '#283d6a' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [{ color: '#3a4762' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e1626' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4e6d70' }],
  },
];

// Clean warm luxury map style for light invitations
const LUXURY_LIGHT_MAP_STYLES: google.maps.MapTypeStyle[] = [
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#e9e9e9' }, { lightness: 17 }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }, { lightness: 20 }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#ffffff' }, { lightness: 17 }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#ffffff' }, { lightness: 29 }, { weight: 0.2 }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }, { lightness: 18 }],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }, { lightness: 16 }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }, { lightness: 21 }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#dedede' }, { lightness: 21 }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ visibility: 'on' }, { color: '#ffffff' }, { lightness: 16 }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ saturation: 36 }, { color: '#333333' }, { lightness: 40 }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#f2f2f2' }, { lightness: 19 }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.fill',
    stylers: [{ color: '#fefefe' }, { lightness: 20 }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#fefefe' }, { lightness: 17 }, { weight: 1.2 }],
  },
];

// Helper to extract coordinates from a link if not specified
export function parseCoordinatesFromUrl(url?: string): { lat: number; lng: number } | null {
  if (!url) return null;
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
    /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,
    /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
    /destination=(-?\d+\.\d+),(-?\d+\.\d+)/,
    /loc:(-?\d+\.\d+)\+(-?\d+\.\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
  }
  return null;
}

interface InteractiveEventMapProps {
  eventItem: EventSchedule;
  isDarkTheme?: boolean;
  isHighContrast?: boolean;
  accentColor?: string;
  themeVisuals?: {
    palette: {
      primary: string;
      cardBg: string;
      cardBorder: string;
      text: string;
    };
    button?: {
      gradient?: string;
      textColor?: string;
      shadow?: string;
    };
  };
  className?: string;
}

let isMapsApiConfigured = false;
function ensureMapsApiConfigured() {
  if (!isMapsApiConfigured) {
    const apiKey =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_API_KEY) ||
      'AIzaSyDF2-tC6gCmzHyOIjEAeYQ7FEMjuR_r1UI';
    setOptions({
      key: apiKey,
      v: 'weekly',
      language: 'id',
      region: 'ID',
    });
    isMapsApiConfigured = true;
  }
}

export const InteractiveEventMap: React.FC<InteractiveEventMapProps> = ({
  eventItem,
  isDarkTheme = false,
  isHighContrast = false,
  accentColor = '#D4AF37',
  themeVisuals,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isSatellite, setIsSatellite] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Compute navigation link to launch Google Maps app/website
  const navigationUrl = React.useMemo(() => {
    if (eventItem.linkGoogleMaps && eventItem.linkGoogleMaps.startsWith('http')) {
      return eventItem.linkGoogleMaps;
    }
    if (coordinates) {
      return `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}&destination_place_id=&travelmode=driving`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${eventItem.namaTempat} ${eventItem.alamat}`
    )}`;
  }, [eventItem.linkGoogleMaps, eventItem.namaTempat, eventItem.alamat, coordinates]);

  // Step 1: Resolve Coordinates (props -> url -> geocoder -> default)
  useEffect(() => {
    let isCancelled = false;

    async function resolveCoords() {
      // 1. Explicit coordinates in eventItem
      if (typeof eventItem.latitude === 'number' && typeof eventItem.longitude === 'number') {
        if (!isCancelled) {
          setCoordinates({ lat: eventItem.latitude, lng: eventItem.longitude });
        }
        return;
      }

      // 2. Parsed from linkGoogleMaps
      const parsed = parseCoordinatesFromUrl(eventItem.linkGoogleMaps);
      if (parsed) {
        if (!isCancelled) {
          setCoordinates(parsed);
        }
        return;
      }

      // 3. Geocode with Google Maps Geocoder
      try {
        ensureMapsApiConfigured();
        const geocodingLib = (await importLibrary('geocoding')) as google.maps.GeocodingLibrary;
        const geocoder = new geocodingLib.Geocoder();
        const searchQuery = `${eventItem.namaTempat}, ${eventItem.alamat}, Indonesia`;

        geocoder.geocode({ address: searchQuery }, (results, status) => {
          if (isCancelled) return;
          if (status === 'OK' && results && results[0]?.geometry?.location) {
            const loc = results[0].geometry.location;
            setCoordinates({ lat: loc.lat(), lng: loc.lng() });
          } else {
            // Fallback: try just address
            geocoder.geocode({ address: eventItem.alamat }, (res2, stat2) => {
              if (isCancelled) return;
              if (stat2 === 'OK' && res2 && res2[0]?.geometry?.location) {
                const loc = res2[0].geometry.location;
                setCoordinates({ lat: loc.lat(), lng: loc.lng() });
              } else {
                // Default center (Jakarta / Indonesia)
                setCoordinates({ lat: -6.2088, lng: 106.8456 });
              }
            });
          }
        });
      } catch {
        if (!isCancelled) {
          setCoordinates({ lat: -6.2088, lng: 106.8456 });
        }
      }
    }

    resolveCoords();
    return () => {
      isCancelled = true;
    };
  }, [eventItem.latitude, eventItem.longitude, eventItem.linkGoogleMaps, eventItem.namaTempat, eventItem.alamat]);

  // Step 2: Initialize or update the Google Map
  useEffect(() => {
    if (!coordinates || !mapContainerRef.current) return;
    const currentCoords = coordinates;

    let isCancelled = false;

    async function initMap() {
      try {
        setIsLoading(true);
        setLoadError(null);

        ensureMapsApiConfigured();
        const mapsLib = (await importLibrary('maps')) as google.maps.MapsLibrary;
        const markerLib = (await importLibrary('marker')) as google.maps.MarkerLibrary;

        if (isCancelled || !mapContainerRef.current) return;

        const mapStyles = isDarkTheme ? DARK_MAP_STYLES : LUXURY_LIGHT_MAP_STYLES;

        // Custom pin SVG icon with gold/accent theme
        const pinSvg = encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 56" width="44" height="56">
            <defs>
              <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.4"/>
              </filter>
            </defs>
            <path d="M22 2C10.95 2 2 10.95 2 22C2 35 22 54 22 54S42 35 42 22C42 10.95 33.05 2 22 2Z" 
                  fill="${accentColor || '#D4AF37'}" 
                  stroke="#FFFFFF" 
                  stroke-width="2.5" 
                  filter="url(#shadow)"/>
            <circle cx="22" cy="22" r="11" fill="#FFFFFF"/>
            <circle cx="22" cy="22" r="7.5" fill="${accentColor || '#D4AF37'}"/>
            <circle cx="22" cy="22" r="3.5" fill="#FFFFFF"/>
          </svg>
        `);

        // If map doesn't exist yet, construct it
        if (!mapInstanceRef.current) {
          const map = new mapsLib.Map(mapContainerRef.current, {
            center: currentCoords,
            zoom: 16,
            mapTypeId: isSatellite ? 'hybrid' : 'roadmap',
            styles: isSatellite ? [] : mapStyles,
            disableDefaultUI: true,
            gestureHandling: 'cooperative',
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });

          mapInstanceRef.current = map;
        } else {
          // Update existing map
          mapInstanceRef.current.setCenter(currentCoords);
          mapInstanceRef.current.setMapTypeId(
            isSatellite ? 'hybrid' : 'roadmap'
          );
          mapInstanceRef.current.setOptions({
            styles: isSatellite ? [] : mapStyles,
          });
        }

        const map = mapInstanceRef.current;

        // Construct InfoWindow
        const infoWindowContent = `
          <div style="font-family: system-ui, -apple-system, sans-serif; padding: 6px; max-width: 240px; color: #1f2937;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #b45309; letter-spacing: 0.05em; margin-bottom: 2px;">
              ${eventItem.namaAcara}
            </div>
            <div style="font-size: 14px; font-weight: 700; color: #111827; line-height: 1.3; margin-bottom: 4px;">
              ${eventItem.namaTempat}
            </div>
            <div style="font-size: 11px; color: #6b7280; line-height: 1.4; margin-bottom: 10px;">
              ${eventItem.alamat}
            </div>
            <a href="${navigationUrl}" target="_blank" rel="noopener noreferrer" 
               style="display: flex; align-items: center; justify-content: center; gap: 6px; background-color: #059669; color: #ffffff; text-decoration: none; padding: 7px 12px; border-radius: 10px; font-size: 11px; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <span>🧭 Buka Navigasi Rute</span>
            </a>
          </div>
        `;

        if (!infoWindowRef.current) {
          infoWindowRef.current = new mapsLib.InfoWindow({
            content: infoWindowContent,
          });
        } else {
          infoWindowRef.current.setContent(infoWindowContent);
        }

        // Add or update Marker
        if (!markerRef.current) {
          const marker = new markerLib.Marker({
            position: currentCoords,
            map: map,
            title: `${eventItem.namaTempat} (${eventItem.namaAcara})`,
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${pinSvg}`,
              scaledSize: new google.maps.Size(44, 56),
              anchor: new google.maps.Point(22, 54),
            },
            animation: google.maps.Animation.DROP,
          });

          marker.addListener('click', () => {
            if (infoWindowRef.current && mapInstanceRef.current) {
              infoWindowRef.current.open({
                anchor: marker,
                map: mapInstanceRef.current,
                shouldFocus: false,
              });
            }
          });

          markerRef.current = marker;
        } else {
          markerRef.current.setPosition(currentCoords);
          markerRef.current.setIcon({
            url: `data:image/svg+xml;charset=UTF-8,${pinSvg}`,
            scaledSize: new google.maps.Size(44, 56),
            anchor: new google.maps.Point(22, 54),
          });
        }

        setIsLoading(false);
      } catch (err: unknown) {
        console.error('Failed to load Google Maps:', err);
        if (!isCancelled) {
          setIsLoading(false);
          setLoadError('Tidak dapat memuat peta interaktif Google Maps');
        }
      }
    }

    initMap();

    return () => {
      isCancelled = true;
    };
  }, [coordinates, isDarkTheme, isSatellite, accentColor, eventItem, navigationUrl]);

  // Handlers for Custom Controls
  const handleZoomIn = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom((mapInstanceRef.current.getZoom() || 16) + 1);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom((mapInstanceRef.current.getZoom() || 16) - 1);
    }
  }, []);

  const handleResetCenter = useCallback(() => {
    if (mapInstanceRef.current && coordinates) {
      mapInstanceRef.current.panTo(coordinates);
      mapInstanceRef.current.setZoom(16);
      if (markerRef.current && infoWindowRef.current) {
        infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
      }
    }
  }, [coordinates]);

  const toggleSatellite = useCallback(() => {
    setIsSatellite((prev) => !prev);
  }, []);

  const handleCopyAddress = useCallback(() => {
    const textToCopy = `${eventItem.namaTempat}, ${eventItem.alamat}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }, [eventItem.namaTempat, eventItem.alamat]);

  // Trigger Google Maps resize when toggling fullscreen
  useEffect(() => {
    if (mapInstanceRef.current && typeof google !== 'undefined' && google.maps) {
      setTimeout(() => {
        if (mapInstanceRef.current) {
          google.maps.event.trigger(mapInstanceRef.current, 'resize');
          if (coordinates) {
            mapInstanceRef.current.setCenter(coordinates);
          }
        }
      }, 250);
    }
  }, [isFullscreen, coordinates]);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border transition-all duration-300 shadow-md ${
        isFullscreen
          ? 'fixed inset-4 z-50 rounded-3xl shadow-2xl flex flex-col'
          : 'w-full h-64 sm:h-72 my-3'
      } ${
        isHighContrast
          ? isDarkTheme
            ? 'border-2 border-white bg-stone-950'
            : 'border-2 border-black bg-white'
          : isDarkTheme
          ? 'border-stone-700 bg-stone-900'
          : 'border-stone-200/90 bg-stone-50'
      } ${className}`}
      style={{
        borderColor: isHighContrast
          ? undefined
          : themeVisuals?.palette?.cardBorder || undefined,
      }}
    >
      {/* Google Maps Container DOM */}
      <div
        ref={mapContainerRef}
        className="w-full h-full relative z-0"
        style={{ minHeight: isFullscreen ? '100%' : '16rem' }}
      />

      {/* Loading Skeleton Indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-stone-100/90 dark:bg-stone-900/90 backdrop-blur-sm transition-opacity">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center animate-spin-slow mb-2">
            <Compass className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-stone-600 dark:text-stone-300">
            Menghubungkan ke Google Maps...
          </p>
          <span className="text-[10px] text-stone-400 dark:text-stone-500">
            {eventItem.namaTempat}
          </span>
        </div>
      )}

      {/* Error Fallback Card */}
      {loadError && !isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 bg-stone-100 dark:bg-stone-900 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-500" />
          <h5 className="text-xs font-bold text-stone-800 dark:text-stone-200">
            {eventItem.namaTempat}
          </h5>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-xs line-clamp-2">
            {eventItem.alamat}
          </p>
          <a
            href={navigationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold shadow hover:bg-amber-700 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Buka Langsung di Google Maps</span>
          </a>
        </div>
      )}

      {/* Top Floating Badge & Interactive Quick Controls */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none">
        {/* Venue Chip */}
        <div className="pointer-events-auto max-w-[65%] bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-xl px-2.5 py-1.5 border border-stone-200/80 dark:border-stone-700/80 shadow-md flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse"
            style={{ backgroundColor: accentColor || '#D4AF37' }}
          />
          <span className="text-[11px] font-bold text-stone-800 dark:text-stone-100 truncate">
            {eventItem.namaTempat}
          </span>
        </div>

        {/* Top-Right Control Buttons: Satellite, Fullscreen, Recenter */}
        <div className="pointer-events-auto flex items-center gap-1 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-1 rounded-xl border border-stone-200/80 dark:border-stone-700/80 shadow-md">
          {/* Map Layer Mode (Road vs Satellite) */}
          <button
            type="button"
            onClick={toggleSatellite}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              isSatellite
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title={isSatellite ? 'Ubah ke Mode Peta Jalan' : 'Ubah ke Citra Satelit'}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Recenter */}
          <button
            type="button"
            onClick={handleResetCenter}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Pusatkan Kembali ke Titik Lokasi"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Modal Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title={isFullscreen ? 'Kecilkan Peta' : 'Perbesar Peta Layar Penuh'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Floating Bottom Action Bar on Pin Click or Hover */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between gap-1.5">
        {/* Navigation Action Button */}
        <a
          href={navigationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all active:scale-95 cursor-pointer text-white"
          style={{
            background:
              themeVisuals?.button?.gradient ||
              'linear-gradient(135deg, #059669 0%, #047857 100%)',
            boxShadow: themeVisuals?.button?.shadow || '0 4px 12px rgba(5, 150, 105, 0.35)',
          }}
          title="Buka Navigasi Rute di Google Maps"
        >
          <Navigation className="w-3.5 h-3.5 animate-pulse" />
          <span className="truncate">Navigasi Rute (Google Maps)</span>
          <ExternalLink className="w-3 h-3 shrink-0 opacity-80" />
        </a>

        {/* Copy Address Button */}
        <button
          type="button"
          onClick={handleCopyAddress}
          className="py-2 px-2.5 rounded-xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/80 dark:border-stone-700/80 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold flex items-center gap-1 shadow-md transition-colors cursor-pointer shrink-0"
          title="Salin Alamat Lengkap Lokasi"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] hidden sm:inline">Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">Salin Alamat</span>
            </>
          )}
        </button>

        {/* Floating Zoom Controls */}
        <div className="flex items-center gap-0.5 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-1 rounded-xl border border-stone-200/80 dark:border-stone-700/80 shadow-md shrink-0">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Perbesar Peta (+)"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Perkecil Peta (-)"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
