
import React from 'react';

interface LoadLayerProps {
  onBack: () => void;
  onPlay: () => void;
}

const LoadLayer: React.FC<LoadLayerProps> = ({ onBack, onPlay }) => {
  // 사용자가 요청한 고정 배경 이미지
  const roadImage = "https://i.postimg.cc/rw2WSSyy/road(1).png";

  const backButtonRegion = {
    top: '3.8%',
    left: '3.2%',
    width: '14.5%',
    height: '8%'
  };

  const saveSlots = [
    { top: '21.4%', left: '22.8%', width: '73.2%', height: '15.3%' },
  ];

  return (
    <div className="w-full h-screen bg-[#02020a] flex items-center justify-center overflow-hidden">
      <div 
        className="relative inline-flex flex-col shadow-2xl select-none"
        style={{
          width: 'auto',
          height: 'auto',
          maxWidth: '100vw',
          maxHeight: '100vh',
          aspectRatio: '2560 / 1441'
        }}
      >
        <img 
          src={roadImage} 
          alt="Load Background" 
          className="block w-full h-full object-contain pointer-events-none"
        />

        <button
          onClick={onBack}
          className="absolute overflow-hidden focus:outline-none border-none outline-none cursor-pointer group z-20"
          style={{
            top: backButtonRegion.top,
            left: backButtonRegion.left,
            width: backButtonRegion.width,
            height: backButtonRegion.height,
            backgroundColor: 'transparent',
            borderRadius: '999px'
          }}
          title="메인 메뉴로 돌아가기"
        >
          <div 
            className="absolute top-0 left-0 bg-violet-400/0 group-hover:bg-violet-400/15 transition-all duration-300 rounded-full" 
            style={{ right: '5%', bottom: '5%' }}
          />
          <div 
            className="absolute top-0 left-0 bg-violet-600/0 group-active:bg-violet-600/30 transition-all duration-75 rounded-full" 
            style={{ right: '5%', bottom: '5%' }}
          />
        </button>

        {saveSlots.map((slot, index) => (
          <button
            key={index}
            className="absolute focus:outline-none border-none outline-none cursor-pointer group z-10"
            style={{
              top: slot.top,
              left: slot.left,
              width: slot.width,
              height: slot.height,
              backgroundColor: 'transparent',
              borderRadius: '999px'
            }}
            onClick={onPlay}
          >
            <div 
              className="absolute bg-violet-400/0 group-hover:bg-violet-400/15 transition-all duration-300 rounded-[999px]" 
              style={{ 
                top: '-39%', 
                bottom: '-5%', 
                left: '-26%', 
                right: '-0.5%' 
              }}
            />
            
            <div 
              className="absolute bg-violet-600/0 group-active:bg-violet-600/30 transition-all duration-75 rounded-[999px]" 
              style={{ 
                top: '-39%', 
                bottom: '-5%', 
                left: '-26%', 
                right: '-0.5%' 
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default LoadLayer;
