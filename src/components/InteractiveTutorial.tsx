import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/utils/translations';
import { ArrowRight, X, Filter, Hand, Layers } from 'lucide-react';

interface InteractiveTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

// 教學步驟枚舉
enum TutorialStep {
  ADD_BUTTON = 0,
  ITEM_FORM = 1,
  DASHBOARD = 2,
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
      className="absolute z-[1001] pointer-events-none animate-tap-indicator"
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

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ isOpen, onClose }) => {
  const { language } = useApp();
  const t = useTranslation(language);
  const [currentStep, setCurrentStep] = useState<TutorialStep>(TutorialStep.ADD_BUTTON);
  const [formOpened, setFormOpened] = useState<boolean>(false);
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [dashboardTutorialStep, setDashboardTutorialStep] = useState<number>(0);
  const [showNextButton, setShowNextButton] = useState<boolean>(false);
  const [isFirstTouch, setIsFirstTouch] = useState<boolean>(true);
  
  // 防止教學意外完成
  const hasCompletedRef = useRef(false);
  
  // 計算總教學進度百分比
  const calculateProgress = () => {
    const totalSteps = 5; // 總共5個步驟：1個添加按鈕 + 1個表單 + 2個儀表板子步驟 + 1個結束
    let completedSteps = 0;
    
    if (currentStep > TutorialStep.ADD_BUTTON) completedSteps += 1;
    if (currentStep > TutorialStep.ITEM_FORM) completedSteps += 1;
    if (currentStep === TutorialStep.DASHBOARD) completedSteps += dashboardTutorialStep;
    
    return Math.round((completedSteps / totalSteps) * 100);
  };
  
  // 用於標記教學完成
  const completeTutorial = () => {
    // 防止重複調用
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    
    // 清除所有閃爍效果的類
    document.querySelectorAll('.tutorial-flash-effect').forEach(el => {
      el.classList.remove('tutorial-flash-effect');
    });
    
    localStorage.setItem('tutorialCompleted', 'true');
    onClose();
  };
  
  // 處理跳過教學
  const handleSkip = () => {
    completeTutorial();
  };
  
  // 進入下一步教學
  const goToNextStep = () => {
    // 清除當前步驟的閃爍效果
    document.querySelectorAll('.tutorial-flash-effect').forEach(el => {
      el.classList.remove('tutorial-flash-effect');
    });
    
    // 隱藏下一步按鈕，等待新步驟加載後再顯示
    setShowNextButton(false);
    
    if (currentStep === TutorialStep.ADD_BUTTON) {
      setCurrentStep(TutorialStep.ITEM_FORM);
    } else if (currentStep === TutorialStep.ITEM_FORM) {
      setCurrentStep(TutorialStep.DASHBOARD);
      // 儀表板教學開始時，延遲顯示下一步按鈕
      setTimeout(() => setShowNextButton(true), 1000);
    } else if (currentStep === TutorialStep.DASHBOARD) {
      if (dashboardTutorialStep < 1) {
        setDashboardTutorialStep(dashboardTutorialStep + 1);
        // 儀表板子步驟間的延遲
        setTimeout(() => setShowNextButton(true), 500);
      } else {
        completeTutorial();
      }
    }
  };
  
  // 顯示下一步按鈕 (儀表板教學期間)
  useEffect(() => {
    if (currentStep === TutorialStep.DASHBOARD && isOpen) {
      // 延遲顯示下一步按鈕，讓用戶有時間閱讀教學內容
      const timer = setTimeout(() => {
        setShowNextButton(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, dashboardTutorialStep, isOpen]);
  
  // 為元素添加閃爍效果的輔助函數
  const addFlashEffect = (selector, delay = 0) => {
    setTimeout(() => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el) el.classList.add('tutorial-flash-effect');
      });
      // 如果沒有找到元素，嘗試尋找更通用的元素
      if (elements.length === 0) {
        console.log('找不到元素，嘗試尋找更通用的元素: ', selector);
      }
    }, delay);
  };
  
  // 當互動式教學處於開啟狀態時添加全局事件監聽器
  useEffect(() => {
    if (!isOpen) return;
    
    // 添加閃爍效果的CSS
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes tutorialFlash {
        0%, 100% { opacity: 1; box-shadow: 0 0 0 rgba(233, 109, 43, 0); }
        50% { opacity: 0.7; box-shadow: 0 0 15px rgba(233, 109, 43, 0.8); }
      }
      
      @keyframes tooltipFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }
      
      @keyframes tooltipFadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      
      .tutorial-flash-effect {
        animation: tutorialFlash 1.5s infinite ease-in-out !important;
        outline: 3px solid #E96D2B !important;
        outline-offset: 2px !important;
        position: relative !important;
        z-index: 100 !important;
      }
      
      /* 改進工具提示樣式 - 使用 squircle 形狀 */
      .tutorial-tooltip {
        background-color: white !important;
        border-radius: 18px !important;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15) !important;
        padding: 14px !important;
        border: 2px solid #E96D2B !important;
        position: relative !important;
        transition: all 0.3s ease !important;
        overflow: visible !important;
        animation: tooltipFadeIn 0.5s ease-out forwards !important;
        max-width: 95vw !important;
        backdrop-filter: blur(5px) !important;
        background-image: linear-gradient(to bottom right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.95)) !important;
      }
      
      .tutorial-tooltip-float {
        animation: tooltipFloat 3s ease-in-out infinite !important;
      }
      
      .tutorial-tooltip-title {
        color: #E96D2B !important;
        font-weight: 700 !important;
        margin-bottom: 6px !important;
        font-size: 16px !important;
        letter-spacing: -0.02em !important;
      }
      
      .tutorial-tooltip-description {
        color: #4B5563 !important;
        font-size: 14px !important;
        line-height: 1.4 !important;
        font-weight: 400 !important;
        letter-spacing: 0.01em !important;
      }
      
      /* 新的箭頭設計，使用三角形 */
      /* 通用箭頭樣式 */
      .tooltip-arrow {
        position: absolute !important;
        width: 0 !important;
        height: 0 !important;
        pointer-events: none !important;
        filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.1)) !important;
      }
      
      /* 向上箭頭樣式 */
      .tooltip-arrow-up {
        bottom: 100% !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
      }
      
      .tooltip-arrow-up:before {
        content: '' !important;
        position: absolute !important;
        bottom: 0 !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        border-left: 12px solid transparent !important;
        border-right: 12px solid transparent !important;
        border-bottom: 12px solid #E96D2B !important;
      }
      
      .tooltip-arrow-up:after {
        content: '' !important;
        position: absolute !important;
        bottom: -2px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        border-left: 10px solid transparent !important;
        border-right: 10px solid transparent !important;
        border-bottom: 10px solid white !important;
      }
      
      /* 向下箭頭樣式 */
      .tooltip-arrow-down {
        top: 100% !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
      }
      
      .tooltip-arrow-down:before {
        content: '' !important;
        position: absolute !important;
        top: 0 !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        border-left: 12px solid transparent !important;
        border-right: 12px solid transparent !important;
        border-top: 12px solid #E96D2B !important;
      }
      
      .tooltip-arrow-down:after {
        content: '' !important;
        position: absolute !important;
        top: -2px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        border-left: 10px solid transparent !important;
        border-right: 10px solid transparent !important;
        border-top: 10px solid white !important;
      }
      
      /* 向右箭頭樣式 */
      .tooltip-arrow-right {
        left: 100% !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
      }
      
      .tooltip-arrow-right:before {
        content: '' !important;
        position: absolute !important;
        left: 0 !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        border-top: 12px solid transparent !important;
        border-bottom: 12px solid transparent !important;
        border-left: 12px solid #E96D2B !important;
      }
      
      .tooltip-arrow-right:after {
        content: '' !important;
        position: absolute !important;
        left: -2px !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        border-top: 10px solid transparent !important;
        border-bottom: 10px solid transparent !important;
        border-left: 10px solid white !important;
      }
      
      /* 向左箭頭樣式 */
      .tooltip-arrow-left {
        right: 100% !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
      }
      
      .tooltip-arrow-left:before {
        content: '' !important;
        position: absolute !important;
        right: 0 !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        border-top: 12px solid transparent !important;
        border-bottom: 12px solid transparent !important;
        border-right: 12px solid #E96D2B !important;
      }
      
      .tooltip-arrow-left:after {
        content: '' !important;
        position: absolute !important;
        right: -2px !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        border-top: 10px solid transparent !important;
        border-bottom: 10px solid transparent !important;
        border-right: 10px solid white !important;
      }
      
      .add-item-button, .bottom-plus-button, button:has(svg[data-icon="plus"]) {
        position: relative !important; /* 確保添加按鈕可以正確顯示閃爍效果 */
      }
      
      /* 教程2: 隱藏子類別檢測彈出訊息 */
      .subcategory-detection {
        display: none !important;
      }
      
      /* 教程3和4: 隱藏添加項目按鈕 */
      body.hide-add-button .add-item-button,
      body.hide-add-button .bottom-plus-button,
      body.hide-add-button button:has(svg[data-icon="plus"]) {
        opacity: 0 !important;
        pointer-events: none !important;
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    // 監聽添加按鈕的點擊事件
    const handleAddButtonClick = () => {
      // 當點擊添加按鈕時，進入下一步教學
      goToNextStep();
      setFormOpened(true);
      
      // 給一點時間讓表單打開，然後設置formVisible
      setTimeout(() => {
        setFormVisible(true);
      }, 300);
    };
    
    // 找到添加項目按鈕並添加點擊事件監聽器和閃爍效果
    const addItemButton = document.querySelector('.add-item-button, .bottom-plus-button, button:has(svg[data-icon="plus"])');
    if (addItemButton && currentStep === TutorialStep.ADD_BUTTON) {
      addItemButton.addEventListener('click', handleAddButtonClick);
      addItemButton.classList.add('tutorial-flash-effect');
    }
    
    // 如果是表單步驟，為表單元素添加閃爍效果
    if (currentStep === TutorialStep.ITEM_FORM && formOpened) {
      // 延遲一點時間等表單完全打開
      setTimeout(() => {
        // 為項目名稱輸入框添加閃爍效果
        addFlashEffect('input[placeholder="Enter item name"], input#item-name, .item-name-input, input[type="text"]', 0);
        
        // 為保存按鈕添加閃爍效果
        addFlashEffect('.save-button, button:contains("Save"), .primary-action-button, button[type="submit"]', 500);
      }, 500);
    }
    
    // 為儀表板步驟添加閃爍效果
    if (currentStep === TutorialStep.DASHBOARD) {
      // 在教程3和4中隱藏添加按鈕
      document.body.classList.add('hide-add-button');
      
      // 教程3：儀表板視圖
      if (dashboardTutorialStep === 0) {
        // 為儀表板卡片區域添加閃爍效果
        addFlashEffect('.item-card, .card, .items-container', 0);
        
        // 為過濾按鈕添加閃爍效果
        addFlashEffect('.filter-button, button:has(svg[data-icon="filter"]), button:has(svg[data-icon="sliders"])', 500);
      } else if (dashboardTutorialStep === 1) {
        // 為導航欄添加閃爍效果
        addFlashEffect('nav, .bottom-navigation, .nav-bar, footer', 0);
        
        // 為通知圖標添加閃爍效果
        addFlashEffect('.notification-icon, button:has(svg[data-icon="bell"]), .notification-badge', 300);
        
        // 為導航欄中的所有圖標添加閃爍效果
        const navIcons = document.querySelectorAll('nav a, .bottom-navigation a, .nav-bar a, footer a, nav button, .bottom-navigation button, .nav-bar button, footer button');
        navIcons.forEach((icon, index) => {
          setTimeout(() => {
            icon.classList.add('tutorial-flash-effect');
          }, 300 + (index * 100)); // 依次為每個圖標添加閃爍效果，間隔100ms
        });
      }
    }
    
    // 清理事件監聽器和樣式
    return () => {
      if (addItemButton) {
        addItemButton.removeEventListener('click', handleAddButtonClick);
        addItemButton.classList.remove('tutorial-flash-effect');
      }
      
      document.querySelectorAll('.tutorial-flash-effect').forEach(el => {
        el.classList.remove('tutorial-flash-effect');
      });
      
      // 移除CSS類
      document.body.classList.remove('hide-add-button');
      
      // 移除動畫樣式
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [isOpen, currentStep, formOpened, dashboardTutorialStep]);
  
  // 監聽表單關閉事件，但只有當手動點擊保存按鈕時才進入下一步教學
  useEffect(() => {
    // 如果不在第二步或教學未開啟，則不需要監聽
    if (!isOpen || currentStep !== TutorialStep.ITEM_FORM || !formOpened) return;
    
    // 直接綁定保存按鈕的點擊事件
    const handleSaveClick = () => {
      // 延遲一點時間再進入下一步，讓表單有時間關閉
      setTimeout(() => {
        goToNextStep();
      }, 500);
    };
    
    // 延遲一點時間等待表單加載完畢
    const bindSaveButtons = setTimeout(() => {
      // 保存按鈕 - 嘗試多種可能的選擇器
      const saveButtons = [
        ...Array.from(document.querySelectorAll('button')).filter(btn => 
          (btn.textContent || '').toLowerCase().includes('save')
        ),
        document.querySelector('.save-item-button'),
        document.getElementById('save-your-item-button'),
        document.querySelector('[data-save-button]')
      ].filter(Boolean);
      
      // 為所有找到的保存按鈕添加事件監聽器
      saveButtons.forEach(btn => {
        if (btn) {
          btn.addEventListener('click', handleSaveClick);
        }
      });
    }, 800);
    
    // 清理事件監聽器
    return () => {
      clearTimeout(bindSaveButtons);
      
      const saveButtons = [
        ...Array.from(document.querySelectorAll('button')).filter(btn => 
          (btn.textContent || '').toLowerCase().includes('save')
        ),
        document.querySelector('.save-item-button'),
        document.getElementById('save-your-item-button'),
        document.querySelector('[data-save-button]')
      ].filter(Boolean);
      
      saveButtons.forEach(btn => {
        if (btn) {
          btn.removeEventListener('click', handleSaveClick);
        }
      });
    };
  }, [isOpen, currentStep, formOpened]);
  
  // 處理首次點擊的特殊邏輯
  const handleInitialTouch = () => {
    if (isFirstTouch && currentStep === TutorialStep.DASHBOARD) {
      setIsFirstTouch(false);
      // 自動進入下一步，不需要用戶操作
      if (dashboardTutorialStep === 0) {
        setTimeout(() => goToNextStep(), 4000); // 在第一個儀表板步驟後四秒自動進入下一步
      }
    }
  };
  
  // 儀表板教學的點擊事件處理
  useEffect(() => {
    if (!isOpen || currentStep !== TutorialStep.DASHBOARD) return;
    
    // 創建點擊處理函數
    const handleScreenTouch = (e) => {
      // 如果點擊屏幕且當前是教程的最後一步，則完成教程
      if (dashboardTutorialStep === 1) {
        completeTutorial();
      }
      
      // 處理首次點擊邏輯
      handleInitialTouch();
    };
    
    // 添加全局點擊事件
    document.addEventListener('click', handleScreenTouch);
    // 添加觸摸事件以提升移動端體驗
    document.addEventListener('touchstart', handleInitialTouch);
    
    // 自動開始首次點擊邏輯，不需要等待用戶操作
    setTimeout(handleInitialTouch, 500);
    
    return () => {
      document.removeEventListener('click', handleScreenTouch);
      document.removeEventListener('touchstart', handleInitialTouch);
    };
  }, [isOpen, currentStep, dashboardTutorialStep, isFirstTouch]);
  
  // 監聽設備方向變化
  useEffect(() => {
    const handleOrientationChange = () => {
      // 當設備旋轉時，短暫隱藏指引，然後重新顯示，以確保位置正確
      setShowNextButton(false);
      setTimeout(() => {
        if (currentStep === TutorialStep.DASHBOARD) {
          setShowNextButton(true);
        }
      }, 300);
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, [currentStep]);
  
  // 如果用戶在教學期間切換頁面，則完成教學
  useEffect(() => {
    if (!isOpen || currentStep === TutorialStep.ADD_BUTTON) return;
    
    const handlePopState = () => {
      completeTutorial();
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, currentStep]);
  
  // 如果未開啟，不渲染任何內容
  if (!isOpen) return null;
  
  // 計算當前進度
  const progress = calculateProgress();
  
  // 取得當前步驟號碼
  const getCurrentStepNumber = () => {
    if (currentStep === TutorialStep.ADD_BUTTON) return 1;
    if (currentStep === TutorialStep.ITEM_FORM) return 2;
    return 3 + dashboardTutorialStep;
  };
  
  return (
    <>
      {/* 背景圖層 - 使用純色半透明背景 */}
      <div 
        className="fixed inset-0 z-[99] pointer-events-none" 
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          transition: 'all 0.3s ease'
        }}
      />
      
      {/* 第一步：添加按鈕提示 */}
      {currentStep === TutorialStep.ADD_BUTTON && (
        <>
          {/* 提示文字 - 放在按鈕上方 */}
          <div className="fixed bottom-[220px] left-[41%] 1/2 transform -translate-x-1/2 z-[100] tutorial-tooltip tutorial-tooltip-float w-[240px] text-center pointer-events-none">
            <div className="tooltip-arrow tooltip-arrow-down"></div>
            <p className="tutorial-tooltip-title">
              {language === 'en' ? 'Add Your First Item' : '添加您的第一個項目'}
            </p>
            <p className="tutorial-tooltip-description">
              {language === 'en' ? 'Tap the plus button below to get started' : '點擊下方加號按鈕開始使用'}
            </p>
          </div>
        </>
      )}
      
      {/* 第二步：表單元素提示 - 只有在表單打開時才顯示 */}
      {currentStep === TutorialStep.ITEM_FORM && formOpened && (
        <>
          {/* 項目名稱輸入框提示 - 放在輸入框上方 */}
          <div className="fixed top-[530px] left-[48%] transform -translate-x-1/2 z-[1000] pointer-events-none">
            <div className="tutorial-tooltip tutorial-tooltip-float w-[240px]">
              <div className="tooltip-arrow tooltip-arrow-up" style={{ left: "45px", transform: "none" }}></div>
              <p className="tutorial-tooltip-title">
                {language === 'en' ? 'Name Your Item' : '命名您的項目'}
              </p>
              <p className="tutorial-tooltip-description">
                {language === 'en' ? 'Type the name of your item here' : '在此輸入您的物品名稱'}
              </p>
            </div>
          </div>
          
          {/* 保存按鈕提示 - 放在按鈕上方 */}
          <div className="fixed bottom-[405px] left-[48%] transform -translate-x-1/2 z-[1000] pointer-events-none">
            <div className="tutorial-tooltip tutorial-tooltip-float w-[240px]">
              <div className="tooltip-arrow tooltip-arrow-down"></div>
              <p className="tutorial-tooltip-title">
                {language === 'en' ? 'Save Your Item' : '保存您的項目'}
              </p>
              <p className="tutorial-tooltip-description">
                {language === 'en' ? 'Tap here when you\'re done' : '完成後點擊此處保存'}
              </p>
            </div>
          </div>
        </>
      )}
      
      {/* 第三步：儀表板教學 - 簡化為兩個步驟，使用提示文字 */}
      {currentStep === TutorialStep.DASHBOARD && (
        <>
          {/* 子步驟 1：儀表板視圖和過濾功能提示 */}
          {dashboardTutorialStep === 0 && (
            <>
              {/* 卡片提示 - 放在卡片區域上方，箭頭指向頂部 */}
              <div className="fixed top-[350px] left-[45%] transform -translate-x-1/2 z-[1002] pointer-events-none">
                <div className="tutorial-tooltip tutorial-tooltip-float w-[240px]">
                  <div className="tooltip-arrow tooltip-arrow-up"></div>
                  <p className="tutorial-tooltip-title">
                    {language === 'en' ? 'Item Cards' : '項目卡片'}
                  </p>
                  <p className="tutorial-tooltip-description">
                    {language === 'en' 
                      ? 'View all your items here. Tap a card to see details.' 
                      : '在此查看所有物品。點擊卡片查看詳情。'}
                  </p>
                </div>
              </div>
              
              {/* 過濾按鈕提示 - 箭頭指向右側 */}
              <div className="fixed top-[65px] right-[42.5%] z-[1002] pointer-events-none">
                <div className="tutorial-tooltip tutorial-tooltip-float w-[240px]">
                  <div className="tooltip-arrow tooltip-arrow-right"></div>
                  <p className="tutorial-tooltip-title">
                    {language === 'en' ? 'Filter View' : '過濾視圖'}
                  </p>
                  <p className="tutorial-tooltip-description">
                    {language === 'en' 
                      ? 'Tap to customize your dashboard view' 
                      : '點擊自定義您的儀表板視圖'}
                  </p>
                </div>
              </div>
            </>
          )}
          
          {/* 子步驟 2：導航欄和通知按鈕提示 */}
          {dashboardTutorialStep === 1 && (
            <>
              {/* 導航欄提示 - 放在導航欄上方 */}
              <div className="fixed bottom-[125px] left-[42%] z-[1002] pointer-events-none">
                <div className="tutorial-tooltip tutorial-tooltip-float w-[240px]">
                  <div className="tooltip-arrow tooltip-arrow-down" style={{ left: "40px", transform: "none" }}></div>
                  <p className="tutorial-tooltip-title">
                    {language === 'en' ? 'Navigation Tabs' : '導航標籤'}
                  </p>
                  <p className="tutorial-tooltip-description">
                    {language === 'en' 
                      ? 'Switch between different views' 
                      : '在不同視圖之間切換'}
                  </p>
                </div>
              </div>
              
              {/* 排序按鈕提示 - 箭頭指向左側 */}
              <div className="fixed top-[55px] right-[40%] z-[1002] pointer-events-none">
                <div className="tutorial-tooltip tutorial-tooltip-float w-[240px]">
                  <div className="tooltip-arrow tooltip-arrow-left" style={{ top: "50%", transform: "translateY(-50%)" }}></div>
                  <p className="tutorial-tooltip-title">
                    {language === 'en' ? 'Sort Items' : '排序項目'}
                  </p>
                  <p className="tutorial-tooltip-description">
                    {language === 'en' 
                      ? 'Arrange your items by expiry date, name or category' 
                      : '按到期日期、名稱或類別整理您的物品'}
                  </p>
                </div>
              </div>
              
              {/* 完成提示 - 放在中間 */}
              <div className="fixed top-[40%] left-1/2 transform -translate-x-1/2 z-[1002] pointer-events-none text-center">
                <div className="tutorial-tooltip w-[260px]">
                  <p className="tutorial-tooltip-title mb-2 text-center">
                    {language === 'en' ? 'You\'re All Set!' : '您已完成設置！'}
                  </p>
                  <p className="tutorial-tooltip-description mb-2">
                    {language === 'en' 
                      ? 'Explore your app and start tracking your items.' 
                      : '探索您的應用並開始追蹤您的物品。'}
                  </p>
                  <p className="text-[#E96D2B] text-sm font-medium mt-2">
                    {language === 'en' ? 'Tap anywhere to finish tutorial' : '點擊任意位置完成教學'}
                  </p>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

// 確保組件被正確導出為默認導出
export default InteractiveTutorial;
