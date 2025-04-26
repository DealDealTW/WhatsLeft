import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, X, Plus, Filter, CheckSquare, Bell, ListChecks, ShoppingCart, BarChart2, Settings2, Calendar, GridIcon, ListIcon, AlignJustify, SlidersHorizontal, Search, Package, AlertTriangle, Clock, Siren, Apple, Home, Check, LayoutGrid, Edit, ChevronLeft, ChevronRight, Hand, Zap, Eye, Mic, Scan, SortDesc, FileEdit, ListFilter } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/utils/translations';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from './ui/card';
import { Switch } from './ui/switch';

// 描述教學步驟的介面
export type TutorialMode = 'unified';

interface TutorialStep {
  title: string; // 標題
  description: string; // 描述
  imagePath: string; // 圖片路徑
  highlights?: Array<{
    top?: number;
    left?: number;
    width?: number;
    height?: number;
    shape: 'rect' | 'circle';
    label?: string;
    iconType?: 'tap' | 'swipe' | 'info';
  }>; // 高亮區域設置
}

// 手指點擊動畫組件
const TapIndicator: React.FC<{
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  size?: string;
  delay?: number;
}> = ({ top, left, right, bottom, size = "50px", delay = 0 }) => {
  return (
    <div 
      className="absolute z-40 pointer-events-none animate-tap-indicator"
      style={{ 
        top, left, right, bottom, 
        width: size, 
        height: size, 
        animationDelay: `${delay}ms` 
      }}
    >
      <Hand className="w-full h-full text-white drop-shadow-lg" strokeWidth={1.5} />
    </div>
  );
};

// 定義統一漸進式教學步驟
const getUnifiedTutorialSteps = (lang: string): TutorialStep[] => {
  const isEnglish = lang === 'en';
  
  return [
    {
      title: isEnglish ? 'Getting Started' : '開始使用',
      description: isEnglish
        ? `<strong>WhatsLeft</strong> helps you track expiry dates of food and household items, reducing waste and saving money.`
        : "<strong>WhatsLeft</strong> 幫助您追蹤食品和家居用品的<strong>到期日</strong>，減少浪費，輕鬆<strong>節省開支</strong>。",
      imagePath: isEnglish ? '/tutorial/en/welcome.svg' : '/tutorial/zh/welcome.svg',
      highlights: [
        {
          top: 40,
          left: 50,
          width: 150,
          height: 150,
          shape: 'circle',
          iconType: 'info'
        }
      ]
    },
    {
      title: isEnglish ? 'Adding Items' : '添加物品',
      description: isEnglish
        ? `<strong>Tap the + button</strong> to add items. You can <strong>type, use voice input, or scan</strong> barcodes for faster entry.`
        : "點擊底部的 <strong>+ 按鈕</strong>新增物品。可通過<strong>手動輸入</strong>、<strong>語音</strong>或<strong>掃描條碼</strong>快速添加！",
      imagePath: isEnglish ? '/tutorial/en/add_item.svg' : '/tutorial/zh/add_item.svg',
      highlights: [
        {
          top: 200,
          left: 150,
          width: 80,
          height: 80,
          shape: 'circle',
          iconType: 'tap'
        }
      ]
    },
    {
      title: isEnglish ? 'Smart Input Methods' : '智能輸入方式',
      description: isEnglish
        ? `<strong>Save time</strong> with Voice Mode and barcode scanning. Add multiple items at once with less effort.`
        : "<strong>節省時間</strong>，使用語音模式和條碼掃描。一次添加多個物品，輕鬆高效。",
      imagePath: isEnglish ? '/tutorial/en/detected_items.svg' : '/tutorial/zh/detected_items.svg',
      highlights: [
        {
          top: 120,
          left: 230,
          width: 60,
          height: 60,
          shape: 'circle',
          iconType: 'tap'
        },
        {
          top: 120,
          left: 290,
          width: 60,
          height: 60,
          shape: 'circle',
          iconType: 'tap'
        }
      ]
    },
    {
      title: isEnglish ? 'Dashboard Overview' : '儀表板概覽',
      description: isEnglish
        ? `View all your items with <strong>color-coded alerts</strong>: Green (fresh), Yellow (expiring soon), Red (expired).`
        : "通過<strong>顏色編碼</strong>快速識別物品狀態：<strong>綠色</strong>（新鮮）、<strong>黃色</strong>（即將到期）、<strong>紅色</strong>（已過期）。",
      imagePath: isEnglish ? '/tutorial/en/dashboard.svg' : '/tutorial/zh/dashboard.svg',
      highlights: [
        {
          top: 100,
          left: 30,
          width: 320,
          height: 180,
          shape: 'rect',
          iconType: 'info'
        }
      ]
    },
    {
      title: isEnglish ? 'Organizing Items' : '整理物品',
      description: isEnglish
        ? `<strong>Filter and sort</strong> your items by expiry date, category, or name to quickly find what you need.`
        : "<strong>篩選和排序</strong>您的物品，按到期日、類別或名稱，迅速找到所需物品。",
      imagePath: isEnglish ? '/tutorial/en/color_alerts.svg' : '/tutorial/zh/color_alerts.svg',
      highlights: [
        {
          top: 50,
          left: 280,
          width: 50,
          height: 50,
          shape: 'circle',
          iconType: 'tap'
        }
      ]
    },
    {
      title: isEnglish ? 'Personalized Settings' : '個性化設置',
      description: isEnglish
        ? `Set your <strong>family size</strong> and preferences to automatically adjust quantities for your household needs.`
        : "設置您的<strong>家庭規模</strong>和偏好，自動調整數量以滿足家庭需求。",
      imagePath: isEnglish ? '/tutorial/en/family_size.svg' : '/tutorial/zh/family_size.svg',
      highlights: [
        {
          top: 150,
          left: 50,
          width: 280,
          height: 60,
          shape: 'rect',
          iconType: 'info'
        }
      ]
    },
    {
      title: isEnglish ? 'Shopping List' : '購物清單',
      description: isEnglish
        ? `<strong>ShopList</strong> organizes your shopping needs. Tap to move purchased items directly to your inventory.`
        : "<strong>購物清單</strong>整理您的購物需求。點擊即可將購買的物品直接移至庫存中追蹤。",
      imagePath: isEnglish ? '/tutorial/en/shoplist_view.svg' : '/tutorial/zh/shoplist_view.svg',
      highlights: [
        {
          top: 150,
          left: 100,
          width: 200,
          height: 80,
          shape: 'rect',
          iconType: 'tap'
        }
      ]
    },
    {
      title: isEnglish ? 'Insights & Analytics' : '洞察與分析',
      description: isEnglish
        ? `Track your <strong>consumption patterns</strong> and reduce waste with the Insights page, showing usage and improvement opportunities.`
        : "通過<strong>洞察頁面</strong>追蹤您的消費模式，了解使用情況和改進機會，有效減少浪費。",
      imagePath: isEnglish ? '/tutorial/en/efficiency_overview.svg' : '/tutorial/zh/efficiency_overview.svg',
      highlights: [
        {
          top: 80,
          left: 40,
          width: 300,
          height: 180,
          shape: 'rect',
          iconType: 'info'
        }
      ]
    },
    {
      title: isEnglish ? 'Ready to Go!' : '準備就緒！',
      description: isEnglish
        ? `You're now ready to use WhatsLeft efficiently! Return to this tutorial anytime from <strong>Settings</strong>.`
        : "您現在已經準備好高效使用WhatsLeft了！隨時可以從<strong>設置</strong>頁面重新查看本教學。",
      imagePath: isEnglish ? '/tutorial/en/ready.svg' : '/tutorial/zh/ready.svg',
      highlights: []
    }
  ];
};

// 獲取教學步驟
export const getTutorialSteps = (lang: string, mode: TutorialMode): TutorialStep[] => {
  // 現在我們只有一種統一的教學模式
  return getUnifiedTutorialSteps(lang);
};

// 高亮元素組件
const HighlightElement: React.FC<{
  highlight: TutorialStep['highlights'][0],
  darkMode: boolean
}> = ({ highlight, darkMode }) => {
  const { top, left, width, height, shape, iconType } = highlight;
  
  const borderColor = darkMode ? 'border-[#FF8A3D]' : 'border-[#E96D2B]';
  const shadowColor = darkMode ? 'rgba(255, 138, 61, 0.6)' : 'rgba(233, 109, 43, 0.6)';
  
  return (
    <div 
      className={`absolute z-30 pointer-events-none animate-pulse-slow ${borderColor} ${
        shape === 'circle' ? 'rounded-full' : 'rounded-lg'
      }`}
      style={{ 
        top: `${top}px`, 
        left: `${left}px`, 
        width: `${width}px`, 
        height: `${height}px`,
        border: '3px solid',
        boxShadow: `0 0 12px ${shadowColor}`,
        animationDuration: '2s' 
      }}
    >
      {iconType === 'tap' && (
        <TapIndicator 
          top="50%" 
          left="50%" 
          size="50px" 
          delay={1000} 
        />
      )}
      {iconType === 'info' && (
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg">
          <Zap className="w-5 h-5 text-[#E96D2B] dark:text-[#FF8A3D]" />
        </div>
      )}
    </div>
  );
};

interface AppTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  mode: TutorialMode;
}

const AppTutorial: React.FC<AppTutorialProps> = ({ isOpen, onClose, mode }) => {
  const { language, darkMode } = useApp();
  const t = useTranslation(language);
  const [currentStep, setCurrentStep] = useState(0);
  const [textSize, setTextSize] = useState<'normal' | 'large'>('normal');
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  useEffect(() => {
    // Reset to first step when opening the tutorial
    if (isOpen) {
      setCurrentStep(0);
      setImageLoaded(false);
    }
  }, [isOpen]);

  const tutorialSteps = getTutorialSteps(language, mode);

  const handleNextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setImageLoaded(false);
    } else {
      handleSkip(); // 最後一步時點擊 Next/Done 關閉
      // 標記教學已完成
      localStorage.setItem('tutorialCompleted', 'true');
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setImageLoaded(false);
    }
  };

  const handleSkip = () => {
    setCurrentStep(0); // 重置步驟以便下次打開
    onClose();
    // 標記教學已完成
    localStorage.setItem('tutorialCompleted', 'true');
  };

  const toggleTextSize = () => {
    setTextSize(prev => prev === 'normal' ? 'large' : 'normal');
  };

  const step = tutorialSteps[currentStep];
  
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`max-w-md max-h-[90vh] flex flex-col overflow-hidden ${darkMode ? 'dark bg-gray-900 text-white' : ''}`}>
        <DialogHeader className="p-4 pb-0">
          <div className="relative flex items-center justify-center">
            <DialogTitle className="text-xl font-semibold text-center">
              {step.title}
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0" 
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-between mt-3 items-center">
            {/* 進度指示器 */}
            <div className="flex space-x-1 overflow-auto py-1 max-w-[70%]">
              {tutorialSteps.map((_, index) => (
                <button
                  key={index}
                  className={`h-1.5 rounded-full transition-all flex-shrink-0 ${
                    currentStep === index 
                      ? darkMode 
                        ? 'w-4 bg-[#FF8A3D]' 
                        : 'w-4 bg-[#E96D2B]'
                      : darkMode
                        ? 'w-1.5 bg-gray-700 hover:bg-[#FF8A3D]/30' 
                        : 'w-1.5 bg-muted hover:bg-[#E96D2B]/30'
                  }`}
                  onClick={() => setCurrentStep(index)}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>
            {/* 文字大小切換 */}
            <div className="flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              <Switch
                checked={textSize === 'large'}
                onCheckedChange={toggleTextSize}
                className="scale-75"
                aria-label="Toggle text size"
              />
            </div>
          </div>
        </DialogHeader>
        
        <DialogDescription className="flex-grow overflow-auto px-6 py-4">
          <div className="flex flex-col items-center">
            <div className="w-full aspect-video overflow-hidden rounded-lg mb-4 bg-muted dark:bg-gray-800 flex items-center justify-center relative">
              {/* 圖片 */}
              <img 
                ref={imageRef}
                src={step.imagePath} 
                alt={step.title}
                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  // 如果圖片加載失敗，顯示一個占位符
                  (e.target as HTMLImageElement).src = `https://placehold.co/600x400/${darkMode ? '333333/FFEECC' : 'FFEECC/333333'}?text=${encodeURIComponent(step.title)}`;
                  setImageLoaded(true);
                }}
              />
              
              {/* 高亮元素 */}
              {imageLoaded && step.highlights?.map((highlight, idx) => (
                <HighlightElement 
                  key={idx} 
                  highlight={highlight} 
                  darkMode={darkMode}
                />
              ))}
            </div>
            <div
              className={`text-center ${
                darkMode ? 'text-gray-300' : 'text-muted-foreground'
              } ${textSize === 'large' ? 'text-base' : 'text-sm'}`}
              dangerouslySetInnerHTML={{ __html: step.description }}
            />
            
            {/* 步驟指示器 - 移動端友好的圓點樣式 */}
            <div className="flex justify-center mt-4 md:hidden space-x-1.5 overflow-x-auto max-w-full py-1">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all flex-shrink-0 ${
                    currentStep === index 
                      ? darkMode 
                        ? 'bg-[#FF8A3D]' 
                        : 'bg-[#E96D2B]' 
                      : darkMode 
                        ? 'bg-gray-700' 
                        : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </DialogDescription>
        
        <DialogFooter className="flex justify-between p-4 border-t dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 0}
            className="text-sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('previous')}
          </Button>
          
          {currentStep < tutorialSteps.length - 1 ? (
            <Button 
              onClick={handleNextStep} 
              className={`text-sm ${
                darkMode 
                  ? 'bg-[#FF8A3D] hover:bg-[#FF8A3D]/90 text-white' 
                  : 'bg-[#E96D2B] hover:bg-[#E96D2B]/90 text-white'
              }`}
            >
              {t('next')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button 
              onClick={handleNextStep}
              className={`text-sm ${
                darkMode 
                  ? 'bg-[#FF8A3D] hover:bg-[#FF8A3D]/90 text-white' 
                  : 'bg-[#E96D2B] hover:bg-[#E96D2B]/90 text-white'
              }`}
            >
              {t('finish')}
              <Check className="h-4 w-4 ml-1" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppTutorial;