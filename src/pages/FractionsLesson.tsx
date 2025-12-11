import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLessonData } from '@/hooks/useLessonData';
import { BasicLessonTab } from '@/components/lessons/tabs/BasicLessonTab';
import { MiniLessonsTab } from '@/components/lessons/tabs/MiniLessonsTab';
import { DiagramsTab } from '@/components/lessons/tabs/DiagramsTab';
import { CommonMistakesTab } from '@/components/lessons/tabs/CommonMistakesTab';
import { MiniTestsTab } from '@/components/lessons/tabs/MiniTestsTab';
import { FullTestTab } from '@/components/lessons/tabs/FullTestTab';
import { DynamicLessonsTab } from '@/components/lessons/tabs/DynamicLessonsTab';
import { 
  BookOpen, 
  PlayCircle, 
  LayoutGrid, 
  AlertTriangle, 
  Brain, 
  FileText, 
  Sparkles,
  Globe,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

type TabType = 'basic' | 'mini' | 'diagrams' | 'mistakes' | 'miniTests' | 'fullTest' | 'dynamic';

const tabIcons: Record<TabType, React.ReactNode> = {
  basic: <BookOpen className="h-4 w-4" />,
  mini: <PlayCircle className="h-4 w-4" />,
  diagrams: <LayoutGrid className="h-4 w-4" />,
  mistakes: <AlertTriangle className="h-4 w-4" />,
  miniTests: <Brain className="h-4 w-4" />,
  fullTest: <FileText className="h-4 w-4" />,
  dynamic: <Sparkles className="h-4 w-4" />,
};

export default function FractionsLesson() {
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  
  // Load lesson data from Supabase storage
  const { data, loading, error } = useLessonData('fractions/fraction.json');

  const t = {
    title: language === 'ru' ? 'Дроби' : language === 'kg' ? 'Бөлчөктөр' : 'Fractions',
    subtitle: language === 'ru' 
      ? 'Полный интерактивный урок' 
      : language === 'kg' 
        ? 'Толук интерактивдик сабак' 
        : 'Complete Interactive Lesson',
    loading: language === 'ru' ? 'Загрузка урока...' : language === 'kg' ? 'Сабак жүктөлүүдө...' : 'Loading lesson...',
    error: language === 'ru' ? 'Ошибка загрузки' : language === 'kg' ? 'Жүктөө катасы' : 'Loading error',
    retry: language === 'ru' ? 'Повторить' : language === 'kg' ? 'Кайталоо' : 'Retry',
    back: language === 'ru' ? 'Назад к урокам' : language === 'kg' ? 'Сабактарга кайтуу' : 'Back to Lessons',
    tabs: {
      basic: language === 'ru' ? 'Основной урок' : language === 'kg' ? 'Негизги сабак' : 'Basic Lesson',
      mini: language === 'ru' ? 'Мини-уроки' : language === 'kg' ? 'Мини-сабактар' : 'Mini Lessons',
      diagrams: language === 'ru' ? 'Диаграммы' : language === 'kg' ? 'Диаграммалар' : 'Diagrams',
      mistakes: language === 'ru' ? 'Типичные ошибки' : language === 'kg' ? 'Типтүү каталар' : 'Common Mistakes',
      miniTests: language === 'ru' ? 'Мини-тесты' : language === 'kg' ? 'Мини-тесттер' : 'Mini-Tests',
      fullTest: language === 'ru' ? 'Полный тест' : language === 'kg' ? 'Толук тест' : 'Full Test',
      dynamic: language === 'ru' ? 'AI Урок' : language === 'kg' ? 'AI Сабак' : 'AI Lesson',
    },
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <Skeleton className="h-96" />
              </div>
              <div>
                <Skeleton className="h-64" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-8 pb-8">
              <div className="text-6xl mb-4">😕</div>
              <h2 className="text-xl font-bold mb-2">{t.error}</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link to="/math-lessons">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t.back}
                  </Link>
                </Button>
                <Button onClick={() => window.location.reload()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t.retry}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/math-lessons">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  {t.back}
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
            <p className="text-muted-foreground mt-1">{t.subtitle}</p>
          </div>
          
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <div className="flex rounded-lg border overflow-hidden">
              {(['en', 'ru', 'kg'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    language === lang 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background hover:bg-muted'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Content Area (3/4) */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
              {/* Mobile Tab List */}
              <TabsList className="w-full flex-wrap h-auto gap-1 mb-6 lg:hidden">
                {(Object.keys(tabIcons) as TabType[]).map((tab) => (
                  <TabsTrigger 
                    key={tab} 
                    value={tab}
                    className="flex-1 min-w-[100px] gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {tabIcons[tab]}
                    <span className="text-xs">{t.tabs[tab]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="basic" className="mt-0">
                <BasicLessonTab data={data.basic_lesson} />
              </TabsContent>
              <TabsContent value="mini" className="mt-0">
                <MiniLessonsTab data={data.mini_lessons} />
              </TabsContent>
              <TabsContent value="diagrams" className="mt-0">
                <DiagramsTab data={data.diagrams} />
              </TabsContent>
              <TabsContent value="mistakes" className="mt-0">
                <CommonMistakesTab data={data.common_mistakes} />
              </TabsContent>
              <TabsContent value="miniTests" className="mt-0">
                <MiniTestsTab data={data.mini_tests} />
              </TabsContent>
              <TabsContent value="fullTest" className="mt-0">
                <FullTestTab data={data.full_test} />
              </TabsContent>
              <TabsContent value="dynamic" className="mt-0">
                <DynamicLessonsTab data={data.dynamic_lessons} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Navigation (1/4) */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="sticky top-4">
              <Card className="hidden lg:block">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-4 text-card-foreground">
                    {language === 'ru' ? 'Содержание' : language === 'kg' ? 'Мазмуну' : 'Contents'}
                  </h3>
                  <nav className="space-y-1">
                    {(Object.keys(tabIcons) as TabType[]).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-all ${
                          activeTab === tab
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        }`}
                      >
                        {tabIcons[tab]}
                        <span className="text-sm font-medium">{t.tabs[tab]}</span>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              {/* Topic Info Card */}
              <Card className="mt-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">📐</span>
                    <h4 className="font-semibold">{t.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ru' 
                      ? 'Изучите дроби через теорию, примеры, диаграммы и интерактивные тесты.'
                      : language === 'kg'
                        ? 'Бөлчөктөрдү теория, мисалдар, диаграммалар жана интерактивдик тесттер аркылуу үйрөнүңүз.'
                        : 'Learn fractions through theory, examples, diagrams, and interactive tests.'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
