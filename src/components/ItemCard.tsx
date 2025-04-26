import React, { useState, useRef, useCallback } from 'react';
import { Item, useApp, formatDateWithUserPreference } from '@/contexts/AppContext';
import { calculateDaysUntilExpiry } from '@/contexts/AppContext';
import { Apple, Home, Image as ImageIcon, Tag, Clock, Check, Utensils } from 'lucide-react';
import { useTranslation } from '@/utils/translations';
import { format, parseISO } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Define view mode types
export type ViewMode = 'grid' | 'list' | 'compact';

interface ItemCardProps {
  item: Item;
  viewMode?: ViewMode;
  onClick: (item: Item) => void; // Handles selection toggle in multi-select, or opens details otherwise
  onLongPress: (item: Item) => void; // Enters multi-select and selects the item
  isSelected: boolean;
  isMultiSelectMode: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  viewMode = 'grid',
  onClick,
  onLongPress,
  isSelected,
  isMultiSelectMode,
}) => {
  const { language, settings } = useApp();
  const t = useTranslation(language);
  const daysRemaining = calculateDaysUntilExpiry(item.expiryDate);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressTriggered, setIsLongPressTriggered] = useState(false);
  const touchStartPos = useRef<{x: number, y: number} | null>(null);
  const SCROLL_THRESHOLD = 10;

  const getExpiryStatus = () => {
    if (daysRemaining < 0) return 'item-expired';
    if (daysRemaining <= 1) return 'item-expired'; // Consider today/tomorrow expired visually
    if (daysRemaining <= 4) return 'item-warning';
    return 'item-safe';
  };

  const getIconColorClass = () => {
    if (daysRemaining <= 1) return 'text-red-600 dark:text-red-400';
    if (daysRemaining <= 3) return 'text-yellow-600 dark:text-yellow-400'; // Adjusted threshold for warning
    return 'text-green-600 dark:text-green-400';
  };

  const getExpiryColor = () => {
    if (daysRemaining <= 1) return "bg-red-100/80 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400";
    if (daysRemaining <= 3) return "bg-yellow-100/80 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-600 dark:text-yellow-400";
    return "bg-green-100/80 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400";
  };

  const getCategoryIcon = (category?: string) => {
    const colorClass = getIconColorClass();
    if (category === 'Food') {
      return <Utensils className={`h-4 w-4 ${colorClass}`} />;
    } else if (category === 'Household') {
      return <Home className={`h-4 w-4 ${colorClass}`} />;
    }
    // Fallback icon if category is missing or different
    return <Tag className={`h-4 w-4 ${colorClass}`} />;
  };

  const getExpiryText = () => {
    if (viewMode === 'compact') {
      if (daysRemaining < 0) return t('expired');
      if (daysRemaining === 0) return t('today');
      if (daysRemaining === 1) return language === 'en' ? '1 Day' : '1 天';
      return `${daysRemaining} ${t('days')}`;
    } else {
      if (daysRemaining < 0) return t('expired');
      if (daysRemaining === 0) return t('today');
      if (daysRemaining === 1) return t('tomorrow');
      return `${daysRemaining} ${t('days')}`;
    }
  };

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    touchStartPos.current = null;
  }, []);

  const startLongPressTimer = useCallback((x?: number, y?: number) => {
    clearLongPressTimer();
    setIsLongPressTriggered(false);
    
    if (x !== undefined && y !== undefined) {
      touchStartPos.current = { x, y };
    }
    
    longPressTimer.current = setTimeout(() => {
      if (!isMultiSelectMode) {
        onLongPress(item);
        setIsLongPressTriggered(true);
      }
      longPressTimer.current = null;
    }, 800);
  }, [clearLongPressTimer, item, onLongPress, isMultiSelectMode]);

  const handlePointerDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    startLongPressTimer(e.clientX, e.clientY);
  };
  
  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (touchStartPos.current && longPressTimer.current) {
      const deltaX = Math.abs(e.clientX - touchStartPos.current.x);
      const deltaY = Math.abs(e.clientY - touchStartPos.current.y);
      
      if (deltaX > SCROLL_THRESHOLD || deltaY > SCROLL_THRESHOLD) {
        clearLongPressTimer();
      }
    }
  };

  const handlePointerUp = () => {
    clearLongPressTimer();
  };

  const handlePointerLeave = () => {
    clearLongPressTimer();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches && e.touches[0]) {
      startLongPressTimer(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartPos.current && longPressTimer.current && e.touches && e.touches[0]) {
      const deltaX = Math.abs(e.touches[0].clientX - touchStartPos.current.x);
      const deltaY = Math.abs(e.touches[0].clientY - touchStartPos.current.y);
      
      if (deltaX > SCROLL_THRESHOLD || deltaY > SCROLL_THRESHOLD) {
        clearLongPressTimer();
      }
    }
  };

  const handleClickInternal = () => {
    if (!isLongPressTriggered || isMultiSelectMode) {
        onClick(item);
    }
    setIsLongPressTriggered(false);
  };

  const containerClasses = cn(
    "relative", 
    "rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200 cursor-pointer",
    viewMode === 'compact' ? "h-14 flex items-center" : "", 
    viewMode === 'compact' ? getExpiryColor() : "bg-white dark:bg-gray-800", 
    isMultiSelectMode && isSelected ? "border-2 border-primary dark:border-primary" : "border border-orange-200/70 dark:border-orange-900/30",
    "hover:border-orange-300 dark:hover:border-orange-800/50",
    isMultiSelectMode ? "hover:bg-orange-50/30 dark:hover:bg-orange-900/10" : "hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]",
    "active:scale-[0.99]"
  );

  const renderSelectionOverlay = () => {
    if (!isMultiSelectMode) return null;
    return (
        <div className={cn(
            "absolute inset-0 z-10 flex items-center justify-center transition-all duration-200",
            isSelected ? "bg-primary/20 dark:bg-primary/30" : "bg-black/5 dark:bg-black/10"
        )}>
            <div className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                isSelected 
                    ? "bg-primary border-primary text-primary-foreground scale-100"
                    : "bg-background/70 backdrop-blur-sm border-gray-400 dark:border-gray-600 scale-90"
            )}>
                {isSelected && <Check className="h-4 w-4" />}
            </div>
        </div>
    );
  };
  
  const renderContent = () => {
     if (viewMode === 'compact') {
      return (
         // Single row flex container for compact view with full height
         <div className="flex items-center justify-center gap-3 w-full h-full px-3 relative z-0">
            {/* Name takes available space */}
            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">
                    {item.name}
                </h3>
            </div>
            {/* Quantity and Badge at the end */}
            <div className="flex items-center justify-center gap-2 flex-shrink-0 h-full">
                <span className="body-text font-medium leading-normal my-0">×{item.quantity}</span>
                <Badge variant="outline" className={cn(
                    "label-text px-1.5 py-0 text-[10px] min-w-12 text-center flex items-center justify-center h-5 leading-tight", 
                    getExpiryColor()
                )}>
                    {getExpiryText()}
                </Badge>
            </div>
         </div>
      );
     }
     
     if (viewMode === 'grid') {
        return (
            <> {/* Grid Content Wrapper - z-0 to be below overlay */} 
                <div className={cn("px-3 py-2.5 relative z-0", getExpiryColor(), "rounded-t-xl")}> 
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                        <h3 className="body-text font-medium truncate">{item.name}</h3>
                        </div>
                        <div className="flex items-center">
                        <span className="body-text font-medium ml-2">×{item.quantity}</span>
                        </div>
                    </div>
                </div>
                <div className="bg-card px-3 py-2 flex justify-between items-center relative z-0 rounded-b-xl"> 
                    <span className="label-text text-muted-foreground">
                        {formatDateWithUserPreference(item.expiryDate, settings.dateFormat)}
                    </span>
                    <Badge variant="outline" className={cn("label-text px-2 py-0.5", getExpiryColor())}>
                        {getExpiryText()}
                    </Badge>
                </div>
            </>
        );
     }
     
     // List view layout (Default Fallback)
     return (
        <div className="flex items-center p-3 gap-3 bg-card relative z-0 rounded-xl"> 
            <div className={cn("p-2 rounded-lg flex items-center justify-center", getExpiryColor())}>
                {getCategoryIcon(item.category)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">
                    {item.name}
                </h3>
                <div className="flex items-center">
                    <span className="body-text font-medium">×{item.quantity}</span>
                </div>
                </div>
                <div className="flex justify-between items-center mt-1">
                <span className="label-text text-muted-foreground">
                    {formatDateWithUserPreference(item.expiryDate, settings.dateFormat)}
                </span>
                <Badge variant="outline" className={cn("label-text px-2 py-0.5", getExpiryColor())}>
                    {getExpiryText()}
                </Badge>
                </div>
            </div>
        </div>
     );
  };

  return (
    <div
      className={containerClasses}
      onClick={handleClickInternal}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handlePointerUp}
      onTouchCancel={handlePointerLeave}
    >
      {renderSelectionOverlay()} 
      {renderContent()}
    </div>
  );
};

export default ItemCard;
