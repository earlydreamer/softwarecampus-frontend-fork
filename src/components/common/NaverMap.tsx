import { useEffect, useRef, useState } from 'react';

interface NaverMapProps {
    address: string;
    height?: string;
}

declare global {
    interface Window {
        naver: any;
    }
}

const NaverMap = ({ address, height = '400px' }: NaverMapProps) => {
    const mapElement = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        if (!isLoaded || !mapElement.current || !address || !window.naver) return;

        const { naver } = window;

        naver.maps.Service.geocode({
            query: address
        }, (status: any, response: any) => {
            if (status !== naver.maps.Service.Status.OK) {
                console.error('Geocoding failed');
                // Fallback to a default location or handle error
                return;
            }

            const result = response.v2.addresses[0];
            const center = new naver.maps.LatLng(result.y, result.x);

            const mapOptions = {
                center: center,
                zoom: 15,
                minZoom: 8,
                zoomControl: true,
                zoomControlOptions: {
                    position: naver.maps.Position.TOP_RIGHT
                },
                mapTypeControl: true,
            };

            const map = new naver.maps.Map(mapElement.current, mapOptions);

            new naver.maps.Marker({
                position: center,
                map: map
            });
        });
    }, [isLoaded, address]);

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
