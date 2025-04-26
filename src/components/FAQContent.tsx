import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/utils/translations';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { TranslationKey } from '@/utils/translations';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

interface FAQContentProps {
  maxHeight?: string;
  showHeader?: boolean;
  compact?: boolean;
}

const FAQContent: React.FC<FAQContentProps> = ({ 
  maxHeight = "h-[calc(100vh-120px)]",
  showHeader = true,
  compact = false
}) => {
  const { language } = useApp();
  const t = useTranslation(language);
  
  // Track expanded FAQ categories and items
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({
    0: true, // Default: expand the first category
  });
  
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  // Toggle category expand/collapse state
  const toggleCategory = (index: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Toggle question expand/collapse state
  const toggleItem = (categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // FAQ content - using translation functions for all items
  const faqCategories: FAQCategory[] = [
    {
      title: t('basicUsage' as TranslationKey),
      items: [
        {
          question: t('whatIsPurpose' as TranslationKey),
          answer: t('purposeAnswer' as TranslationKey)
        },
        {
          question: t('howToAddItem' as TranslationKey),
          answer: t('addItemAnswer' as TranslationKey)
        },
        {
          question: t('howToEditItem' as TranslationKey),
          answer: t('editItemAnswer' as TranslationKey)
        },
        {
          question: t('howToDeleteItem' as TranslationKey),
          answer: t('deleteItemAnswer' as TranslationKey)
        },
        {
          question: t('whatIsExpiryColor' as TranslationKey),
          answer: t('expiryColorAnswer' as TranslationKey)
        }
      ]
    },
    {
      title: t('advancedFeatures' as TranslationKey),
      items: [
        {
          question: t('cameraQuestion' as TranslationKey),
          answer: t('cameraAnswer' as TranslationKey)
        },
        {
          question: t('voiceInputQuestion' as TranslationKey),
          answer: t('voiceInputAnswer' as TranslationKey)
        },
        {
          question: t('autoSubcategoryQuestion' as TranslationKey),
          answer: t('autoSubcategoryAnswer' as TranslationKey)
        },
        {
          question: t('familySizeAdjustQuestion' as TranslationKey),
          answer: t('familySizeAdjustAnswer' as TranslationKey)
        },
        {
          question: t('batchSelectionModeQuestion' as TranslationKey),
          answer: t('batchSelectionModeAnswer' as TranslationKey)
        }
      ]
    },
    {
      title: t('dashboardManagement' as TranslationKey),
      items: [
        {
          question: t('dashboardColorsQuestion' as TranslationKey),
          answer: t('dashboardColorsAnswer' as TranslationKey)
        },
        {
          question: t('dashboardNotificationIconQuestion' as TranslationKey),
          answer: t('dashboardNotificationIconAnswer' as TranslationKey)
        },
        {
          question: t('markItemAsUsedQuestion' as TranslationKey),
          answer: t('markItemAsUsedAnswer' as TranslationKey)
        },
        {
          question: t('markItemAsWastedQuestion' as TranslationKey),
          answer: t('markItemAsWastedAnswer' as TranslationKey)
        }
      ]
    },
    {
      title: t('viewsAndFilters' as TranslationKey),
      items: [
        {
          question: t('availableViews' as TranslationKey),
          answer: t('viewsAnswer' as TranslationKey)
        },
        {
          question: t('howToFilter' as TranslationKey),
          answer: t('filterAnswer' as TranslationKey)
        },
        {
          question: t('howToSort' as TranslationKey),
          answer: t('sortAnswer' as TranslationKey)
        },
        {
          question: t('howToGroupItemsBySubcategory' as TranslationKey),
          answer: t('groupItemsBySubcategoryAnswer' as TranslationKey)
        },
        {
          question: t('canSearchForItems' as TranslationKey),
          answer: t('searchForItemsAnswer' as TranslationKey)
        }
      ]
    },
    {
      title: t('insightAndAnalysis' as TranslationKey),
      items: [
        {
          question: t('whatInformationInsightPageShow' as TranslationKey),
          answer: t('insightPageShowAnswer' as TranslationKey)
        },
        {
          question: t('howToViewStatsDifferentPeriods' as TranslationKey),
          answer: t('viewStatsDifferentPeriodsAnswer' as TranslationKey)
        },
        {
          question: t('howIsUsageEfficiencyCalculated' as TranslationKey),
          answer: t('usageEfficiencyCalculatedAnswer' as TranslationKey)
        },
        {
          question: t('howToSeeWastedItems' as TranslationKey),
          answer: t('seeWastedItemsAnswer' as TranslationKey)
        }
      ]
    },
    {
      title: t('shopListFeatures' as TranslationKey),
      items: [
        {
          question: t('howToAddItemsToShoppingList' as TranslationKey),
          answer: t('addItemsToShoppingListAnswer' as TranslationKey)
        },
        {
          question: t('howToManageMultipleShoppingListItems' as TranslationKey),
          answer: t('manageMultipleShoppingListItemsAnswer' as TranslationKey)
        },
        {
          question: t('whatHappensWhenCheckOffItems' as TranslationKey),
          answer: t('checkOffItemsAnswer' as TranslationKey)
        },
        {
          question: t('howDoesFamilySizeSettingAffect' as TranslationKey),
          answer: t('familySizeSettingAffectAnswer' as TranslationKey)
        },
        {
          question: t('howToMoveShoppingListItems' as TranslationKey),
          answer: t('moveShoppingListItemsAnswer' as TranslationKey)
        }
      ]
    },
    {
      title: t('settingsAndPreferences' as TranslationKey),
      items: [
        {
          question: t('changeDateFormatQuestion' as TranslationKey),
          answer: t('changeDateFormatAnswer' as TranslationKey)
        },
        {
          question: t('changeLanguageQuestion' as TranslationKey),
          answer: t('changeLanguageAnswer' as TranslationKey)
        },
        {
          question: t('darkModeQuestion' as TranslationKey),
          answer: t('darkModeAnswer' as TranslationKey)
        }
      ]
    },
    {
      title: t('troubleshooting' as TranslationKey),
      items: [
        {
          question: t('shareItemListQuestion' as TranslationKey),
          answer: t('shareItemListAnswer' as TranslationKey)
        },
        {
          question: t('voiceInputTroubleshootQuestion' as TranslationKey),
          answer: t('voiceInputTroubleshootAnswer' as TranslationKey)
        }
      ]
    }
  ];
  
  return (
    <div className="w-full">
      <ScrollArea className={maxHeight}>
        <div className={`${compact ? 'space-y-1' : 'space-y-2'} pr-3`}>
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="rounded-lg border overflow-hidden bg-card">
              <div
                className={`flex items-center justify-between ${compact ? 'p-2' : 'p-3'} cursor-pointer hover:bg-muted/30`}
                onClick={() => toggleCategory(categoryIndex)}
              >
                <h2 className={`font-semibold text-primary ${compact ? 'text-sm' : ''}`}>{category.title}</h2>
                {expandedCategories[categoryIndex] ? (
                  <ChevronDown className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-muted-foreground`} />
                ) : (
                  <ChevronRight className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-muted-foreground`} />
                )}
              </div>
              
              {expandedCategories[categoryIndex] && (
                <div className={`${compact ? 'px-2 pb-1' : 'px-3 pb-2'} divide-y`}>
                  {category.items.map((item, itemIndex) => {
                    const itemKey = `${categoryIndex}-${itemIndex}`;
                    const isExpanded = expandedItems[itemKey];
                    
                    return (
                      <div key={itemIndex} className={`${compact ? 'py-1' : 'py-2'}`}>
                        <div
                          className="flex items-center justify-between gap-2 cursor-pointer hover:text-primary"
                          onClick={() => toggleItem(categoryIndex, itemIndex)}
                        >
                          <h3 className={`${compact ? 'text-xs' : 'text-sm'} font-medium`}>{item.question}</h3>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 flex-shrink-0" />
                          )}
                        </div>
                        
                        {isExpanded && (
                          <div className={`mt-2 ${compact ? 'pl-3 text-xs' : 'pl-4 text-sm'} text-muted-foreground`}>
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FAQContent;
export type { FAQItem, FAQCategory };