import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/i18n';
import { LessonData } from '@/hooks/useLessonData';
import { StorageImage } from '../storage/StorageImage';
import { LayoutGrid } from 'lucide-react';

interface DiagramsTabProps {
  data: LessonData['diagrams'];
}

function getText(obj: { en: string; ru: string; kg: string }, lang: Language): string {
  return obj[lang] || obj.en || '';
}

export function DiagramsTab({ data }: DiagramsTabProps) {
  const { language } = useLanguage();

  const t = {
    title: language === 'ru' ? 'Диаграммы и схемы' : language === 'kg' ? 'Диаграммалар жана схемалар' : 'Diagrams & Schemes',
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {language === 'ru' ? 'Диаграммы пока не добавлены' : language === 'kg' ? 'Диаграммалар азырынча жок' : 'No diagrams available yet'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutGrid className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
        <Badge variant="secondary">{data.length}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {data.map((diagram, idx) => (
          <Card key={diagram.id || idx} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-2xl">📊</span>
                {getText(diagram.title, language)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image */}
              <StorageImage 
                path={diagram.image} 
                alt={getText(diagram.title, language)}
                className="w-full object-contain"
              />

              {/* Description */}
              {diagram.description && (
                <p className="text-sm text-muted-foreground">
                  {getText(diagram.description, language)}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
