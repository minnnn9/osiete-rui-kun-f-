
import React from 'react';
import { GameState, ModalType } from '../types';

interface MainMenuProps {
  onStateChange: (state: GameState) => void;
  onOpenModal: (type: ModalType) => void;
  onExit?: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStateChange, onOpenModal, onExit }) => {
  const mainImage = "https://i.postimg.cc/1zhG7m76/home.png";

  /**
   * 2560x1441 해상도 기준 초정밀 버튼 좌표
   */
  const buttons = [
    // Column 1 (Left)
    { type: 'state', value: GameState.PLAYING, top: '60.3%', left: '5.42%', width: '15.65%', height: '8.15%' },
    { type: 'state', value: GameState.LOAD, top: '69.4%', left: '5.42%', width: '15.65%', height: '8.15%' },
    { type: 'modal', value: 'help', top: '78.5%', left: '5.42%', width: '15.65%', height: '8.15%' },
    // Column 2 (Right)
    { type: 'modal', value: 'settings', top: '60.3%', left: '22.4%', width: '15.65%', height: '8.15%' },
    { type: 'modal', value: 'achievements', top: '69.4%', left: '22.4%', width: '15.65%', height: '8.15%' },
    { type: 'exit', value: null, top: '78.5%', left: '22.4%', width: '15.65%', height: '8.15%' },
  ];

  const getOverlayPosition = (index: number) => {
    let topValue = 7.5; 
    const leftValue = 7.5 - 4 - 2; 

    if (index === 0 || index === 3) {
      topValue -= 8; 
    } else if (index === 2 || index === 5) {
      topValue += 8; 
    }

    return {
      top: `${topValue}%`,
      left: `${leftValue}%`,
      width: '89%', 
      height: '85%',
    };
  };

  const handleButtonClick = (btn: any) => {
    if (btn.type === 'state') {
      onStateChange(btn.value as GameState);
    } else if (btn.type === 'modal') {
      onOpenModal(btn.value as ModalType);
    } else if (btn.type === 'exit') {
      if (onExit) onExit();
    }
  };

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
          src={mainImage} 
          alt="Main Background" 
          className="block w-full h-full object-contain pointer-events-none"
        />

        {buttons.map((btn, index) => {
          const overlayStyle = getOverlayPosition(index);
          
          return (
            <button
              key={index}
              onClick={() => handleButtonClick(btn)}
              className="absolute rounded-full overflow-hidden focus:outline-none border-none outline-none cursor-pointer group"
              style={{
                top: btn.top,
                left: btn.left,
                width: btn.width,
                height: btn.height,
                backgroundColor: 'transparent'
              }}
            >
              <div 
                className="absolute bg-violet-400/0 group-hover:bg-violet-400/15 transition-all duration-300 rounded-full"
                style={overlayStyle}
              />
              <div 
                className="absolute bg-violet-600/0 group-active:bg-violet-600/30 transition-all duration-75 rounded-full"
                style={overlayStyle}
              />
            </button>
          );
        })}

        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-[1.5px] h-[1.5px] bg-blue-100 rounded-full animate-pulse"
              style={{
                  top: `${40 + Math.random() * 40}%`,
                  left: `${10 + Math.random() * 80}%`,
                  animationDelay: `${i * 0.8}s`,
                  boxShadow: '0 0 4px rgba(255,255,255,0.6)'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
