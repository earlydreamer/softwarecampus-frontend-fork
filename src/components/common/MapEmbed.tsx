import { ExternalLink, Map as MapIcon } from 'lucide-react';

interface MapEmbedProps {
    address: string;
    height?: string;
}

const MapEmbed = ({ address, height = '400px' }: MapEmbedProps) => {
    // 구글 지도 임베드 (API Key 불필요)
    // 참고: 네이버/카카오 지도의 '동적 임베드(주소 기반)'는 API Key(Client ID)가 필수입니다.
    // 예시 사이트(Wix)처럼 특정 장소의 '고정된 임베드 코드'를 사용하는 방식은 
    // 다양한 기관의 주소를 동적으로 처리해야 하는 현재 구조에서는 사용할 수 없습니다.
    // 따라서 API Key 없이 동적 주소 매핑이 가능한 구글 지도를 기본으로 사용합니다.
    const googleMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
    const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(address)}`;
    const kakaoMapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(address)}`;

    return (
        <div className="w-full flex flex-col gap-3">
            <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                <iframe
                    width="100%"
                    height={height}
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={googleMapUrl}
                    title="Location Map"
                    className="block"
                />
                {/* Overlay for better interaction hint if needed */}
            </div>

            <div className="flex gap-2">
                <a
                    href={naverMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#03C75A] text-white font-bold hover:bg-[#02b351] transition-colors shadow-sm"
                >
                    <MapIcon className="w-4 h-4" />
                    네이버 지도로 보기
                </a>
                <a
                    href={kakaoMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#FAE100] text-[#3C1E1E] font-bold hover:bg-[#eac900] transition-colors shadow-sm"
                >
                    <MapIcon className="w-4 h-4" />
                    카카오맵으로 보기
                </a>
            </div>
            <p className="text-xs text-slate-400 text-center">
                * 구글 지도가 표시됩니다. 더 정확한 위치 정보는 네이버/카카오맵을 이용해주세요.
            </p>
        </div>
    );
};

export default MapEmbed;
