import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Scan, X, Camera, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useTranslation, TranslationKey } from '@/utils/translations';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// 為Capacitor Camera定義一個最小接口
// 實際應用中，您需要導入真正的Capacitor Camera插件
interface BarcodeScanResult {
  text: string;
  format: string;
}

// 這個函數將來自真實插件
async function scanBarcode(): Promise<BarcodeScanResult | null> {
  try {
    // 這是一個模擬，實際上應該調用Capacitor Camera插件
    // 例如：const result = await BarcodeScanner.scan();
    
    // 為模擬返回一些結果
    return {
      text: Math.random().toString().substring(2, 10), // 模擬條形碼
      format: 'QR_CODE'
    };
  } catch (error) {
    console.error('Error scanning barcode:', error);
    return null;
  }
}

interface BarcodeScannerProps {
  onScanComplete: (barcodeResult: string | null) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ 
  onScanComplete, 
  isOpen,
  onOpenChange
}) => {
  const { language } = useApp();
  const t = useTranslation(language);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuidance, setShowGuidance] = useState(true);
  
  // 當掃描器打開時自動開始掃描
  useEffect(() => {
    if (isOpen) {
      handleStartScan();
      
      // 檢查是否為首次使用
      const scannerUsed = localStorage.getItem('barcodeScannerUsed');
      setShowGuidance(!scannerUsed);
      
      // 5秒後自動隱藏指引
      const timer = setTimeout(() => {
        setShowGuidance(false);
        localStorage.setItem('barcodeScannerUsed', 'true');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  const handleStartScan = async () => {
    setError(null);
    setIsScanning(true);
    
    try {
      const result = await scanBarcode();
      if (result && result.text) {
        // 先處理掃描結果
        onScanComplete(result.text);
        // 然後關閉掃描器
        onOpenChange(false);
        localStorage.setItem('barcodeScannerUsed', 'true');
      } else {
        setError(t('scanningFailed'));
      }
    } catch (error) {
      console.error('Error in barcode scanning:', error);
      setError(t('barcodeNotAvailable'));
    } finally {
      setIsScanning(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('cameraInput')}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4">
          {error && (
            <div className="text-sm text-red-500 mb-4 p-3 bg-red-50 rounded-md border border-red-100 w-full flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="text-center w-full py-8 relative">
            {/* 相機外框和掃描動畫 */}
            <div className="mx-auto w-64 h-64 border-2 border-orange-400 rounded-lg relative overflow-hidden">
              {/* 掃描線動畫 */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500 animate-[scanline_2s_ease-in-out_infinite]"></div>
              
              {/* 掃描區域標記 */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-orange-500"></div>
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-orange-500"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-orange-500"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-orange-500"></div>
              
              {/* 相機活動指示器 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="h-12 w-12 text-orange-500 opacity-20" />
              </div>
            </div>
            
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-solid border-orange-500 border-r-transparent mb-3 mt-6"></div>
            <p className="text-orange-600 font-medium">{language === 'en' ? 'Camera is active...' : '相機已啟動...'}</p>
            <p className="text-sm text-muted-foreground mt-1">{language === 'en' ? 'Point camera at barcode' : '將相機對準條碼'}</p>
          </div>
          
          {/* 使用指引提示，首次使用時顯示 */}
          {showGuidance && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-sm text-white p-4 rounded-lg max-w-[260px] z-10 animate-in fade-in slide-in-from-bottom-5 duration-300">
              <div className="flex items-start mb-2">
                <Camera className="h-5 w-5 text-orange-400 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-orange-300 mb-1">{language === 'en' ? 'How to scan' : '如何掃描'}</h3>
                  <p className="text-sm opacity-90 mb-2">{language === 'en' ? 'Align the barcode within the frame and hold steady.' : '將條碼對齊框架內並保持穩定。'}</p>
                  <ul className="text-xs opacity-80 space-y-1 list-disc pl-4">
                    <li>{language === 'en' ? 'Ensure good lighting' : '確保良好的光線'}</li>
                    <li>{language === 'en' ? 'Keep camera 4-8 inches away' : '保持相機距離4-8英寸'}</li>
                    <li>{language === 'en' ? 'Avoid reflections' : '避免反光'}</li>
                  </ul>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2 border-orange-500/50 text-orange-300 hover:bg-orange-950/50"
                onClick={() => setShowGuidance(false)}
              >
                {language === 'en' ? 'Got it' : '知道了'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScanner; 