import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/i18n';
import { LessonData } from '@/hooks/useLessonData';
import { VideoEmbed } from '../storage/VideoEmbed';
import { Clock, PlayCircle } from 'lucide-react';

interface MiniLessonsTabProps {
  data: LessonData['mini_lessons'];
}

function getText(obj: { en: string; ru: string; kg: string }, lang: Language): string {
  return obj[lang] || obj.en || '';
}

export function MiniLessonsTab({ data }: MiniLessonsTabProps) {
  const { language } = useLanguage();

  const t = {
    title: language === 'ru' ? 'Мини-уроки' : language === 'kg' ? 'Мини-сабактар' : 'Mini Lessons',
    duration: language === 'ru' ? 'Длительность' : language === 'kg' ? 'Узактыгы' : 'Duration',
    summary: language === 'ru' ? 'Краткое описание' : language === 'kg' ? 'Кыскача' : 'Summary',
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {language === 'ru' ? 'Мини-уроки пока не добавлены' : language === 'kg' ? 'Мини-сабактар азырынча жок' : 'No mini lessons available yet'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <PlayCircle className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
        <Badge variant="secondary">{data.length} {language === 'ru' ? 'уроков' : language === 'kg' ? 'сабак' : 'lessons'}</Badge>
      </div>

      <div className="grid gap-6">
        {data.map((lesson, idx) => (
          <Card key={lesson.id || idx}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {idx + 1}
                  </span>
                  {getText(lesson.title, language)}
                </CardTitle>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {lesson.duration}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">{t.summary}:</p>
                <p className="text-foreground">{getText(lesson.summary, language)}</p>
              </div>

              {/* Content */}
              <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {getText(lesson.content, language)}
              </div>

              {/* Video */}
              <VideoEmbed 
                url={lesson.video} 
                title={getText(lesson.title, language)} 
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
