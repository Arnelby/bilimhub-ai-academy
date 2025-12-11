import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/i18n';
import { LessonData } from '@/hooks/useLessonData';
import { StorageImage } from '../storage/StorageImage';
import { AlertTriangle, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

interface CommonMistakesTabProps {
  data: LessonData['common_mistakes'];
}

function getText(obj: { en: string; ru: string; kg: string }, lang: Language): string {
  return obj[lang] || obj.en || '';
}

export function CommonMistakesTab({ data }: CommonMistakesTabProps) {
  const { language } = useLanguage();

  const t = {
    title: language === 'ru' ? 'Типичные ошибки' : language === 'kg' ? 'Типтүү каталар' : 'Common Mistakes',
    mistake: language === 'ru' ? 'Ошибка' : language === 'kg' ? 'Ката' : 'Mistake',
    why: language === 'ru' ? 'Почему это неправильно' : language === 'kg' ? 'Эмне үчүн туура эмес' : 'Why it\'s wrong',
    fix: language === 'ru' ? 'Как исправить' : language === 'kg' ? 'Кантип оңдоо керек' : 'How to fix',
    example: language === 'ru' ? 'Пример' : language === 'kg' ? 'Мисал' : 'Example',
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {language === 'ru' ? 'Информация об ошибках пока не добавлена' : language === 'kg' ? 'Каталар жөнүндө маалымат жок' : 'No common mistakes documented yet'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-warning" />
        <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
        <Badge variant="secondary">{data.length}</Badge>
      </div>

      <div className="space-y-6">
        {data.map((item, idx) => (
          <Card key={item.id || idx}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                {t.mistake} #{idx + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* The Mistake */}
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="font-medium text-destructive flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4" />
                  {t.mistake}:
                </p>
                <p className="text-foreground">{getText(item.mistake, language)}</p>
              </div>

              {/* Why it's wrong */}
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="font-medium text-warning flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4" />
                  {t.why}:
                </p>
                <p className="text-foreground">{getText(item.why, language)}</p>
              </div>

              {/* How to fix */}
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="font-medium text-primary flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  {t.fix}:
                </p>
                <p className="text-foreground">{getText(item.fix, language)}</p>
              </div>

              {/* Example */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium text-muted-foreground mb-2">{t.example}:</p>
                <p className="text-foreground whitespace-pre-wrap">{getText(item.example, language)}</p>
              </div>

              {/* Image */}
              {item.image && (
                <StorageImage 
                  path={item.image} 
                  alt={`${t.mistake} ${idx + 1}`}
                  className="max-w-md"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
