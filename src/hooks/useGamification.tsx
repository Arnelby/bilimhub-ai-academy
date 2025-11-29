import { supabase } from '@/integrations/supabase/client';

export type AchievementType = 'first_lesson' | 'first_test' | 'streak_3' | 'streak_7' | 'streak_30' | 'mastery_5' | 'mastery_10' | 'perfect_score' | 'early_bird' | 'night_owl';

interface GamificationUpdate {
  userId: string;
  pointsEarned?: number;
  testScore?: number;
  lessonCompleted?: boolean;
  topicId?: string;
}

export async function updateGamification({
  userId,
  pointsEarned = 0,
  testScore,
  lessonCompleted,
  topicId,
}: GamificationUpdate) {
  try {
    // Get current profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const lastActivity = profile.last_activity_date;
    
    let newStreak = profile.streak || 0;
    let newPoints = (profile.points || 0) + pointsEarned;
    let newLevel = profile.level || 1;

    // Update streak
    if (lastActivity !== today) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastActivity === yesterdayStr) {
        newStreak += 1;
      } else if (lastActivity !== today) {
        newStreak = 1;
      }
    }

    // Calculate level (every 500 points = 1 level)
    newLevel = Math.floor(newPoints / 500) + 1;

    // Update profile
    await supabase
      .from('profiles')
      .update({
        points: newPoints,
        streak: newStreak,
        level: newLevel,
        last_activity_date: today,
      })
      .eq('id', userId);

    // Check and award achievements
    const achievementsToCheck: { type: AchievementType; condition: boolean }[] = [];

    // Lesson achievements
    if (lessonCompleted) {
      const { count: lessonCount } = await supabase
        .from('user_lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completed', true);

      if (lessonCount === 1) {
        achievementsToCheck.push({ type: 'first_lesson', condition: true });
      }
    }

    // Test achievements
    if (testScore !== undefined) {
      const { count: testCount } = await supabase
        .from('user_tests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('completed_at', 'is', null);

      if (testCount === 1) {
        achievementsToCheck.push({ type: 'first_test', condition: true });
      }

      if (testScore === 100) {
        achievementsToCheck.push({ type: 'perfect_score', condition: true });
      }
    }

    // Streak achievements
    if (newStreak >= 3) achievementsToCheck.push({ type: 'streak_3', condition: true });
    if (newStreak >= 7) achievementsToCheck.push({ type: 'streak_7', condition: true });
    if (newStreak >= 30) achievementsToCheck.push({ type: 'streak_30', condition: true });

    // Time-based achievements
    const hour = now.getHours();
    if (hour >= 5 && hour <= 7) {
      achievementsToCheck.push({ type: 'early_bird', condition: true });
    }
    if (hour >= 22 || hour <= 2) {
      achievementsToCheck.push({ type: 'night_owl', condition: true });
    }

    // Award achievements
    for (const { type, condition } of achievementsToCheck) {
      if (!condition) continue;

      // Check if already has achievement
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement', type)
        .single();

      if (!existing) {
        const pointsForAchievement = getAchievementPoints(type);
        await supabase.from('user_achievements').insert({
          user_id: userId,
          achievement: type,
          points_awarded: pointsForAchievement,
        });

        // Add achievement points
        await supabase
          .from('profiles')
          .update({ points: newPoints + pointsForAchievement })
          .eq('id', userId);
      }
    }

    // Update topic mastery if topicId provided
    if (topicId && testScore !== undefined) {
      const mastery = testScore >= 80 ? 'mastered' : testScore >= 50 ? 'in_progress' : 'weak';
      
      await supabase
        .from('user_topic_progress')
        .upsert({
          user_id: userId,
          topic_id: topicId,
          mastery,
          progress_percentage: testScore,
          last_practiced: now.toISOString(),
        });
    }

    return { newStreak, newPoints, newLevel };
  } catch (error) {
    console.error('Error updating gamification:', error);
    throw error;
  }
}

function getAchievementPoints(type: AchievementType): number {
  const pointsMap: Record<AchievementType, number> = {
    first_lesson: 50,
    first_test: 50,
    streak_3: 100,
    streak_7: 200,
    streak_30: 500,
    mastery_5: 150,
    mastery_10: 300,
    perfect_score: 100,
    early_bird: 25,
    night_owl: 25,
  };
  return pointsMap[type] || 50;
}
