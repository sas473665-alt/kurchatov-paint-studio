import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary,
  MapMouseEvent,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Navigation,
  Copy,
  Check,
  MessageSquare,
  ExternalLink,
  Compass,
  LocateFixed,
  RotateCcw,
} from 'lucide-react';
import {
  WORKSHOP_LOCATION,
  getWhatsAppBookingUrl,
} from '../data/paintShopData';

const MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  (process.env.GOOGLE_MAPS_API_KEY as string) ||
  '';

function useAdvancedMarkerRef() {
  const [marker, setMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const refCallback = useCallback(
    (m: google.maps.marker.AdvancedMarkerElement | null) => {
      setMarker(m);
    },
    []
  );
  return [refCallback, marker] as const;
}

interface RouteOverlayProps {
  origin: google.maps.LatLngLiteral | null;
  destination: google.maps.LatLngLiteral;
  onRouteResult: (info: { distanceKm: string; durationMin: string } | null) => void;
  onRouteError: (msg: string | null) => void;
}

const RouteOverlay: React.FC<RouteOverlayProps> = ({
  origin,
  destination,
  onRouteResult,
  onRouteError,
}) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    if (!origin || !routesLib || !map) {
      onRouteResult(null);
      return;
    }

    onRouteError(null);

    const RouteClass = (routesLib as unknown as {
      Route?: {
        computeRoutes?: (req: unknown) => Promise<{ routes?: any[] }>;
      };
    }).Route;

    if (!RouteClass || typeof RouteClass.computeRoutes !== 'function') {
      return;
    }

    const request = {
      origin,
      destination,
      travelMode: 'DRIVING',
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
    };

    RouteClass.computeRoutes(request)
      .then(({ routes }) => {
        if (!routes || routes.length === 0) {
          onRouteError('Маршрут не найден. Выберите точку на дороге.');
          onRouteResult(null);
          return;
        }

        const primaryRoute = routes[0];
        if (typeof primaryRoute.createPolylines === 'function') {
          const newPolylines: google.maps.Polyline[] =
            primaryRoute.createPolylines();
          newPolylines.forEach((polyline) => {
            polyline.setOptions({
              strokeColor: '#FF5A1F',
              strokeOpacity: 0.95,
              strokeWeight: 5,
            });
            polyline.setMap(map);
          });
          polylinesRef.current = newPolylines;
        }

        if (primaryRoute.viewport) {
          map.fitBounds(primaryRoute.viewport);
        }

        const distKm = primaryRoute.distanceMeters
          ? `${(primaryRoute.distanceMeters / 1000).toFixed(1)} км`
          : '—';
        const durMin = primaryRoute.durationMillis
          ? `${Math.max(1, Math.round(primaryRoute.durationMillis / 60000))} мин`
          : '—';

        onRouteResult({ distanceKm: distKm, durationMin: durMin });
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('OVER_QUERY_LIMIT') ||
          msg.includes('QuotaExceededError') ||
          msg.includes('429')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        onRouteError('Не удалось построить маршрут от выбранной точки.');
        onRouteResult(null);
      });

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [origin, destination, routesLib, map, onRouteResult, onRouteError]);

  return null;
};

interface MapCameraControllerProps {
  recenterTrigger: number;
  target: google.maps.LatLngLiteral;
}

const MapCameraController: React.FC<MapCameraControllerProps> = ({
  recenterTrigger,
  target,
}) => {
  const map = useMap();
  useEffect(() => {
    if (map && recenterTrigger > 0) {
      map.panTo(target);
      map.setZoom(16);
    }
  }, [map, recenterTrigger, target]);
  return null;
};

export const KurchatovMapSection: React.FC = () => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState<boolean>(true);
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'hybrid'>('hybrid');
  const [copied, setCopied] = useState<boolean>(false);
  const [recenterCount, setRecenterCount] = useState<number>(0);

  // Interactive routing state
  const [pickOriginMode, setPickOriginMode] = useState<boolean>(false);
  const [userOrigin, setUserOrigin] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [routeSummary, setRouteSummary] = useState<{
    distanceKm: string;
    durationMin: string;
  } | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState<boolean>(false);

  const destination = WORKSHOP_LOCATION.coordinates;

  const handleCopyCoordinates = async () => {
    try {
      await navigator.clipboard.writeText(
        `${WORKSHOP_LOCATION.city}, ${WORKSHOP_LOCATION.streetAddress} (${WORKSHOP_LOCATION.dmsCoordinates})`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleRouteFromGeolocation = () => {
    if (!navigator.geolocation) {
      setRouteError('Геолокация не поддерживается вашим браузером.');
      return;
    }
    setGeoLoading(true);
    setRouteError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        setPickOriginMode(false);
        setUserOrigin({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setGeoLoading(false);
        setRouteError(
          'Доступ к геопозиции отклонен. Нажмите «Выбрать старт на карте» и кликните по карте.'
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleMapClick = (e: MapMouseEvent) => {
    if (!pickOriginMode || !e.detail.latLng) return;
    setUserOrigin(e.detail.latLng);
    setPickOriginMode(false);
  };

  const handleClearRoute = () => {
    setUserOrigin(null);
    setRouteSummary(null);
    setRouteError(null);
    setPickOriginMode(false);
    setRecenterCount((c) => c + 1);
  };

  const googleMapsExternalDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`;

  return (
    <section
      id="directions"
      className="py-16 sm:py-24 border-t border-white/10 bg-[#07090E] relative"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#FF5A1F] font-semibold mb-2">
              <span>Навигация Google Maps</span>
              <span aria-hidden="true">·</span>
              <span>{WORKSHOP_LOCATION.city}, {WORKSHOP_LOCATION.streetAddress}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight text-balance">
              Как проехать к нам в г. Курчатов
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCopyCoordinates}
              className="px-4 py-2.5 rounded-xl bg-[#10141D] hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Координаты скопированы</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#FF5A1F]" />
                  <span className="font-mono-num">
                    {WORKSHOP_LOCATION.dmsCoordinates}
                  </span>
                </>
              )}
            </button>

            <a
              href={googleMapsExternalDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Navigation className="w-4 h-4 text-[#FF5A1F]" />
              <span>Открыть навигатор Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Main Grid: Address Card (4 cols) + Interactive Google Map (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Panel: Exact Location & Route Controls */}
          <div className="lg:col-span-4 bg-[#10141D] border border-white/10 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 block">Точный адрес автосервиса</span>
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {WORKSHOP_LOCATION.city}, {WORKSHOP_LOCATION.streetAddress}
                </div>
                <div className="text-xs text-slate-400">
                  {WORKSHOP_LOCATION.region}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#07090E] border border-white/10 space-y-2">
                <div className="text-xs text-slate-400">Точные GPS-координаты бокса:</div>
                <div className="text-sm sm:text-base font-bold text-[#FF5A1F] font-mono-num">
                  {WORKSHOP_LOCATION.dmsCoordinates}
                </div>
                <div className="text-xs text-slate-400 font-mono-num">
                  Десятичные: {destination.lat.toFixed(5)}, {destination.lng.toFixed(5)}
                </div>
              </div>

              {/* Interactive Route Builder Controls on Google Map */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="text-xs font-semibold text-slate-200">
                  Построить маршрут прямо на карте:
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={handleRouteFromGeolocation}
                    disabled={geoLoading}
                    className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <LocateFixed className="w-4 h-4 text-[#FF5A1F]" />
                    <span>
                      {geoLoading
                        ? 'Определяем геопозицию...'
                        : 'От моей текущей геопозиции'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPickOriginMode((prev) => !prev);
                      setRouteError(null);
                    }}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-semibold border transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                      pickOriginMode
                        ? 'bg-[#FF5A1F]/20 border-[#FF5A1F] text-white'
                        : 'bg-[#07090E] hover:bg-white/5 border-white/10 text-slate-300'
                    }`}
                  >
                    <Compass className="w-4 h-4 text-[#FF5A1F]" />
                    <span>
                      {pickOriginMode
                        ? 'Кликните в любое место на карте →'
                        : 'Указать точку старта на карте'}
                    </span>
                  </button>

                  {userOrigin && (
                    <button
                      type="button"
                      onClick={handleClearRoute}
                      className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Сбросить построенный маршрут</span>
                    </button>
                  )}
                </div>

                {routeSummary && (
                  <div className="p-3.5 rounded-xl bg-[#FF5A1F]/15 border border-[#FF5A1F]/40 flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-medium">Расчетный путь:</span>
                    <span className="font-mono-num text-white font-bold">
                      {routeSummary.distanceKm} · ~{routeSummary.durationMin}
                    </span>
                  </div>
                )}

                {routeError && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
                    {routeError}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom WhatsApp Booking Button */}
            <div className="pt-4 border-t border-white/10 space-y-2.5">
              <a
                href={getWhatsAppBookingUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 rounded-2xl bg-[#FF5A1F] hover:bg-[#FF743D] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_8px_28px_rgba(255,90,31,0.35)] transition-all duration-150 whitespace-nowrap cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Записаться в WhatsApp</span>
              </a>
              <p className="text-[11px] text-slate-400 text-center">
                Покраска автомобилей под ключ от 50 000 ₸ · Предварительная запись
              </p>
            </div>
          </div>

          {/* Right Panel: Live Interactive Google Map (8 cols) */}
          <div className="lg:col-span-8 bg-[#10141D] border border-white/10 rounded-3xl p-3 sm:p-4 flex flex-col justify-between">
            {/* Map Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-3">
              <div className="flex items-center gap-1.5 p-1 bg-[#07090E] rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setMapTypeId('hybrid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    mapTypeId === 'hybrid'
                      ? 'bg-[#FF5A1F] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Спутник + Улицы
                </button>
                <button
                  type="button"
                  onClick={() => setMapTypeId('roadmap')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    mapTypeId === 'roadmap'
                      ? 'bg-[#FF5A1F] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Схема карты
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setRecenterCount((c) => c + 1);
                  setInfoOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 border border-white/10 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>Центрировать на ул. Иртышская</span>
              </button>
            </div>

            {/* Sized Google Map Container (CF2 compliance) */}
            <div className="relative w-full h-[460px] sm:h-[520px] rounded-2xl overflow-hidden border border-white/10 bg-[#07090E]">
              <APIProvider apiKey={MAPS_API_KEY} language="ru" region="KZ">
                <GoogleMap
                  defaultCenter={destination}
                  defaultZoom={16}
                  mapId="DEMO_MAP_ID"
                  mapTypeId={mapTypeId}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  internalUsageAttributionIds={[
                    'gmp_mcp_codeassist_v1_aistudio',
                  ]}
                  onClick={handleMapClick}
                  style={{ width: '100%', height: '100%' }}
                >
                  <MapCameraController
                    recenterTrigger={recenterCount}
                    target={destination}
                  />

                  {/* Destination Marker: г. Курчатов, ул. Иртышская 50°44'33.9"N 78°32'27.2"E */}
                  <AdvancedMarker
                    ref={markerRef}
                    position={destination}
                    onClick={() => setInfoOpen(true)}
                  >
                    <div className="flex flex-col items-center">
                      <div className="px-3 py-1.5 rounded-xl bg-[#FF5A1F] text-white text-xs font-bold shadow-lg border border-white whitespace-nowrap">
                        KURCHATOV PAINT · ул. Иртышская
                      </div>
                      <div className="w-3 h-3 bg-[#FF5A1F] rotate-45 -mt-1.5 border-r border-b border-white" />
                    </div>
                  </AdvancedMarker>

                  {/* Optional User Origin Marker */}
                  {userOrigin && (
                    <AdvancedMarker position={userOrigin}>
                      <div className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-semibold border border-white shadow-md whitespace-nowrap">
                        Точка старта
                      </div>
                    </AdvancedMarker>
                  )}

                  {infoOpen && marker && (
                    <InfoWindow
                      anchor={marker}
                      onCloseClick={() => setInfoOpen(false)}
                    >
                      <div className="p-1 text-slate-900 max-w-[230px] space-y-1">
                        <div className="font-bold text-sm">
                          Kurchatov Paint Studio
                        </div>
                        <div className="text-xs text-slate-700">
                          {WORKSHOP_LOCATION.city}, {WORKSHOP_LOCATION.streetAddress}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {WORKSHOP_LOCATION.dmsCoordinates}
                        </div>
                        <a
                          href={googleMapsExternalDirectionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-1 text-xs font-semibold text-[#FF5A1F] hover:underline"
                        >
                          Маршрут в Google Maps →
                        </a>
                      </div>
                    </InfoWindow>
                  )}

                  <RouteOverlay
                    origin={userOrigin}
                    destination={destination}
                    onRouteResult={setRouteSummary}
                    onRouteError={setRouteError}
                  />
                </GoogleMap>
              </APIProvider>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
