import { useEffect, useRef, useState } from 'react';

interface NaverMapProps {
    address: string;
    height?: string;
}

declare global {
    interface Window {
        naver: {
            maps: typeof naver.maps;
        };
    }
}

declare namespace naver.maps {
    class Map {
        constructor(element: HTMLElement | string, options: MapOptions);
    }

    class LatLng {
        constructor(lat: number, lng: number);
    }

    class Marker {
        constructor(options: MarkerOptions);
    }

    interface MapOptions {
        center: LatLng;
        zoom?: number;
        minZoom?: number;
        zoomControl?: boolean;
        zoomControlOptions?: {
            position: Position;
        };
        mapTypeControl?: boolean;
    }

    interface MarkerOptions {
        position: LatLng;
        map: Map;
    }

    enum Position {
        TOP_RIGHT = 3
    }

    namespace Service {
        function geocode(options: { query: string }, callback: (status: Status, response: GeocodeResponse) => void): void;

        enum Status {
            OK = 200
        }
    }

    interface GeocodeResponse {
        v2: {
            addresses: Array<{
                x: string;
                y: string;
                roadAddress: string;
                jibunAddress: string;
                englishAddress: string;
            }>;
        };
    }
}

const NaverMap = ({ address, height = '400px' }: NaverMapProps) => {
    const mapElement = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const trimmedAddress = address?.trim() || '';
    // Basic validation: non-empty, min length 2, contains alphanumeric or Hangul
    const isValidAddress = trimmedAddress.length >= 2 && /[가-힣a-zA-Z0-9]/.test(trimmedAddress);

    useEffect(() => {
        if (!isValidAddress && address) {
            console.warn(`[NaverMap] Invalid address provided: "${address}"`);
        }
    }, [isValidAddress, address]);

    useEffect(() => {
        // Check if script is already loaded
        if (window.naver && window.naver.maps) {
            setIsLoaded(true);
            return;
        }

        const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;
        if (!clientId) {
            setError('네이버 지도 Client ID가 설정되지 않았습니다.');
            return;
        }

        const script = document.createElement('script');
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}&submodules=geocoder`;
        script.async = true;
        script.onload = () => setIsLoaded(true);
        script.onerror = () => setError('네이버 지도 스크립트를 불러오는데 실패했습니다.');
        document.head.appendChild(script);

        return () => {
            // Cleanup if needed, though usually we keep the script
        };
    }, []);

    useEffect(() => {
        if (!isLoaded || !mapElement.current || !isValidAddress || !window.naver) return;

        const { naver } = window;

        naver.maps.Service.geocode({
            query: trimmedAddress
        }, (status: naver.maps.Service.Status, response: naver.maps.GeocodeResponse) => {
            if (status !== naver.maps.Service.Status.OK) {
                console.error('Geocoding failed');
                // Fallback to a default location or handle error
                return;
            }

            const result = response.v2.addresses[0];
            const center = new naver.maps.LatLng(Number(result.y), Number(result.x));

            const mapOptions: naver.maps.MapOptions = {
                center: center,
                zoom: 15,
                minZoom: 8,
                zoomControl: true,
                zoomControlOptions: {
                    position: naver.maps.Position.TOP_RIGHT
                },
                mapTypeControl: true,
            };

            const map = new naver.maps.Map(mapElement.current!, mapOptions);

            new naver.maps.Marker({
                position: center,
                map: map
            });
        });
    }, [isLoaded, isValidAddress, trimmedAddress]);

    if (!isValidAddress) {
        return (
            <div
                className="bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 text-sm"
                style={{ height }}
            >
                주소 정보가 올바르지 않습니다.
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 text-sm"
                style={{ height }}
            >
                {error}
            </div>
        );
    }

    return (
        <div
            ref={mapElement}
            className="rounded-xl overflow-hidden border border-slate-200 shadow-sm"
            style={{ height, width: '100%' }}
        />
    );
};

export default NaverMap;
