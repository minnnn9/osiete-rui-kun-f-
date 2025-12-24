
import React, { useState, useCallback, useEffect, useRef } from 'react';
import MainMenu from './components/MainMenu';
import GameLayer from './components/GameLayer';
import LoadLayer from './components/LoadLayer';
import { GameState, ModalType, Achievement } from './types';

interface SaveSlot {
  id: number;
  isUsed: boolean;
  timestamp: string | null;
}

// 프리로딩할 이미지 URL 목록
const PRELOAD_IMAGES = [
  "https://i.postimg.cc/1zhG7m76/home.png", // 메인
  "https://i.postimg.cc/rw2WSSyy/road(1).png", // 로드 화면
  "https://i.postimg.cc/pTvxV6k6/1.png", // 인게임 배경 1
  "https://i.postimg.cc/QtDsNySY/2.png", // 인게임 배경 2
  "https://i.postimg.cc/QtDsNySf/3.png", // 인게임 배경 3
  "https://i.postimg.cc/65pWGFwp/4.png", // 인게임 배경 4
  "https://i.postimg.cc/1XYLFCcq/5.png", // 인게임 배경 5
  "https://i.postimg.cc/658sKKtG/6.png"  // 인게임 배경 6
];

// Sparkle Cursor Component
const SparkleCursor: React.FC = () => {
  useEffect(() => {
    let lastTime = 0;
    const colors = ['#FFB6C1', '#E0B0FF', '#FFFFFF', '#FFD1DC', '#F0E6FF'];
    
    const createSparkle = (x: number, y: number, isBurst = false, angle = 0, distance = 0) => {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      
      const size = isBurst ? (Math.random() * 12 + 8) : (Math.random() * 10 + 6);
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;
      sparkle.style.backgroundColor = color;
      sparkle.style.left = `${x - size / 2}px`;
      sparkle.style.top = `${y - size / 2}px`;
      
      let tx, ty, duration;

      if (isBurst) {
        // Burst effect: move radially outwards
        tx = Math.cos(angle) * distance;
        ty = Math.sin(angle) * distance;
        duration = Math.random() * 0.5 + 0.4; // Shorter for burst
      } else {
        // Normal trail: move slightly sideways and fall down
        tx = (Math.random() - 0.5) * 80;
        ty = Math.random() * 100 + 50;
        duration = Math.random() * 0.8 + 0.7;
      }
      
      sparkle.style.setProperty('--tw-tx', `${tx}px`);
      sparkle.style.setProperty('--tw-ty', `${ty}px`);
      sparkle.style.animationDuration = `${duration}s`;
      
      // Random Shape: 0=Circle, 1=Star, 2=Heart
      const shapeType = Math.floor(Math.random() * 3);
      if (shapeType === 0) {
        sparkle.style.borderRadius = '50%';
      } else if (shapeType === 1) {
        sparkle.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
      } else {
        sparkle.style.clipPath = 'path("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")';
        sparkle.style.transformOrigin = 'center';
        // When using scale with clipPath path, we need to handle the transform carefully
        // Initial transform handled by keyframes
      }

      document.body.appendChild(sparkle);
      
      setTimeout(() => {
        sparkle.remove();
      }, duration * 1000);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTime > 40) {
        createSparkle(e.clientX, e.clientY);
        lastTime = now;
      }
    };

    const handleClick = (e: MouseEvent) => {
      // Create a burst of 12 sparkles in a circle
      const particleCount = 12;
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = 60 + Math.random() * 40;
        createSparkle(e.clientX, e.clientY, true, angle, distance);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return null;
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [fadeOpacity, setFadeOpacity] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [showAchievementToast, setShowAchievementToast] = useState(false);
  
  const [isImagesLoaded, setIsImagesLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [textSpeed, setTextSpeed] = useState(70);

  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([
    { id: 1, isUsed: false, timestamp: null },
    { id: 2, isUsed: false, timestamp: null },
    { id: 3, isUsed: false, timestamp: null },
  ]);

  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let loadedCount = 0;
    const total = PRELOAD_IMAGES.length;

    const preload = async () => {
      const promises = PRELOAD_IMAGES.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            loadedCount++;
            setLoadProgress(Math.floor((loadedCount / total) * 100));
            resolve(src);
          };
          img.onerror = reject;
        });
      });

      try {
        await Promise.all(promises);
        setIsImagesLoaded(true);
      } catch (err) {
        console.error("Image preload failed", err);
        setIsImagesLoaded(true);
      }
    };

    preload();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('unlocked_achievements');
    if (saved) {
      try {
        setUnlockedAchievements(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error("Failed to load achievements", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio("https://github.com/user-attachments/files/24315899/TAKE_10939.BLIND.LOVE.mp3");
      audio.id = "bgm-player";
      audio.loop = true;
      audio.volume = isMuted ? 0 : volume;
      audioRef.current = audio;
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const resetGameFully = useCallback(() => {
    setGameState(GameState.MENU);
    setActiveModal(null);
    setShowAchievementToast(false);
    
    setUnlockedAchievements(new Set());
    localStorage.removeItem('unlocked_achievements');

    setSaveSlots([
      { id: 1, isUsed: false, timestamp: null },
      { id: 2, isUsed: false, timestamp: null },
      { id: 3, isUsed: false, timestamp: null },
    ]);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setShowIntro(true);
  }, []);

  const handleIntroClick = () => {
    if (!isImagesLoaded) return;
    if (audioRef.current) {
      audioRef.current.play().catch((e) => console.log("Audio play failed:", e));
    }
    setShowIntro(false);
  };

  const handleSave = (id: number) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    setSaveSlots(prev => prev.map(slot => 
      slot.id === id ? { ...slot, isUsed: true, timestamp: timeStr } : slot
    ));
  };

  const resetSaveSlots = useCallback(() => {
    setSaveSlots([
      { id: 1, isUsed: false, timestamp: null },
      { id: 2, isUsed: false, timestamp: null },
      { id: 3, isUsed: false, timestamp: null },
    ]);
  }, []);

  const handleGameComplete = useCallback(() => {
    setUnlockedAchievements(prev => {
      const next = new Set(prev);
      if (!next.has('first_love')) {
        next.add('first_love');
        localStorage.setItem('unlocked_achievements', JSON.stringify(Array.from(next)));
        setShowAchievementToast(true);
        setTimeout(() => setShowAchievementToast(false), 4000);
      }
      return next;
    });

    resetSaveSlots();
  }, [resetSaveSlots]);

  const transitionToState = useCallback((nextState: GameState) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setFadeOpacity(1);

    setTimeout(() => {
      setGameState(nextState);
      
      if (nextState === GameState.PLAYING) {
        resetSaveSlots();
      }

      setTimeout(() => {
        setFadeOpacity(0);
        setTimeout(() => setIsTransitioning(false), 700);
      }, 100);
    }, 700);
  }, [isTransitioning, resetSaveSlots]);

  const renderContent = () => {
    switch (gameState) {
      case GameState.MENU:
        return (
          <MainMenu 
            onStateChange={(state) => {
              if (state === GameState.PLAYING) transitionToState(GameState.PLAYING);
              else setGameState(state);
            }} 
            onOpenModal={setActiveModal}
            onExit={resetGameFully}
          />
        );
      case GameState.PLAYING:
        return (
          <GameLayer 
            onBack={() => transitionToState(GameState.MENU)} 
            onSettings={() => setActiveModal('settings')} 
            onSave={() => setActiveModal('save')}
            isTransitioning={isTransitioning}
            onComplete={handleGameComplete}
            textSpeed={textSpeed}
          />
        );
      case GameState.LOAD:
        return <LoadLayer onBack={() => setGameState(GameState.MENU)} onPlay={() => transitionToState(GameState.PLAYING)} />;
      default:
        return <MainMenu onStateChange={setGameState} onOpenModal={setActiveModal} onExit={resetGameFully} />;
    }
  };

  const renderModal = () => {
    if (!activeModal) return null;

    let content = null;
    let jpTitle = "";
    let koTitle = "";

    const bodyTextColor = "#2f5373";
    const accentColor = "#bc7ee4";

    switch (activeModal) {
      case 'help':
        jpTitle = "ヘルプ";
        koTitle = "도움말";
        content = (
          <div className="space-y-6 vn-font" style={{ color: bodyTextColor }}>
            <section>
              <h3 className="text-xl font-bold mb-3 underline decoration-blue-200" style={{ color: '#5b89ad' }}>基本操作 (기본 조작)</h3>
              <ul className="space-y-4 leading-relaxed text-[15px]">
                <li className="flex flex-col">
                  <span className="font-bold">クリック / スペースキー：文章を進めます</span>
                  <span className="opacity-80">클릭 / 스페이스바 : 문장을 진행합니다</span>
                </li>
                <li className="flex flex-col">
                  <span className="font-bold">← ボタン：前の会話を表示します</span>
                  <span className="opacity-80">← 버튼 : 이전 대화를 표시합니다</span>
                </li>
                <li className="flex flex-col">
                  <span className="font-bold">→ ボタン：次の文章へ進みます</span>
                  <span className="opacity-80">→ 버튼 : 다음 대사로 넘어갑니다</span>
                </li>
              </ul>
            </section>
            <div className="mt-6 space-y-1 opacity-60 text-xs italic">
              <p>※ 今後, より多くの機能가 追加される 予定です</p>
              <p>※ 향후 더 많은 기능이 추가될 예정입니다</p>
            </div>
          </div>
        );
        break;
      case 'settings':
        jpTitle = "設定";
        koTitle = "설정";
        content = (
          <div className="space-y-6 vn-font flex flex-col" style={{ color: bodyTextColor }}>
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-lg font-bold">音量調節 (볼륨 조절)</label>
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all shadow-sm active:scale-95 ${
                    isMuted 
                      ? 'bg-[#ffb6c1] text-white' 
                      : 'bg-[#b0e2ff] text-[#2f5373]'
                  }`}
                >
                  {isMuted ? "ミュート중 (음소거 중)" : "ミュート (음소거)"}
                </button>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume} 
                disabled={isMuted}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className={`w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer`}
                style={{ accentColor: accentColor }}
              />
              <div className="flex justify-between text-xs opacity-60">
                <span>Min</span>
                <span>{Math.round(volume * 100)}%</span>
                <span>Max</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-bold mb-2">テキスト速度 (텍스트 속도)</label>
              <input 
                type="range" 
                min="10" 
                max="150" 
                step="1" 
                value={textSpeed} 
                onChange={(e) => setTextSpeed(parseInt(e.target.value))}
                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                style={{ 
                  direction: 'rtl',
                  accentColor: accentColor
                }}
              />
              <div className="flex justify-between text-xs opacity-60">
                <span>遅い (느림)</span>
                <span>{textSpeed}ms</span>
                <span>速い (빠름)</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 mt-2">
              <button 
                onClick={() => {
                  setVolume(0.5);
                  setIsMuted(false);
                  setTextSpeed(70);
                }}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span className="opacity-70">초기화 (Reset)</span>
              </button>
            </div>
          </div>
        );
        break;
      case 'achievements':
        jpTitle = "実績";
        koTitle = "업적";
        const hasAchievement = unlockedAchievements.has('first_love');
        content = (
          <div className="space-y-4 vn-font max-h-[400px] overflow-y-auto pr-2 custom-scrollbar" style={{ color: bodyTextColor }}>
            {!hasAchievement ? (
              <div className="text-center py-12 opacity-50">
                <p className="font-bold">実績リスト (업적 목록)</p>
                <p className="text-sm mt-2 leading-relaxed">아직 획득한 업적이 없습니다.</p>
              </div>
            ) : (
              <div className="flex items-center p-4 bg-white border border-blue-100 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  <span className="text-pink-500">❤</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-pink-500 text-lg">恋の始まり♥</h4>
                  <p className="text-sm opacity-80 whitespace-pre-line">12月24日。もえみえの始まり。<br />12월 24일. 모에미에의 시작.</p>
                </div>
              </div>
            )}
          </div>
        );
        break;
      case 'save':
        jpTitle = "セーブ";
        koTitle = "저장";
        content = (
          <div className="space-y-4 vn-font" style={{ color: bodyTextColor }}>
            {saveSlots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-4 bg-white border border-blue-100 rounded-2xl shadow-sm hover:border-violet-300 transition-colors">
                <div className="flex-1">
                  <h4 className="font-bold text-lg">スロット {slot.id} (슬롯 {slot.id})</h4>
                  {slot.isUsed ? (
                    <p className="text-xs text-violet-400 font-medium">저장 시각: {slot.timestamp}</p>
                  ) : (
                    <p className="text-xs opacity-50 italic">空のスロット (빈 슬롯)</p>
                  )}
                </div>
                <button 
                  onClick={() => handleSave(slot.id)}
                  className={`px-6 py-2 rounded-full font-bold text-sm transition-all active:scale-95 ${
                    slot.isUsed 
                      ? 'bg-green-100 text-green-600 border border-green-200' 
                      : 'bg-[#d9b3f0]/30 hover:bg-[#d9b3f0]/50 text-[#bc7ee4]'
                  }`}
                >
                  {slot.isUsed ? "完了! (완료!)" : "セーブ (저장)"}
                </button>
              </div>
            ))}
            <p className="text-[10px] text-center opacity-40 mt-4">※ 실제 파일로는 저장되지 않으며, 메인 메뉴 복귀 후 다시 시작 시 초기화됩니다.</p>
          </div>
        );
        break;
    }

    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-[2px]" onClick={() => setActiveModal(null)} />
        <div className="relative w-full max-w-md bg-[#e1f4ff] rounded-[32px] shadow-2xl border-4 border-white overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="flex justify-between items-center px-8 py-5 bg-white/50 border-b border-blue-100">
            <h2 className="text-2xl font-bold vn-font tracking-tight flex items-baseline">
              <span style={{ color: '#bc7ee4' }}>{jpTitle}</span>
              <span className="ml-2 text-lg" style={{ color: '#d9b3f0' }}>({koTitle})</span>
            </h2>
            <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-red-400 transition-colors text-3xl font-light">&times;</button>
          </div>
          <div className="px-8 py-6">{content}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen bg-[#f8fbff] text-slate-900 overflow-hidden">
      <SparkleCursor />
      {renderContent()}
      {renderModal()}
      <div className={`fixed inset-0 bg-white z-[9999] transition-opacity duration-700 pointer-events-none`} style={{ opacity: fadeOpacity, pointerEvents: isTransitioning ? 'auto' : 'none' }} />
      
      {showIntro && (
        <div 
          id="intro-overlay"
          onClick={handleIntroClick}
          className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#cbb7f0]/90 p-10 sm:p-20 overflow-y-auto animate-in fade-in duration-700 ${!isImagesLoaded ? 'cursor-wait' : 'cursor-pointer'}`}
        >
          <div className="max-w-2xl w-full text-white cocoa-font text-lg sm:text-xl text-left leading-relaxed select-none space-y-6 animate-in slide-in-from-bottom-4 duration-1000">
            <p>2024년 12월 24일, 마츠가야 중고등통합학교 자캐 커뮤니티에서 성사된 ‘모에미에’ 커플(♥)의 1주년을 축하하고자 제작한 『教えて！瑠衣くん！！』 연애 시뮬레이션 웹사이트를 공개합니다 ! ♡</p>
            
            <p>고백 당시의 상황을 ‘아키스케 키미에’의 시점에서 플레이할 수 있는 스토리입니다.</p>
            
            <p>매우 짧고 간단한 형식으로 진행되며, 모든 버튼과 요소들은 실제로 동작하도록 구현했습니다. 소소한 이스터에그도 숨겨두었어요.</p>
            
            <p>시뮬레이션 웹 게임을 즐기며 모에미에의 1주년을 축하해 주세요 ! ♡</p>

            <div className="pt-8 opacity-80 text-sm sm:text-base space-y-1">
              <p>*웹사이트의 인터랙션 등은 구글 Gemini를 활용하여 구현하였습니다.</p>
              <p>pc 환경에서의 플레이를 권장드립니다.</p>
            </div>
            
            <div className="pt-10 text-center">
              {!isImagesLoaded ? (
                <div className="space-y-2">
                   <p className="text-xl font-bold animate-pulse">이미지 로딩 중... ({loadProgress}%)</p>
                   <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                     <div className="bg-white h-full transition-all duration-300" style={{ width: `${loadProgress}%` }} />
                   </div>
                </div>
              ) : (
                <p className="text-2xl font-bold animate-pulse">[ CLICK TO START ]</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={`achievement-toast fixed bottom-6 right-6 z-[100000] ${showAchievementToast ? 'visible' : ''}`}>
        <div className="bg-white/95 backdrop-blur-md border border-pink-200 px-3 py-2 rounded-xl shadow-xl flex items-center space-x-2.5">
          <div className="w-7 h-7 bg-pink-100 rounded-full flex items-center justify-center text-lg shadow-inner">
            <span className="text-pink-500">❤</span>
          </div>
          <div>
            <p className="text-pink-600 font-bold vn-font text-xs">恋の始まり♥ 업적 달성</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
