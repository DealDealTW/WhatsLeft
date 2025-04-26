import { useEffect, useState, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AppProvider, useApp } from "./contexts/AppContext";
import Dashboard from "./pages/Dashboard";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import ShopList from "./pages/ShopList";
import NotFound from "./pages/NotFound";
import FAQ from "./pages/FAQ";
import TopBar from "./components/TopBar";
import BottomNav from "./components/BottomNav";
import InteractiveTutorial from "./components/InteractiveTutorial";
import MockAdBanner from '@/components/MockAdBanner';
import { AuthProvider } from './contexts/AuthContext';
import AuthCallback from './pages/AuthCallback';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { toast } from "@/components/ui/use-toast";
import ResetPasswordPage from './pages/ResetPasswordPage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useTranslation } from "@/utils/translations";
import { Button } from "@/components/ui/button";

const queryClient = new QueryClient();

// 監聽路由變化的組件
const RouteChangeHandler = () => {
  const { 
    setSelectedItem, 
    language, 
    isProfileModalOpen, 
    setIsProfileModalOpen, 
    isFilterModalOpen, 
    setIsFilterModalOpen, 
    isSortModalOpen, 
    setIsSortModalOpen, 
    isItemModalOpen, 
    setIsItemModalOpen, 
    dashboardMultiSelectMode, 
    setDashboardMultiSelectMode, 
    shoplistMultiSelectMode, 
    setShopListMultiSelectMode, 
    showExitPrompt, 
    setShowExitPrompt 
  } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const doubleBackRef = useRef(false);
  const backHandlerRef = useRef<any>(null);

  useEffect(() => {
    setSelectedItem(null);
  }, [location.pathname, setSelectedItem]);

  // 全局返回鍵邏輯
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleBackButton = async () => {
      console.log('[全局返回鍵] 路徑:', location.pathname);
      
      // 檢查是否有打開的模態框
      if (isProfileModalOpen) {
        setIsProfileModalOpen(false);
        return;
      }
      
      if (isFilterModalOpen) {
        setIsFilterModalOpen(false);
        return;
      }
      
      if (isSortModalOpen) {
        setIsSortModalOpen(false);
        return;
      }
      
      if (isItemModalOpen) {
        setIsItemModalOpen(false);
        return;
      }
      
      // 檢查多選模式（不管在哪個頁面）
      if (dashboardMultiSelectMode) {
        // 如果多選模式開啟，則退出多選模式
        setDashboardMultiSelectMode(false);
        return;
      }
      
      if (shoplistMultiSelectMode) {
        // 如果購物清單多選模式開啟，則退出多選模式
        setShopListMultiSelectMode(false);
        return;
      }

      // 如果在任何頁面，但不在首頁，則返回到首頁或前一頁
      if (location.pathname !== '/dashboard') {
        navigate(-1);
      } else {
        // 如果在首頁，則顯示退出提示
        setShowExitPrompt(true);
      }
    };

    const setupBackButton = async () => {
      if (backHandlerRef.current) {
        await backHandlerRef.current.remove();
      }
      
      try {
        backHandlerRef.current = await CapacitorApp.addListener('backButton', handleBackButton);
      } catch (error) {
        console.error('[全局返回鍵] 設置返回鍵監聽器失敗:', error);
      }
    };

    setupBackButton();
    return () => {
      if (backHandlerRef.current) {
        backHandlerRef.current.remove();
      }
    };
  }, [location.pathname, navigate, language, isProfileModalOpen, setIsProfileModalOpen, isFilterModalOpen, setIsFilterModalOpen, isSortModalOpen, setIsSortModalOpen, isItemModalOpen, setIsItemModalOpen, dashboardMultiSelectMode, setDashboardMultiSelectMode, shoplistMultiSelectMode, setShopListMultiSelectMode, showExitPrompt, setShowExitPrompt]);

  return null;
};

const AppRoutesContent = () => {
  const { showTutorial, setShowTutorial, showExitPrompt, setShowExitPrompt, language, isItemModalOpen } = useApp();
  const t = useTranslation(language);
  const location = useLocation();

  // 首次加載時檢查是否需要顯示教學
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('tutorialCompleted');
    if (!tutorialCompleted) {
      setShowTutorial(true);
    }
  }, [setShowTutorial]);

  // 決定是否顯示教學 - 僅在首頁且沒有模態框打開時顯示
  const shouldShowTutorial = showTutorial && location.pathname === '/' && !isItemModalOpen;

  // 退出提示對話框
  const ExitPromptDialog = () => {
    const handleExit = () => {
      setShowExitPrompt(false);
      // 在 Capacitor 平台上，關閉應用
      if (Capacitor.isNativePlatform()) {
        CapacitorApp.exitApp();
      }
    };
    
    return (
      <Dialog open={showExitPrompt} onOpenChange={setShowExitPrompt}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('exitPromptTitle')}</DialogTitle>
            <DialogDescription>
              {t('exitPromptDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExitPrompt(false)}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleExit}>
              {t('logout')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      <main className="flex-1 pb-36">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/shoplist" element={<ShopList />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <BottomNav />
      <RouteWrapper />
      <InteractiveTutorial isOpen={shouldShowTutorial} onClose={() => setShowTutorial(false)} />
      <ExitPromptDialog />
    </div>
  );
};

const AppContent = () => {
  return (
    <BrowserRouter>
      <AppRoutesContent />
    </BrowserRouter>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
            <MockAdBanner />
          </TooltipProvider>
        </AppProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

// 因為 useApp 和 useLocation 必須在 AppProvider 和 Router 內部使用，所以需要單獨封裝
const RouteWrapper = () => {
  return (
    <Routes>
      <Route path="*" element={<RouteChangeHandler />} />
    </Routes>
  );
};

export default App;
