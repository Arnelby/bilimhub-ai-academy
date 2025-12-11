import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/i18n';
import { LessonData } from '@/hooks/useLessonData';
import { StorageImage } from '../storage/StorageImage';
import { VideoEmbed } from '../storage/VideoEmbed';
import { BookOpen, Lightbulb, Calculator } from 'lucide-react';

interface BasicLessonTabProps {
  data: LessonData['basic_lesson'];
}

function getText(obj: { en: string; ru: string; kg: string }, lang: Language): string {
  return obj[lang] || obj.en || '';
}

export function BasicLessonTab({ data }: BasicLessonTabProps) {
  const { language } = useLanguage();

  const t = {
    theory: language === 'ru' ? 'Теория' : language === 'kg' ? 'Теория' : 'Theory',
    definitions: language === 'ru' ? 'Определения' : language === 'kg' ? 'Аныктамалар' : 'Definitions',
    examples: language === 'ru' ? 'Примеры' : language === 'kg' ? 'Мисалдар' : 'Examples',
    rules: language === 'ru' ? 'Правила' : language === 'kg' ? 'Эрежелер' : 'Rules',
    solution: language === 'ru' ? 'Решение' : language === 'kg' ? 'Чечим' : 'Solution',
    videoLesson: language === 'ru' ? 'Видео урок' : language === 'kg' ? 'Видео сабак' : 'Video Lesson',
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">{getText(data.title, language)}</h2>
      </div>

      {/* Video Section */}
      {data.video && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🎬</span> {t.videoLesson}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VideoEmbed url={data.video} title={getText(data.title, language)} />
          </CardContent>
        </Card>
      )}

      {/* Theory Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📚</span> {t.theory}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {getText(data.theory, language)}
          </p>
        </CardContent>
      </Card>

      {/* Definitions */}
      {data.definitions && data.definitions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" /> {t.definitions}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.definitions.map((def, idx) => (
              <div key={idx} className="p-4 bg-muted/50 rounded-lg">
                <p className="font-semibold text-foreground">{getText(def.term, language)}</p>
                <p className="text-muted-foreground mt-1">{getText(def.definition, language)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Rules */}
      {data.rules && data.rules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📐</span> {t.rules}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.rules.map((rule, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <p className="font-semibold text-foreground mb-2">{getText(rule.name, language)}</p>
                <p className="text-muted-foreground">{getText(rule.description, language)}</p>
                {rule.formula && (
                  <div className="mt-3 p-3 bg-primary/10 rounded font-mono text-center">
                    {rule.formula}
                  </div>
                )}
                {rule.image && (
                  <div className="mt-3">
                    <StorageImage path={rule.image} alt={getText(rule.name, language)} className="max-w-full" />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Examples */}
      {data.examples && data.examples.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" /> {t.examples}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {data.examples.map((example, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <Badge variant="outline" className="mb-3">
                  {language === 'ru' ? 'Пример' : language === 'kg' ? 'Мисал' : 'Example'} {idx + 1}
                </Badge>
                <h4 className="font-semibold text-foreground mb-2">{getText(example.title, language)}</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {language === 'ru' ? 'Задача:' : language === 'kg' ? 'Маселе:' : 'Problem:'}
                    </p>
                    <p className="text-foreground">{getText(example.problem, language)}</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded">
                    <p className="text-sm font-medium text-primary mb-1">{t.solution}:</p>
                    <p className="text-foreground whitespace-pre-wrap">{getText(example.solution, language)}</p>
                  </div>
                  {example.image && (
                    <StorageImage path={example.image} alt={getText(example.title, language)} className="max-w-md" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
