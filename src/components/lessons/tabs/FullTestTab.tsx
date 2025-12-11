import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/i18n';
import { LessonData } from '@/hooks/useLessonData';
import { FileText, CheckCircle, XCircle, RotateCcw, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FullTestTabProps {
  data: LessonData['full_test'];
}

function getText(obj: { en: string; ru: string; kg: string }, lang: Language): string {
  return obj[lang] || obj.en || '';
}

export function FullTestTab({ data }: FullTestTabProps) {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const t = {
    title: language === 'ru' ? 'Полный тест (ОРТ формат)' : language === 'kg' ? 'Толук тест (ЖРТ форматы)' : 'Full Test (ORT Format)',
    question: language === 'ru' ? 'Вопрос' : language === 'kg' ? 'Суроо' : 'Question',
    of: language === 'ru' ? 'из' : language === 'kg' ? 'ичинен' : 'of',
    prev: language === 'ru' ? 'Назад' : language === 'kg' ? 'Артка' : 'Previous',
    next: language === 'ru' ? 'Далее' : language === 'kg' ? 'Кийинки' : 'Next',
    submit: language === 'ru' ? 'Завершить тест' : language === 'kg' ? 'Тестти бүтүрүү' : 'Submit Test',
    retake: language === 'ru' ? 'Пройти заново' : language === 'kg' ? 'Кайра өтүү' : 'Retake Test',
    results: language === 'ru' ? 'Результаты' : language === 'kg' ? 'Жыйынтыктар' : 'Results',
    score: language === 'ru' ? 'Ваш результат' : language === 'kg' ? 'Сиздин жыйынтык' : 'Your Score',
    correct: language === 'ru' ? 'Правильно' : language === 'kg' ? 'Туура' : 'Correct',
    incorrect: language === 'ru' ? 'Неправильно' : language === 'kg' ? 'Туура эмес' : 'Incorrect',
    explanation: language === 'ru' ? 'Объяснение' : language === 'kg' ? 'Түшүндүрмө' : 'Explanation',
    answered: language === 'ru' ? 'Отвечено' : language === 'kg' ? 'Жооп берилди' : 'Answered',
    yourAnswer: language === 'ru' ? 'Ваш ответ' : language === 'kg' ? 'Сиздин жооп' : 'Your answer',
    correctAnswer: language === 'ru' ? 'Правильный ответ' : language === 'kg' ? 'Туура жооп' : 'Correct answer',
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {language === 'ru' ? 'Полный тест пока не добавлен' : language === 'kg' ? 'Толук тест жок' : 'No full test available yet'}
      </div>
    );
  }

  const currentQuestion = data[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / data.length) * 100;

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: answer }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setAnswers({});
    setIsSubmitted(false);
  };

  const calculateScore = () => {
    let correct = 0;
    data.forEach((q, idx) => {
      if (answers[idx] === q.correct) correct++;
    });
    return correct;
  };

  if (isSubmitted) {
    const score = calculateScore();
    const percentage = Math.round((score / data.length) * 100);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">{t.results}</h2>
        </div>

        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className="text-6xl mb-4">{percentage >= 70 ? '🎉' : percentage >= 50 ? '👍' : '📚'}</div>
            <p className="text-lg text-muted-foreground mb-2">{t.score}:</p>
            <div className="text-4xl font-bold text-primary mb-2">{score}/{data.length}</div>
            <Progress value={percentage} className="w-64 mx-auto mb-4" />
            <p className="text-xl mb-6">{percentage}%</p>
            <Button onClick={handleRetake} size="lg">
              <RotateCcw className="mr-2 h-4 w-4" />
              {t.retake}
            </Button>
          </CardContent>
        </Card>

        {/* Review answers */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">
            {language === 'ru' ? 'Разбор ответов' : language === 'kg' ? 'Жооптордун талдоосу' : 'Answer Review'}
          </h3>
          {data.map((q, idx) => {
            const userAnswer = answers[idx];
            const isCorrect = userAnswer === q.correct;
            
            return (
              <Card key={q.id || idx} className={cn(
                'border-l-4',
                isCorrect ? 'border-l-green-500' : 'border-l-destructive'
              )}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive mt-1 shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium mb-2">
                        {t.question} {idx + 1}: {getText(q.question, language)}
                      </p>
                      <div className="text-sm space-y-1">
                        <p className={isCorrect ? 'text-green-600' : 'text-destructive'}>
                          {t.yourAnswer}: {userAnswer || '-'}
                        </p>
                        {!isCorrect && (
                          <p className="text-green-600">{t.correctAnswer}: {q.correct}</p>
                        )}
                      </div>
                      <div className="mt-3 p-3 bg-muted/50 rounded text-sm">
                        <p className="font-medium text-muted-foreground">{t.explanation}:</p>
                        <p className="text-foreground">{getText(q.explanation, language)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
        </div>
        <Badge variant="outline">
          {t.answered}: {answeredCount}/{data.length}
        </Badge>
      </div>

      <Progress value={progressPercent} />

      {/* Question navigator */}
      <div className="flex flex-wrap gap-2">
        {data.map((_, idx) => (
          <Button
            key={idx}
            variant={currentIndex === idx ? 'default' : answers[idx] ? 'secondary' : 'outline'}
            size="sm"
            className="w-10 h-10"
            onClick={() => setCurrentIndex(idx)}
          >
            {idx + 1}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t.question} {currentIndex + 1} {t.of} {data.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg text-foreground">{getText(currentQuestion.question, language)}</p>

          <div className="grid gap-3">
            {(['A', 'B', 'C', 'D'] as const).map((option) => (
              <Button
                key={option}
                variant="outline"
                className={cn(
                  'justify-start h-auto py-3 px-4 text-left',
                  answers[currentIndex] === option && 'border-primary bg-primary/10'
                )}
                onClick={() => handleAnswer(option)}
              >
                <span className="font-bold mr-3">{option}.</span>
                {getText(currentQuestion.options[option], language)}
              </Button>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.prev}
            </Button>

            {currentIndex === data.length - 1 ? (
              <Button 
                onClick={handleSubmit}
                disabled={answeredCount < data.length}
              >
                {t.submit}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentIndex(prev => Math.min(data.length - 1, prev + 1))}
              >
                {t.next}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
