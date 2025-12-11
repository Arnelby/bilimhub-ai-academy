import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/i18n';
import { LessonData } from '@/hooks/useLessonData';
import { Brain, CheckCircle, XCircle, RotateCcw, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MiniTestsTabProps {
  data: LessonData['mini_tests'];
}

function getText(obj: { en: string; ru: string; kg: string }, lang: Language): string {
  return obj[lang] || obj.en || '';
}

type Difficulty = 'easy' | 'medium' | 'hard';

export function MiniTestsTab({ data }: MiniTestsTabProps) {
  const { language } = useLanguage();
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('easy');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const t = {
    title: language === 'ru' ? 'Адаптивные мини-тесты' : language === 'kg' ? 'Адаптивдик мини-тесттер' : 'Adaptive Mini-Tests',
    difficulty: language === 'ru' ? 'Сложность' : language === 'kg' ? 'Кыйынчылык' : 'Difficulty',
    easy: language === 'ru' ? 'Легкий' : language === 'kg' ? 'Жеңил' : 'Easy',
    medium: language === 'ru' ? 'Средний' : language === 'kg' ? 'Орточо' : 'Medium',
    hard: language === 'ru' ? 'Сложный' : language === 'kg' ? 'Кыйын' : 'Hard',
    question: language === 'ru' ? 'Вопрос' : language === 'kg' ? 'Суроо' : 'Question',
    score: language === 'ru' ? 'Счёт' : language === 'kg' ? 'Упай' : 'Score',
    correct: language === 'ru' ? 'Правильно!' : language === 'kg' ? 'Туура!' : 'Correct!',
    incorrect: language === 'ru' ? 'Неправильно' : language === 'kg' ? 'Туура эмес' : 'Incorrect',
    explanation: language === 'ru' ? 'Объяснение' : language === 'kg' ? 'Түшүндүрмө' : 'Explanation',
    next: language === 'ru' ? 'Следующий' : language === 'kg' ? 'Кийинки' : 'Next',
    restart: language === 'ru' ? 'Начать заново' : language === 'kg' ? 'Кайра баштоо' : 'Start Over',
    complete: language === 'ru' ? 'Тест завершён!' : language === 'kg' ? 'Тест бүттү!' : 'Test Complete!',
    yourScore: language === 'ru' ? 'Ваш результат' : language === 'kg' ? 'Сиздин жыйынтык' : 'Your Score',
  };

  const difficultyLabels: Record<Difficulty, string> = {
    easy: t.easy,
    medium: t.medium,
    hard: t.hard,
  };

  const filteredQuestions = useMemo(() => {
    return data?.filter(q => q.difficulty === currentDifficulty) || [];
  }, [data, currentDifficulty]);

  const currentQuestion = filteredQuestions[currentIndex];

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const checkAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;
    
    setShowResult(true);
    setTotalAnswered(prev => prev + 1);
    
    const isCorrect = selectedAnswer === currentQuestion.correct;
    if (isCorrect) {
      setScore(prev => prev + 1);
      // Increase difficulty after correct answers
      if (currentDifficulty === 'easy') {
        setCurrentDifficulty('medium');
      } else if (currentDifficulty === 'medium') {
        setCurrentDifficulty('hard');
      }
    } else {
      // Decrease difficulty after wrong answers
      if (currentDifficulty === 'hard') {
        setCurrentDifficulty('medium');
      } else if (currentDifficulty === 'medium') {
        setCurrentDifficulty('easy');
      }
    }
  };

  const nextQuestion = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= filteredQuestions.length) {
      // Try next difficulty or end
      const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
      const nextDiffIndex = difficulties.indexOf(currentDifficulty) + 1;
      if (nextDiffIndex < difficulties.length) {
        setCurrentDifficulty(difficulties[nextDiffIndex]);
        setCurrentIndex(0);
      } else {
        setIsComplete(true);
      }
    } else {
      setCurrentIndex(nextIndex);
    }
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const restart = () => {
    setCurrentDifficulty('easy');
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setTotalAnswered(0);
    setIsComplete(false);
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {language === 'ru' ? 'Мини-тесты пока не добавлены' : language === 'kg' ? 'Мини-тесттер жок' : 'No mini-tests available yet'}
      </div>
    );
  }

  if (isComplete) {
    const percentage = Math.round((score / totalAnswered) * 100);
    return (
      <div className="space-y-6">
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4">{t.complete}</h2>
            <p className="text-lg text-muted-foreground mb-4">{t.yourScore}:</p>
            <div className="text-4xl font-bold text-primary mb-2">{score}/{totalAnswered}</div>
            <Progress value={percentage} className="w-64 mx-auto mb-6" />
            <p className="text-xl mb-6">{percentage}%</p>
            <Button onClick={restart} size="lg">
              <RotateCcw className="mr-2 h-4 w-4" />
              {t.restart}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No questions for this difficulty</p>
        <Button onClick={() => setCurrentDifficulty('easy')}>
          {t.restart}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline">{t.score}: {score}/{totalAnswered}</Badge>
          <Badge 
            variant={currentDifficulty === 'easy' ? 'secondary' : currentDifficulty === 'medium' ? 'default' : 'destructive'}
          >
            {t.difficulty}: {difficultyLabels[currentDifficulty]}
          </Badge>
        </div>
      </div>

      <Progress value={(totalAnswered / data.length) * 100} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t.question} {totalAnswered + 1}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg text-foreground">{getText(currentQuestion.question, language)}</p>

          <div className="grid gap-3">
            {(['A', 'B', 'C', 'D'] as const).map((option) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = currentQuestion.correct === option;
              
              return (
                <Button
                  key={option}
                  variant="outline"
                  className={cn(
                    'justify-start h-auto py-3 px-4 text-left',
                    isSelected && !showResult && 'border-primary bg-primary/10',
                    showResult && isCorrect && 'border-green-500 bg-green-500/10 text-green-700',
                    showResult && isSelected && !isCorrect && 'border-destructive bg-destructive/10 text-destructive'
                  )}
                  onClick={() => handleAnswer(option)}
                  disabled={showResult}
                >
                  <span className="font-bold mr-3">{option}.</span>
                  {getText(currentQuestion.options[option], language)}
                  {showResult && isCorrect && <CheckCircle className="ml-auto h-5 w-5 text-green-500" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="ml-auto h-5 w-5 text-destructive" />}
                </Button>
              );
            })}
          </div>

          {!showResult && selectedAnswer && (
            <Button onClick={checkAnswer} className="w-full">
              {language === 'ru' ? 'Проверить' : language === 'kg' ? 'Текшерүү' : 'Check Answer'}
            </Button>
          )}

          {showResult && (
            <div className="space-y-4">
              <div className={cn(
                'p-4 rounded-lg',
                selectedAnswer === currentQuestion.correct ? 'bg-green-500/10 border border-green-500/20' : 'bg-destructive/10 border border-destructive/20'
              )}>
                <p className={cn(
                  'font-semibold flex items-center gap-2',
                  selectedAnswer === currentQuestion.correct ? 'text-green-600' : 'text-destructive'
                )}>
                  {selectedAnswer === currentQuestion.correct ? (
                    <><CheckCircle className="h-5 w-5" /> {t.correct}</>
                  ) : (
                    <><XCircle className="h-5 w-5" /> {t.incorrect}</>
                  )}
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium text-muted-foreground mb-2">{t.explanation}:</p>
                <p className="text-foreground">{getText(currentQuestion.explanation, language)}</p>
              </div>

              <Button onClick={nextQuestion} className="w-full">
                {t.next}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
