import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { GamificationToast, GamificationEventType } from '@/components/gamification/GamificationToast';
import { Confetti } from '@/components/gamification/Confetti';

interface GamificationEvent {
  id: string;
  type: GamificationEventType;
  value?: number | string;
  title?: string;
  description?: string;
}

interface GamificationContextType {
  triggerEvent: (event: Omit<GamificationEvent, 'id'>) => void;
  triggerConfetti: () => void;
}

const GamificationContext = createContext<GamificationContextType | null>(null);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<GamificationEvent[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const triggerEvent = useCallback((event: Omit<GamificationEvent, 'id'>) => {
    const id = `${Date.now()}-${Math.random()}`;
    setEvents((prev) => [...prev, { ...event, id }]);
  }, []);

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
  }, []);

  const removeEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <GamificationContext.Provider value={{ triggerEvent, triggerConfetti }}>
      {children}
      
      {/* Render active toasts */}
      {events.map((event, index) => (
        <div
          key={event.id}
          style={{ top: `${16 + index * 100}px` }}
          className="fixed right-4 z-50"
        >
          <GamificationToast
            type={event.type}
            value={event.value}
            title={event.title}
            description={event.description}
            onComplete={() => removeEvent(event.id)}
          />
        </div>
      ))}

      {/* Confetti effect */}
      <Confetti
        active={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />
    </GamificationContext.Provider>
  );
}

export function useGamificationEvents() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamificationEvents must be used within a GamificationProvider');
  }
  return context;
}
