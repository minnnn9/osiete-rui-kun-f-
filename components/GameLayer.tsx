
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Choice {
  text: string;
  nextIdx?: number;
}

interface Scene {
  background: string;
  text: string;
  choices?: Choice[];
}

interface GameLayerProps {
  onBack: () => void;
  onSettings: () => void;
  onSave: () => void;
  onComplete?: () => void;
  isTransitioning?: boolean;
  textSpeed?: number;
}

const GameLayer: React.FC<GameLayerProps> = ({ 
  onBack, 
  onSettings, 
  onSave,
  onComplete, 
  isTransitioning = false,
  textSpeed = 70 
}) => {
  const scenes: Scene[] = [
    {
      background: "https://i.postimg.cc/pTvxV6k6/1.png",
      text: "ずっと前から君が好きだった。"
    },
    {
      background: "https://i.postimg.cc/pTvxV6k6/1.png",
      text: "ずっと・・・"
    },
    {
      background: "https://i.postimg.cc/QtDsNySY/2.png",
      text: "だからー"
    },
    {
      background: "https://i.postimg.cc/QtDsNySf/3.png",
      text: "僕と付き合ってくれない？"
    },
    {
      background: "https://i.postimg.cc/65pWGFwp/4.png",
      text: "",
      choices: [
        { text: "Yes" },
        { text: "No" }
      ]
    },
    {
      background: "https://i.postimg.cc/1XYLFCcq/5.png",
      text: "いいですよ。"
    },
    {
      background: "https://i.postimg.cc/1XYLFCcq/5.png",
      text: "よろしくお願いします 瑠衣くん。"
    },
    {
      background: "https://i.postimg.cc/658sKKtG/6.png",
      text: "公美惠・・・"
    }
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasStartedDialogue, setHasStartedDialogue] = useState(false);

  const timerRef = useRef<number | null>(null);

  const killTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    setIsLoaded(false);
    setTypingText("");
  }, [currentIdx]);

  useEffect(() => {
    if (!isLoaded || isTransitioning || !hasStartedDialogue) return;

    killTimer();
    setTypingText("");
    
    const scene = scenes[currentIdx];
    
    if (!scene.text) {
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    const fullText = scene.text;
    let charIdx = 0;

    const interval = window.setInterval(() => {
      if (charIdx < fullText.length) {
        charIdx++;
        setTypingText(fullText.substring(0, charIdx));
      } else {
        killTimer();
        setIsTyping(false);
      }
    }, textSpeed);

    timerRef.current = interval;
    return () => killTimer();
  }, [currentIdx, isLoaded, isTransitioning, textSpeed, hasStartedDialogue]);

  const goNext = useCallback(() => {
    if (!hasStartedDialogue) {
      setHasStartedDialogue(true);
      return;
    }

    const scene = scenes[currentIdx];
    
    if (scene.choices) return;

    if (isTyping) {
      killTimer();
      setTypingText(scene.text);
      setIsTyping(false);
    } else {
      if (currentIdx < scenes.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        if (onComplete) onComplete();
        onBack();
      }
    }
  }, [isTyping, currentIdx, scenes, onBack, onComplete, hasStartedDialogue]);

  const goBackDialogue = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  }, [currentIdx]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        goBackDialogue();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goBackDialogue]);

  const handleScreenClick = (e: React.MouseEvent) => {
    goNext();
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const currentScene = scenes[currentIdx];

  const choiceButtonRegions = [
    { top: '41.5%', left: '38.3%', width: '48.5%', height: '11.5%' }, 
    { top: '55.2%', left: '38.3%', width: '48.5%', height: '11.5%' }  
  ];

  const getChoiceOverlayStyle = (idx: number) => {
    const finalHeight = 80;
    const finalWidth = 140.5; 
    const finalLeft = -28.5;  

    let finalTop = 0;
    if (idx === 0) {
      finalTop = -27;
    } else {
      finalTop = 15;
    }
    
    return {
      width: `${finalWidth}%`,
      height: `${finalHeight}%`,
      left: `${finalLeft}%`,
      top: `${finalTop}%`,
      borderRadius: '0 28px 0 28px' 
    };
  };

  return (
    <div 
      className="w-full h-screen bg-[#02020a] flex items-center justify-center overflow-hidden cursor-pointer"
      onClick={handleScreenClick}
    >
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
          key={currentScene.background + currentIdx}
          src={currentScene.background} 
          alt="Game Scene" 
          onLoad={() => setIsLoaded(true)}
          className="block w-full h-full object-contain pointer-events-none"
        />

        <button
          onClick={(e) => { stopPropagation(e); onBack(); }}
          className="absolute focus:outline-none border-none cursor-pointer group z-20"
          style={{ top: '30.5%', left: '1.8%', width: '15%', height: '7%' }}
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-3xl" />
        </button>

        <button
          onClick={(e) => { stopPropagation(e); onSave(); }}
          className="absolute focus:outline-none border-none cursor-pointer group z-20"
          style={{ top: '39.5%', left: '1.8%', width: '15%', height: '7%' }}
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-3xl" />
        </button>

        <button
          onClick={(e) => { stopPropagation(e); onSettings(); }}
          className="absolute focus:outline-none border-none cursor-pointer group z-20"
          style={{ top: '48.5%', left: '1.8%', width: '15%', height: '7%' }}
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-3xl" />
        </button>

        {currentScene.text && (
          <div 
            className="absolute flex flex-col p-10 overflow-hidden pointer-events-none"
            style={{ top: '69%', left: '21%', width: '75%', height: '24%' }}
          >
            <div 
              className="font-medium leading-[1.6] vn-font whitespace-pre-wrap drop-shadow-sm"
              style={{ 
                color: '#e1f4ff',
                fontSize: '22px' 
              }}
            >
              {typingText}
            </div>
          </div>
        )}

        {currentScene.choices && choiceButtonRegions.map((region, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              stopPropagation(e);
              if (idx === 0) {
                setCurrentIdx(5);
              } else {
                onBack();
              }
            }}
            className="absolute focus:outline-none border-none outline-none cursor-pointer group z-30"
            style={{
              top: region.top,
              left: region.left,
              width: region.width,
              height: region.height,
              backgroundColor: 'transparent',
              borderRadius: '999px'
            }}
          >
            <div 
              className="absolute bg-blue-900/0 group-hover:bg-blue-900/40 transition-all duration-300" 
              style={getChoiceOverlayStyle(idx)}
            />
            <div 
              className="absolute bg-blue-950/0 group-active:bg-blue-950/60 transition-all duration-75" 
              style={getChoiceOverlayStyle(idx)}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameLayer;
