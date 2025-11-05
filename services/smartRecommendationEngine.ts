// Интеллектуальная система рекомендаций для приложения

import { Article } from './articlesDatabase';

export interface UserContext {
  soberDays: number;
  currentMood: number;
  cravingLevel: number;
  recentActivities: string[];
  completedTechniques: string[];
  readArticles: string[];
  gameScores: { gameId: string; score: number }[];
  triggerHistory: string[];
}

export interface Recommendation {
  type: 'article' | 'technique' | 'game' | 'insight';
  id: string;
  title: string;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
}

export class SmartRecommendationEngine {
  // Анализ паттернов поведения пользователя
  analyzeUserPatterns(context: UserContext): {
    riskLevel: 'low' | 'medium' | 'high';
    trends: string[];
    strengths: string[];
    concerns: string[];
  } {
    const { soberDays, currentMood, cravingLevel, triggerHistory } = context;
    
    const riskLevel = this.calculateRiskLevel(currentMood, cravingLevel, soberDays);
    
    const trends = this.identifyTrends(context);
    const strengths = this.identifyStrengths(context);
    const concerns = this.identifyConcerns(context);
    
    return { riskLevel, trends, strengths, concerns };
  }
  
  private calculateRiskLevel(
    mood: number,
    craving: number,
    soberDays: number
  ): 'low' | 'medium' | 'high' {
    // Низкое настроение + высокая тяга = высокий риск
    if (mood <= 2 && craving >= 4) return 'high';
    
    // Ранний период восстановления + средняя тяга
    if (soberDays <= 14 && craving >= 3) return 'high';
    
    // Средние показатели
    if (mood <= 3 || craving >= 3) return 'medium';
    
    return 'low';
  }
  
  private identifyTrends(context: UserContext): string[] {
    const trends: string[] = [];
    
    // Позитивная динамика
    if (context.soberDays > 30 && context.currentMood >= 4) {
      trends.push('Стабильный прогресс в восстановлении');
    }
    
    // Активное использование техник
    if (context.completedTechniques.length > 10) {
      trends.push('Высокая вовлеченность в практики самопомощи');
    }
    
    // Чтение образовательных материалов
    if (context.readArticles.length > 5) {
      trends.push('Активное изучение материалов о восстановлении');
    }
    
    return trends;
  }
  
  private identifyStrengths(context: UserContext): string[] {
    const strengths: string[] = [];
    
    if (context.soberDays >= 7) {
      strengths.push(`${context.soberDays} дней последовательной трезвости`);
    }
    
    if (context.cravingLevel <= 2) {
      strengths.push('Низкий уровень тяги - отличный контроль');
    }
    
    if (context.currentMood >= 4) {
      strengths.push('Стабильное позитивное настроение');
    }
    
    return strengths;
  }
  
  private identifyConcerns(context: UserContext): string[] {
    const concerns: string[] = [];
    
    if (context.cravingLevel >= 4) {
      concerns.push('Высокий уровень тяги требует внимания');
    }
    
    if (context.currentMood <= 2) {
      concerns.push('Низкое настроение может увеличить риск срыва');
    }
    
    if (context.soberDays <= 3) {
      concerns.push('Ранний период восстановления - критическое время');
    }
    
    return concerns;
  }
  
  // Генерация персонализированных рекомендаций
  generateRecommendations(
    context: UserContext,
    availableArticles: Article[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const patterns = this.analyzeUserPatterns(context);
    
    // Срочные рекомендации при высоком риске
    if (patterns.riskLevel === 'high') {
      recommendations.push({
        type: 'technique',
        id: 'emergency_breathing',
        title: 'Экстренная дыхательная техника',
        reason: 'Высокий уровень стресса и тяги - немедленное вмешательство',
        priority: 'urgent',
        category: 'Кризисная помощь'
      });
      
      recommendations.push({
        type: 'game',
        id: 'breath_bubble_pop',
        title: 'Дыхательная игра с пузырями',
        reason: 'Отвлечение + регуляция дыхания',
        priority: 'urgent',
        category: 'Отвлечение'
      });
    }
    
    // Рекомендации статей на основе этапа восстановления
    if (context.soberDays <= 7) {
      const beginnerArticles = availableArticles.filter(
        a => a.difficulty === 'beginner' && !context.readArticles.includes(a.id)
      );
      
      beginnerArticles.slice(0, 3).forEach(article => {
        recommendations.push({
          type: 'article',
          id: article.id,
          title: article.title,
          reason: 'Важная информация для раннего периода восстановления',
          priority: 'high',
          category: article.category
        });
      });
    }
    
    // Рекомендации на основе настроения
    if (context.currentMood <= 2) {
      recommendations.push({
        type: 'article',
        id: '14', // Самосострадание
        title: 'Самосострадание в восстановлении',
        reason: 'Низкое настроение - важность доброты к себе',
        priority: 'high',
        category: 'Психология восстановления'
      });
      
      recommendations.push({
        type: 'technique',
        id: 'loving_kindness',
        title: 'Медитация любящей доброты',
        reason: 'Повышение настроения и самопринятия',
        priority: 'medium',
        category: 'Медитация'
      });
    }
    
    // Рекомендации на основе тяги
    if (context.cravingLevel >= 3) {
      recommendations.push({
        type: 'article',
        id: '13', // Работа с триггерами
        title: 'Работа с триггерами',
        reason: 'Повышенная тяга - техники совладания',
        priority: 'high',
        category: 'Психология восстановления'
      });
      
      recommendations.push({
        type: 'game',
        id: 'rapid_decision_challenge',
        title: 'Вызов быстрых решений',
        reason: 'Тренировка принятия здоровых решений',
        priority: 'medium',
        category: 'Когнитивные игры'
      });
    }
    
    // Инсайты на основе прогресса
    if (context.soberDays === 7) {
      recommendations.push({
        type: 'insight',
        id: 'week_milestone',
        title: '🎉 Неделя трезвости!',
        reason: 'Важная веха - ваш мозг уже начал восстанавливаться',
        priority: 'high',
        category: 'Достижения'
      });
    }
    
    if (context.soberDays === 30) {
      recommendations.push({
        type: 'insight',
        id: 'month_milestone',
        title: '🏆 Месяц трезвости!',
        reason: 'Невероятное достижение - вы доказали свою силу',
        priority: 'high',
        category: 'Достижения'
      });
    }
    
    // Сортировка по приоритету
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    recommendations.sort((a, b) => 
      priorityOrder[b.priority] - priorityOrder[a.priority]
    );
    
    return recommendations.slice(0, 8); // Топ 8 рекомендаций
  }
  
  // Предиктивная аналитика
  predictFutureRisks(context: UserContext): {
    nextWeekRisk: 'low' | 'medium' | 'high';
    riskFactors: string[];
    protectiveFactors: string[];
    recommendations: string[];
  } {
    const riskFactors: string[] = [];
    const protectiveFactors: string[] = [];
    const recommendations: string[] = [];
    
    // Анализ риска на следующую неделю
    let riskScore = 0;
    
    // Факторы риска
    if (context.currentMood <= 2) {
      riskScore += 2;
      riskFactors.push('Низкое настроение');
      recommendations.push('Практиковать техники улучшения настроения ежедневно');
    }
    
    if (context.cravingLevel >= 3) {
      riskScore += 3;
      riskFactors.push('Повышенная тяга');
      recommendations.push('Составить детальный план действий при тяге');
    }
    
    if (context.soberDays <= 14) {
      riskScore += 2;
      riskFactors.push('Ранний период восстановления');
      recommendations.push('Избегать триггерных ситуаций');
    }
    
    if (context.completedTechniques.length < 3) {
      riskScore += 1;
      riskFactors.push('Низкое использование техник самопомощи');
      recommendations.push('Попробовать минимум одну технику в день');
    }
    
    // Защитные факторы
    if (context.soberDays >= 30) {
      riskScore -= 2;
      protectiveFactors.push('Месяц+ стабильной трезвости');
    }
    
    if (context.currentMood >= 4) {
      riskScore -= 1;
      protectiveFactors.push('Хорошее настроение');
    }
    
    if (context.completedTechniques.length >= 10) {
      riskScore -= 1;
      protectiveFactors.push('Активное использование техник');
    }
    
    if (context.readArticles.length >= 5) {
      riskScore -= 1;
      protectiveFactors.push('Образование о восстановлении');
    }
    
    // Определение уровня риска
    const nextWeekRisk: 'low' | 'medium' | 'high' = 
      riskScore >= 4 ? 'high' : 
      riskScore >= 2 ? 'medium' : 
      'low';
    
    return {
      nextWeekRisk,
      riskFactors,
      protectiveFactors,
      recommendations
    };
  }
  
  // Оптимальное время для различных активностей
  suggestOptimalTiming(context: UserContext): {
    meditation: string;
    exercise: string;
    reading: string;
    socializing: string;
  } {
    // На основе паттернов настроения и активности
    return {
      meditation: 'Утро (7:00-9:00) или вечер (20:00-22:00) для лучшего эффекта',
      exercise: 'Утро (6:00-8:00) или день (12:00-14:00) для повышения энергии',
      reading: 'Вечер (19:00-21:00) для расслабления и обучения',
      socializing: 'День (12:00-18:00) когда энергия на пике'
    };
  }
}

export const smartRecommendationEngine = new SmartRecommendationEngine();
