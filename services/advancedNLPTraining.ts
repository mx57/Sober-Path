
// Расширенные НЛП практики и тренировки

export interface NLPExercise {
  id: string;
  title: string;
  category: 'anchoring' | 'reframing' | 'swish' | 'parts_integration' | 'timeline' | 'meta_programs' | 'values_work' | 'beliefs_work';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number;
  description: string;
  instructions: ExerciseStep[];
  benefits: string[];
  contraindications?: string[];
  prerequisites?: string[];
  followUpExercises?: string[];
  personalizedVariants?: PersonalizedVariant[];
}

export interface ExerciseStep {
  id: string;
  title: string;
  instruction: string;
  duration?: number;
  visualAids?: VisualAid[];
  audioGuides?: AudioGuide[];
  interactiveElements?: InteractiveElement[];
  checkpoints?: Checkpoint[];
}

export interface PersonalizedVariant {
  condition: string;
  modifications: StepModification[];
}

export interface StepModification {
  stepId: string;
  type: 'replace' | 'add_before' | 'add_after' | 'modify';
  content: string;
}

// Продвинутые НЛП упражнения
export const advancedNLPExercises: NLPExercise[] = [
  {
    id: 'advanced_anchoring_001',
    title: 'Мульти-сенсорное якорение ресурсных состояний',
    category: 'anchoring',
    difficulty: 'advanced',
    duration: 25,
    description: 'Создание мощного якоря, включающего все сенорные системы для доступа к пиковым ресурсным состояниям',
    instructions: [
      {
        id: 'step_1',
        title: 'Выбор ресурсного состояния',
        instruction: 'Вспомните момент, когда вы чувствовали себя абсолютно уверенно, спокойно и сильно. Это может быть любое достижение, момент гордости или внутренней силы.',
        duration: 3,
        checkpoints: [
          { id: 'cp1', question: 'Можете ли вы четко вспомнить этот момент?', required: true },
          { id: 'cp2', question: 'Чувствуете ли вы эмоции от того воспоминания?', required: true }
        ]
      },
      {
        id: 'step_2',
        title: 'Визуальное усиление',
        instruction: 'Сделайте картинку этого воспоминания ярче, крупнее, четче. Добавьте насыщенность цветов. Если это черно-белое воспоминание - добавьте цвета.',
        duration: 4,
        interactiveElements: [
          { type: 'slider', label: 'Яркость изображения', min: 1, max: 10 },
          { type: 'slider', label: 'Размер картинки', min: 1, max: 10 },
          { type: 'slider', label: 'Четкость', min: 1, max: 10 }
        ]
      },
      {
        id: 'step_3',
        title: 'Аудиальное усиление',
        instruction: 'Усильте звуки того момента. Если там была музыка - сделайте ее громче и насыщеннее. Если были голоса - сделайте их более теплыми и поддерживающими.',
        duration: 3,
        audioGuides: [
          { file: 'audio_enhancement_guide.mp3', description: 'Гид по усилению звуков воспоминаний' }
        ]
      },
      {
        id: 'step_4',
        title: 'Кинестетическое усиление',
        instruction: 'Почувствуйте телесные ощущения того момента. Температуру, текстуры, вес. Усильте положительные физические ощущения - уверенность в теле, расслабленность, силу.',
        duration: 4
      },
      {
        id: 'step_5',
        title: 'Создание якоря',
        instruction: 'В пик интенсивности ощущений сожмите большой и указательный пальцы правой руки, одновременно скажите про себя "Ресурс" и представьте золотистый свет в области сердца.',
        duration: 2
      },
      {
        id: 'step_6',
        title: 'Усиление якоря',
        instruction: 'Повторите процесс еще 4 раза, каждый раз активируя якорь в пик интенсивности. Между повторениями делайте паузу и думайте о чем-то нейтральном.',
        duration: 8
      },
      {
        id: 'step_7',
        title: 'Тестирование якоря',
        instruction: 'Подумайте о слегка стрессовой ситуации, затем активируйте якорь. Заметьте изменения в своем состоянии.',
        duration: 2
      }
    ],
    benefits: [
      'Быстрый доступ к ресурсным состояниям',
      'Повышение уверенности в стрессовых ситуациях', 
      'Улучшение эмоциональной регуляции',
      'Снижение тяги к веществам'
    ],
    followUpExercises: ['anchor_chaining_001', 'resource_stack_001']
  },
  
  {
    id: 'swish_pattern_advanced_001',
    title: 'Продвинутый Swish-паттерн для преодоления триггеров',
    category: 'swish',
    difficulty: 'intermediate',
    duration: 20,
    description: 'Мощная техника перепрограммирования автоматических реакций на триггеры зависимости',
    instructions: [
      {
        id: 'step_1',
        title: 'Идентификация триггера',
        instruction: 'Определите конкретную ситуацию, объект или мысль, которые вызывают у вас тягу. Представьте это как четкую картинку.',
        duration: 3,
        checkpoints: [
          { id: 'trigger_clear', question: 'Видите ли вы четкую картинку триггера?', required: true }
        ]
      },
      {
        id: 'step_2',
        title: 'Создание желаемого образа',
        instruction: 'Создайте яркий образ себя - уверенного, здорового, легко справляющегося с этой ситуацией. Вы видите себя со стороны, излучающего спокойствие и силу.',
        duration: 4,
        visualAids: [
          { type: 'image', url: 'confident_self_visualization.jpg' }
        ]
      },
      {
        id: 'step_3',
        title: 'Настройка субмодальностей триггера',
        instruction: 'Сделайте картинку триггера большой, яркой и близкой. Почувствуйте дискомфорт, который она вызывает.',
        duration: 2
      },
      {
        id: 'step_4',
        title: 'Размещение желаемого образа',
        instruction: 'Поместите маленький темный образ желаемого себя в правый нижний угол картинки триггера.',
        duration: 1
      },
      {
        id: 'step_5',
        title: 'Swish!',
        instruction: 'Быстро и одновременно: картинка триггера становится маленькой, темной и далекой, а желаемый образ становится большим, ярким и близким. Говорите "Swish!" и делайте жест рукой.',
        duration: 1
      },
      {
        id: 'step_6',
        title: 'Прерывание паттерна',
        instruction: 'Посмотрите вокруг, сделайте несколько движений, подумайте о чем-то совершенно постороннем.',
        duration: 1
      },
      {
        id: 'step_7',
        title: 'Повторение',
        instruction: 'Повторите swish еще 6 раз, каждый раз делая прерывание паттерна между повторениями.',
        duration: 7
      },
      {
        id: 'step_8',
        title: 'Тестирование',
        instruction: 'Попробуйте вызвать первоначальную картинку триггера. Заметьте, что происходит.',
        duration: 1
      }
    ],
    benefits: [
      'Автоматическое изменение реакции на триггеры',
      'Снижение силы тяги при встрече с триггерами',
      'Повышение уверенности в триггерных ситуациях',
      'Создание новых нейронных путей'
    ]
  },

  {
    id: 'parts_integration_001',
    title: 'Интеграция частей личности в выздоровлении',
    category: 'parts_integration',
    difficulty: 'advanced',
    duration: 35,
    description: 'Работа с внутренними конфликтами между частью, желающей выздоровления, и частью, сопротивляющейся изменениям',
    instructions: [
      {
        id: 'step_1',
        title: 'Идентификация конфликтующих частей',
        instruction: 'Определите две части себя: одну, которая хочет выздоровления и здоровья, и другую, которая тянет к старым привычкам. Где в теле вы ощущаете каждую из них?',
        duration: 5
      },
      {
        id: 'step_2',
        title: 'Диалог с "частью выздоровления"',
        instruction: 'Обратитесь к части, желающей выздоровления. Спросите: "Что ты хочешь для меня? Какова твоя позитивная цель?" Выслушайте ответ.',
        duration: 5
      },
      {
        id: 'step_3',
        title: 'Диалог с "частью сопротивления"',
        instruction: 'Теперь обратитесь к части, которая сопротивляется. С уважением спросите: "Что ты пытаешься сделать для меня? Как ты меня защищаешь?" Выслушайте без осуждения.',
        duration: 5
      },
      {
        id: 'step_4',
        title: 'Поиск общей цели',
        instruction: 'Найдите общую позитивную цель обеих частей. Обычно это безопасность, любовь, принятие или защита. Признайте ценность обеих частей.',
        duration: 5
      },
      {
        id: 'step_5',
        title: 'Переговоры между частями',
        instruction: 'Организуйте переговоры между частями. Как они могут сотрудничать для достижения общей цели? Какие новые способы может найти "часть сопротивления" для вашей защиты?',
        duration: 8
      },
      {
        id: 'step_6',
        title: 'Визуализация интеграции',
        instruction: 'Представьте, как обе части движутся друг к другу и сливаются в единое целое. Почувствуйте эту целостность в своем теле.',
        duration: 5
      },
      {
        id: 'step_7',
        title: 'Создание нового поведения',
        instruction: 'Из этого состояния целостности представьте, как вы будете действовать в будущих сложных ситуациях. Какие новые ресурсы доступны вам?',
        duration: 2
      }
    ],
    benefits: [
      'Разрешение внутренних конфликтов',
      'Интеграция всех аспектов личности',
      'Снижение внутреннего сопротивления изменениям',
      'Повышение мотивации к выздоровлению'
    ],
    prerequisites: ['basic_anchoring', 'parts_awareness']
  },

  {
    id: 'timeline_therapy_001',
    title: 'Работа с временной линией: исцеление прошлого',
    category: 'timeline',
    difficulty: 'expert',
    duration: 45,
    description: 'Глубокая работа с травматическими событиями прошлого, которые поддерживают зависимое поведение',
    instructions: [
      {
        id: 'step_1',
        title: 'Создание временной линии',
        instruction: 'Представьте свою жизнь как линию. Прошлое слева, настоящее в центре, будущее справа. Встаньте в настоящее время.',
        duration: 3
      },
      {
        id: 'step_2',
        title: 'Идентификация корневого события',
        instruction: 'Мысленно двигайтесь по линии в прошлое, пока не найдете первое событие, связанное с текущими проблемами. Это может быть не самое травматическое, а первое значимое.',
        duration: 5
      },
      {
        id: 'step_3',
        title: 'Диссоциированный просмотр',
        instruction: 'Поднимитесь над временной линией и посмотрите на то событие со стороны, как на фильм. Вы наблюдатель, не участник.',
        duration: 3
      },
      {
        id: 'step_4',
        title: 'Понимание позитивного намерения',
        instruction: 'Какое позитивное намерение имело то поведение или реакция? Как они пытались вас защитить или помочь выжить?',
        duration: 4
      },
      {
        id: 'step_5',
        title: 'Привнесение ресурсов',
        instruction: 'Какие ресурсы - знания, навыки, поддержка - нужны были тогда? Мысленно привнесите их в то время.',
        duration: 6
      },
      {
        id: 'step_6',
        title: 'Перепроживание с ресурсами',
        instruction: 'Теперь войдите в то событие, имея все необходимые ресурсы. Как по-другому вы могли бы отреагировать? Что изменилось?',
        duration: 8
      },
      {
        id: 'step_7',
        title: 'Интеграция изменений',
        instruction: 'Вернитесь в настоящее время, неся с собой новые понимания и ресурсы. Заметьте, как это влияет на ваше текущее состояние.',
        duration: 5
      },
      {
        id: 'step_8',
        title: 'Проекция в будущее',
        instruction: 'Посмотрите в будущее и увидьте, как эти изменения позитивно влияют на вашу дальнейшую жизнь и выздоровление.',
        duration: 6
      }
    ],
    benefits: [
      'Исцеление корневых причин зависимости',
      'Интеграция травматического опыта',
      'Освобождение от ограничивающих убеждений',
      'Создание нового отношения к прошлому'
    ],
    contraindications: [
      'Острое посттравматическое стрессовое расстройство',
      'Диссоциативные расстройства',
      'Активная суицидальная идеация'
    ],
    prerequisites: ['emotional_regulation', 'grounding_techniques', 'therapist_consultation']
  },

  {
    id: 'values_hierarchy_001',
    title: 'Работа с иерархией ценностей для устойчивой мотивации',
    category: 'values_work',
    difficulty: 'intermediate',
    duration: 30,
    description: 'Выявление и выстраивание личной системы ценностей, поддерживающей выздоровление',
    instructions: [
      {
        id: 'step_1',
        title: 'Мозговой штурм ценностей',
        instruction: 'Составьте список всего, что для вас важно в жизни: семья, здоровье, творчество, духовность, успех, свобода и т.д. Не ограничивайтесь.',
        duration: 5,
        interactiveElements: [
          { type: 'text_input', label: 'Добавить ценность', placeholder: 'Например: семья, здоровье...' }
        ]
      },
      {
        id: 'step_2',
        title: 'Первичная сортировка',
        instruction: 'Из списка выберите 10-12 наиболее важных ценностей. Остальные отложите - они тоже важны, но не критичны.',
        duration: 4
      },
      {
        id: 'step_3',
        title: 'Попарное сравнение',
        instruction: 'Сравните ценности попарно, задавая вопрос: "Если бы мне пришлось выбирать между X и Y, что важнее?" Не думайте долго, доверьтесь интуции.',
        duration: 8
      },
      {
        id: 'step_4',
        title: 'Создание иерархии',
        instruction: 'Выстройте ценности по важности от 1 до 10. Самая важная - та, ради которой вы готовы пожертвовать другими.',
        duration: 5
      },
      {
        id: 'step_5',
        title: 'Проверка конгруэнтности',
        instruction: 'Проверьте каждую ценность: "Как мое текущее поведение поддерживает или противоречит этой ценности?" Будьте честны.',
        duration: 6
      },
      {
        id: 'step_6',
        title: 'Создание плана действий',
        instruction: 'Для топ-3 ценностей определите конкретные действия, которые будут их поддерживать в контексте выздоровления.',
        duration: 2
      }
    ],
    benefits: [
      'Четкое понимание жизненных приоритетов',
      'Повышение внутренней мотивации',
      'Принятие решений на основе ценностей',
      'Снижение внутренних конфликтов'
    ]
  },

  {
    id: 'belief_change_001',
    title: 'Трансформация ограничивающих убеждений',
    category: 'beliefs_work', 
    difficulty: 'advanced',
    duration: 40,
    description: 'Выявление и изменение глубинных убеждений, поддерживающих зависимое поведение',
    instructions: [
      {
        id: 'step_1',
        title: 'Выявление ограничивающего убеждения',
        instruction: 'Определите убеждение о себе, которое мешает выздоровлению. Например: "Я не достоин любви", "Я слабый", "Я всегда буду зависимым".',
        duration: 4
      },
      {
        id: 'step_2',
        title: 'Исследование происхождения',
        instruction: 'Откуда пришло это убеждение? Кто его сказал? В каком возрасте? В какой ситуации? Просто исследуйте без суда.',
        duration: 5
      },
      {
        id: 'step_3',
        title: 'Оценка полезности',
        instruction: 'Было ли это убеждение когда-то полезным? Как оно пыталось вас защитить? Благодарите его за намерение помочь.',
        duration: 3
      },
      {
        id: 'step_4',
        title: 'Поиск контрпримеров',
        instruction: 'Найдите минимум 5 примеров из своей жизни, которые противоречат этому убеждению. Даже самые маленькие считаются.',
        duration: 6
      },
      {
        id: 'step_5',
        title: 'Создание нового убеждения',
        instruction: 'Сформулируйте новое, поддерживающее убеждение. Оно должно быть позитивным, личным и реалистичным.',
        duration: 4
      },
      {
        id: 'step_6',
        title: 'Поиск доказательств нового убеждения',
        instruction: 'Найдите доказательства того, что новое убеждение уже частично верно. Что поддерживает эту новую точку зрения?',
        duration: 5
      },
      {
        id: 'step_7',
        title: 'Субмодальная трансформация',
        instruction: 'Представьте старое убеждение как тусклую, далекую картинку. Новое - как яркую, близкую. Медленно замените первое вторым.',
        duration: 6
      },
      {
        id: 'step_8',
        title: 'Экологическая проверка',
        instruction: 'Проверьте: не противоречит ли новое убеждение другим важным частям вашей жизни? Если да, скорректируйте его.',
        duration: 3
      },
      {
        id: 'step_9',
        title: 'План подкрепления',
        instruction: 'Как вы будете подкреплять новое убеждение в повседневной жизни? Какие действия его поддержат?',
        duration: 4
      }
    ],
    benefits: [
      'Освобождение от саботирующих мыслей',
      'Повышение самооценки и самоэффективности',
      'Создание поддерживающей внутренней среды',
      'Устойчивые изменения на глубинном уровне'
    ]
  }
];

// Интерактивные элементы и вспомогательные интерфейсы
export interface VisualAid {
  type: 'image' | 'video' | 'animation' | 'diagram';
  url: string;
  description: string;
}

export interface AudioGuide {
  file: string;
  description: string;
  duration?: number;
}

export interface InteractiveElement {
  type: 'slider' | 'button' | 'text_input' | 'multiple_choice' | 'rating';
  label: string;
  min?: number;
  max?: number;
  options?: string[];
  placeholder?: string;
}

export interface Checkpoint {
  id: string;
  question: string;
  required: boolean;
  type?: 'yes_no' | 'scale' | 'text';
}

// Система прогрессии и мастерства
export interface ExerciseProgress {
  exerciseId: string;
  userId: string;
  completions: number;
  averageRating: number;
  masteryLevel: 'novice' | 'apprentice' | 'practitioner' | 'expert' | 'master';
  personalNotes: string[];
  adaptations: string[];
  lastCompleted: Date;
  streakCount: number;
}

export interface MasteryBadge {
  id: string;
  name: string;
  description: string;
  criteria: MasteryCriteria;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface MasteryCriteria {
  exerciseCompletions?: number;
  categoryMastery?: { category: string; level: string }[];
  streakRequirement?: number;
  ratingRequirement?: number;
  timeRequirement?: number; // дней практики
}

export class AdvancedNLPTrainingSystem {
  private userProgress: Map<string, Map<string, ExerciseProgress>> = new Map();
  
  // Персонализированный план тренировок
  generatePersonalizedTrainingPlan(userId: string, goals: string[], currentLevel: string): TrainingPlan {
    const userProgressData = this.userProgress.get(userId) || new Map();
    
    const plan: TrainingPlan = {
      id: `plan_${userId}_${Date.now()}`,
      userId,
      duration: 21, // дней
      dailySessions: [],
      goals,
      adaptiveRules: this.createAdaptiveRules(goals, currentLevel)
    };

    // Создаем ежедневные сессии
    for (let day = 1; day <= plan.duration; day++) {
      const session = this.generateDailySession(day, goals, currentLevel, userProgressData);
      plan.dailySessions.push(session);
    }

    return plan;
  }

  // Генерация ежедневной сессии
  private generateDailySession(
    day: number, 
    goals: string[], 
    level: string, 
    progress: Map<string, ExerciseProgress>
  ): DailySession {
    const exercises = this.selectExercisesForDay(day, goals, level, progress);
    
    return {
      day,
      theme: this.getDayTheme(day),
      exercises,
      estimatedDuration: exercises.reduce((sum, ex) => sum + ex.duration, 0),
      preparationTips: this.getPreparationTips(exercises),
      reflectionQuestions: this.getReflectionQuestions(exercises)
    };
  }

  private selectExercisesForDay(
    day: number, 
    goals: string[], 
    level: string, 
    progress: Map<string, ExerciseProgress>
  ): NLPExercise[] {
    const selectedExercises: NLPExercise[] = [];
    
    // Логика выбора упражнений на основе дня, целей и прогресса
    if (day <= 7) {
      // Первая неделя - основы
      selectedExercises.push(...this.getFoundationExercises(level));
    } else if (day <= 14) {
      // Вторая неделя - применение
      selectedExercises.push(...this.getApplicationExercises(goals, progress));
    } else {
      // Третья неделя - интеграция и мастерство
      selectedExercises.push(...this.getMasteryExercises(progress));
    }
    
    return selectedExercises.slice(0, 2); // Максимум 2 упражнения в день
  }

  private getFoundationExercises(level: string): NLPExercise[] {
    const difficulty = level === 'beginner' ? 'beginner' : 
                     level === 'intermediate' ? 'intermediate' : 'advanced';
    
    return advancedNLPExercises.filter(ex => 
      ex.difficulty === difficulty && 
      ['anchoring', 'reframing'].includes(ex.category)
    );
  }

  private getApplicationExercises(goals: string[], progress: Map<string, ExerciseProgress>): NLPExercise[] {
    // Выбираем упражнения на основе целей пользователя
    const goalToCategory = {
      'reduce_cravings': ['swish', 'anchoring'],
      'emotional_regulation': ['parts_integration', 'anchoring'],
      'trauma_healing': ['timeline', 'parts_integration'],
      'self_confidence': ['beliefs_work', 'values_work'],
      'motivation': ['values_work', 'beliefs_work']
    };

    const relevantCategories = goals.flatMap(goal => goalToCategory[goal as keyof typeof goalToCategory] || []);
    
    return advancedNLPExercises.filter(ex => 
      relevantCategories.includes(ex.category)
    );
  }

  private getMasteryExercises(progress: Map<string, ExerciseProgress>): NLPExercise[] {
    // Выбираем продвинутые упражнения для тех категорий, где пользователь показал прогресс
    const masteredCategories = Array.from(progress.values())
      .filter(p => p.masteryLevel === 'practitioner' || p.masteryLevel === 'expert')
      .map(p => advancedNLPExercises.find(ex => ex.id === p.exerciseId)?.category)
      .filter(Boolean) as string[];

    return advancedNLPExercises.filter(ex => 
      ex.difficulty === 'expert' && masteredCategories.includes(ex.category)
    );
  }

  private getDayTheme(day: number): string {
    const themes = [
      'Основы якорения', 'Эмоциональная регуляция', 'Работа с триггерами',
      'Рефрейминг мышления', 'Ресурсные состояния', 'Интеграция опыта',
      'Самоэффективность', 'Работа с частями', 'Временная перспектива',
      'Система ценностей', 'Трансформация убеждений', 'Мотивационные якоря',
      'Эмоциональная свобода', 'Интеграция изменений', 'Будущее видение',
      'Устойчивые паттерны', 'Глубинная интеграция', 'Мастерство техник',
      'Личная сила', 'Жизненная миссия', 'Трансформация завершена'
    ];
    
    return themes[day - 1] || 'Персональная практика';
  }

  // Адаптивные правила для корректировки плана
  private createAdaptiveRules(goals: string[], level: string): AdaptiveTrainingRule[] {
    return [
      {
        condition: 'low_completion_rate',
        action: 'reduce_difficulty',
        threshold: 0.6,
        description: 'Снизить сложность при низкой завершаемости'
      },
      {
        condition: 'high_stress_reported',
        action: 'add_calming_exercises',
        threshold: 7,
        description: 'Добавить успокаивающие упражнения при высоком стрессе'
      },
      {
        condition: 'rapid_progress',
        action: 'increase_challenge',
        threshold: 0.9,
        description: 'Увеличить сложность при быстром прогрессе'
      }
    ];
  }

  private getPreparationTips(exercises: NLPExercise[]): string[] {
    return [
      "Найдите тихое место для практики",
      "Отключите уведомления на 15-20 минут", 
      "Подготовьте удобное место для сидения",
      "Имейте под рукой стакан воды"
    ];
  }

  private getReflectionQuestions(exercises: NLPExercise[]): string[] {
    return [
      "Как изменилось ваше состояние после упражнений?",
      "Какое упражнение оказалось наиболее эффективным?",
      "Что было самым сложным в сегодняшней практике?",
      "Как вы можете применить полученный опыт в повседневной жизни?"
    ];
  }
}

// Интерфейсы для системы тренировок
export interface TrainingPlan {
  id: string;
  userId: string;
  duration: number;
  dailySessions: DailySession[];
  goals: string[];
  adaptiveRules: AdaptiveTrainingRule[];
}

export interface DailySession {
  day: number;
  theme: string;
  exercises: NLPExercise[];
  estimatedDuration: number;
  preparationTips: string[];
  reflectionQuestions: string[];
}

export interface AdaptiveTrainingRule {
  condition: string;
  action: string;
  threshold: number;
  description: string;
}

export default { advancedNLPExercises, AdvancedNLPTrainingSystem };
