import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/utils/translations';
import { HelpCircle } from 'lucide-react';
import FAQContent from '@/components/FAQContent';

const FAQ: React.FC = () => {
  const { language } = useApp();
  const t = useTranslation(language);
  
  return (
    <div className="w-full max-w-md mx-auto p-3 pb-24">
      <div className="flex items-center justify-center gap-2 mb-4">
        <HelpCircle className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">{t('frequentlyAskedQuestions')}</h1>
      </div>
      
      <FAQContent maxHeight="h-[calc(100vh-120px)]" showHeader={false} />
    </div>
  );
};

export default FAQ; 