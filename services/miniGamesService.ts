// Мини-игры для отвлечения от тяги и развития когнитивных навыков

export interface MiniGame {
  id: string;
  name: string;
  category: 'cognitive' | 'mindfulness' | 'breathing' | 'distraction' | 'social';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // в минутах
  description: string;
  instructions: string;
  benefits: string[];
  cognitiveSkills: CognitiveSkill[];
  adaptiveDifficulty: boolean;
}

export interface CognitiveSkill {
  name: string;
  description: string;
  improvementFactor: number; // насколько игра развивает этот навык (0-1)
}

export interface GameSession {
  gameId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  score: number;
  difficulty: number;
  completed: boolean;
  cravingLevelBefore: number;
  cravingLevelAfter?: number;
  moodBefore: number;
  moodAfter?: number;
}

// Коллекция мини-игр для отвлечения от тяги
export const addictionDistractiveGames: MiniGame[] = [
  {
    id: 'breath_bubble_pop',
    name: 'Лопание пузырей дыханием',
    category: 'breathing',
    difficulty: 'easy',
    duration: 5,
    description: 'Лопайте виртуальные пузыри, синхронизируя дыхание с игровым процессом',
    instructions: 'Делайте глубокий вдох для создания пузыря, медленный выдох для его лопания. Попадайте в ритм и набирайте очки за синхронность.',
    benefits: [
      'Регуляция дыхания',
      'Снижение тревожности', 
      'Отвлечение от навязчивых мыслей',
      'Улучшение концентрации'
    ],
    cognitiveSkills: [
      { name: 'Концентрация внимания', description: 'Способность фокусироваться на одной задаче', improvementFactor: 0.8 },
      { name: 'Эмоциональная регуляция', description: 'Управление эмоциональным состоянием', improvementFactor: 0.9 },
      { name: 'Дыхательный контроль', description: 'Осознанное управление дыханием', improvementFactor: 0.95 }
    ],
    adaptiveDifficulty: true
  },

  {
    id: 'color_sequence_memory',
    name: 'Последовательность цветов',
    category: 'cognitive',
    difficulty: 'medium',
    duration: 10,
    description: 'Запоминайте и воспроизводите последовательности цветов, развивая рабочую память',
    instructions: 'Запомните последовательность цветных вспышек и повторите их в том же порядке. С каждым уровнем последовательность становится длиннее.',
    benefits: [
      'Улучшение рабочей памяти',
      'Развитие концентрации',
      'Тренировка исполнительных функций',
      'Отвлечение от тяги'
    ],
    cognitiveSkills: [
      { name: 'Рабочая память', description: 'Временное хранение и обработка информации', improvementFactor: 0.9 },
      { name: 'Последовательное мышление', description: 'Способность следовать логическим цепочкам', improvementFactor: 0.7 },
      { name: 'Визуальная обработка', description: 'Обработка зрительной информации', improvementFactor: 0.6 }
    ],
    adaptiveDifficulty: true
  },

  {
    id: 'mindful_maze',
    name: 'Осознанный лабиринт',
    category: 'mindfulness',
    difficulty: 'easy',
    duration: 8,
    description: 'Проходите лабиринт, сосредоточившись на настоящем моменте и телесных ощущениях',
    instructions: 'Медленно ведите персонажа через лабиринт, концентрируясь на каждом движении. Замечайте цвета, формы, ощущения. Нет спешки - важен процесс, не результат.',
    benefits: [
      'Развитие осознанности',
      'Снижение импульсивности',
      'Практика присутствия',
      'Успокоение ума'
    ],
    cognitiveSkills: [
      { name: 'Осознанность', description: 'Способность присутствовать в моменте', improvementFactor: 0.95 },
      { name: 'Пространственная ориентация', description: 'Понимание пространственных отношений', improvementFactor: 0.5 },
      { name: 'Терпеливость', description: 'Способность не спешить и быть терпеливым', improvementFactor: 0.8 }
    ],
    adaptiveDifficulty: false
  },

  {
    id: 'emotion_regulation_garden',
    name: 'Сад эмоций',
    category: 'mindfulness',
    difficulty: 'medium',
    duration: 12,
    description: 'Выращивайте виртуальный сад, отражающий ваши эмоции и помогающий их регулировать',
    instructions: 'Выберите растения, соответствующие вашим текущим эмоциям. Поливайте их принятием, подкармливайте пониманием. Наблюдайте, как меняется сад по мере изменения вашего состояния.',
    benefits: [
      'Эмоциональная грамотность',
      'Принятие эмоций',
      'Развитие терпения',
      'Визуализация роста'
    ],
    cognitiveSkills: [
      { name: 'Эмоциональная осведомленность', description: 'Понимание своих эмоций', improvementFactor: 0.9 },
      { name: 'Символическое мышление', description: 'Способность работать с символами и метафорами', improvementFactor: 0.7 },
      { name: 'Долгосрочное планирование', description: 'Способность думать о будущем', improvementFactor: 0.6 }
    ],
    adaptiveDifficulty: false
  },

  {
    id: 'rapid_decision_challenge',
    name: 'Вызов быстрых решений',
    category: 'cognitive',
    difficulty: 'hard',
    duration: 7,
    description: 'Принимайте быстрые решения в позитивном контексте, тренируя здоровые паттерны выбора',
    instructions: 'Вам будут представлены различные ситуации с несколькими вариантами действий. Выбирайте наиболее здоровый и конструктивный вариант как можно быстрее.',
    benefits: [
      'Тренировка принятия решений',
      'Укрепление здоровых паттернов',
      'Улучшение реакции на стресс',
      'Развитие исполнительных функций'
    ],
    cognitiveSkills: [
      { name: 'Принятие решений', description: 'Способность быстро принимать правильные решения', improvementFactor: 0.8 },
      { name: 'Ингибиторный контроль', description: 'Способность подавлять импульсы', improvementFactor: 0.9 },
      { name: 'Когнитивная гибкость', description: 'Способность переключаться между задачами', improvementFactor: 0.7 }
    ],
    adaptiveDifficulty: true
  },

  {
    id: 'gratitude_photo_hunt',
    name: 'Охота за благодарностью',
    category: 'mindfulness',
    difficulty: 'easy',
    duration: 15,
    description: 'Найдите и "сфотографируйте" вещи вокруг вас, за которые вы благодарны',
    instructions: 'Осмотритесь вокруг и найдите 10 вещей, за которые вы можете быть благодарны прямо сейчас. Мысленно "сфотографируйте" их и опишите, почему они важны для вас.',
    benefits: [
      'Развитие благодарности',
      'Переключение фокуса внимания',
      'Улучшение настроения',
      'Практика осознанности'
    ],
    cognitiveSkills: [
      { name: 'Позитивное мышление', description: 'Способность замечать хорошее', improvementFactor: 0.9 },
      { name: 'Внимательность к деталям', description: 'Способность замечать детали окружения', improvementFactor: 0.6 },
      { name: 'Рефлексия', description: 'Способность к самоанализу', improvementFactor: 0.7 }
    ],
    adaptiveDifficulty: false
  },

  {
    id: 'stress_ball_squeeze',
    name: 'Виртуальный антистресс',
    category: 'distraction',
    difficulty: 'easy',
    duration: 5,
    description: 'Интерактивное сжимание виртуального антистрессового мячика с биофидбэком',
    instructions: 'Нажимайте на экран, имитируя сжимание антистрессового мячика. Синхронизируйте нажатия с дыханием. Мячик будет реагировать на силу и ритм нажатий.',
    benefits: [
      'Физическое напряжение и расслабление',
      'Тактильная стимуляция',
      'Быстрое снятие стресса',
      'Простое отвлечение'
    ],
    cognitiveSkills: [
      { name: 'Моторная координация', description: 'Координация движений', improvementFactor: 0.4 },
      { name: 'Стресс-менеджмент', description: 'Управление стрессом', improvementFactor: 0.8 },
      { name: 'Тактильная обработка', description: 'Обработка тактильных ощущений', improvementFactor: 0.6 }
    ],
    adaptiveDifficulty: false
  },

  {
    id: 'pattern_breaking_puzzle',
    name: 'Головоломка разрыва паттернов',
    category: 'cognitive',
    difficulty: 'hard',
    duration: 10,
    description: 'Решайте головоломки, требующие разрыва привычных паттернов мышления',
    instructions: 'Перед вами последовательности фигур, цифр или символов с нарушенными паттернами. Найдите правило и определите, что должно быть на месте пропуска.',
    benefits: [
      'Развитие креативности',
      'Тренировка гибкости мышления',
      'Разрыв ментальных паттернов',
      'Улучшение проблемного мышления'
    ],
    cognitiveSkills: [
      { name: 'Паттерн-распознавание', description: 'Способность видеть закономерности', improvementFactor: 0.8 },
      { name: 'Креативное мышление', description: 'Способность мыслить нестандартно', improvementFactor: 0.9 },
      { name: 'Логическое мышление', description: 'Способность к логическому анализу', improvementFactor: 0.7 }
    ],
    adaptiveDifficulty: true
  },

  {
    id: 'zen_garden_builder',
    name: 'Дзен-сад строитель',
    category: 'mindfulness',
    difficulty: 'easy',
    duration: 15,
    description: 'Создавайте успокаивающий дзен-сад, размещая камни, песок и растения для медитации',
    instructions: 'Медленно и осознанно размещайте элементы сада. Сосредоточьтесь на каждом движении, цвете и форме. Нет правильного или неправильного способа - следуйте своей интуиции.',
    benefits: [
      'Глубокая релаксация',
      'Развитие креативности',
      'Медитативное состояние',
      'Снижение тревожности'
    ],
    cognitiveSkills: [
      { name: 'Творческое мышление', description: 'Способность к творческому самовыражению', improvementFactor: 0.8 },
      { name: 'Медитативная концентрация', description: 'Глубокая медитативная сосредоточенность', improvementFactor: 0.9 },
      { name: 'Эстетическое восприятие', description: 'Понимание красоты и гармонии', improvementFactor: 0.7 }
    ],
    adaptiveDifficulty: false
  },

  {
    id: 'neural_pathway_puzzle',
    name: 'Головоломка нейронных путей',
    category: 'cognitive',
    difficulty: 'hard',
    duration: 12,
    description: 'Соединяйте нейроны для создания здоровых нейронных путей, избегая старых зависимых связей',
    instructions: 'Проводите новые связи между нейронами, минуя старые "алкогольные" пути. Создавайте альтернативные маршруты для сигналов удовольствия и расслабления.',
    benefits: [
      'Визуализация нейропластичности',
      'Понимание работы мозга',
      'Мотивация к изменениям',
      'Развитие стратегического мышления'
    ],
    cognitiveSkills: [
      { name: 'Системное мышление', description: 'Понимание сложных систем', improvementFactor: 0.8 },
      { name: 'Стратегическое планирование', description: 'Долгосрочное планирование решений', improvementFactor: 0.9 },
      { name: 'Пространственное мышление', description: 'Работа с пространственными структурами', improvementFactor: 0.7 }
    ],
    adaptiveDifficulty: true
  },

  {
    id: 'craving_wave_surfing',
    name: 'Серфинг волн тяги',
    category: 'mindfulness',
    difficulty: 'medium',
    duration: 8,
    description: 'Интерактивное упражнение на принятие и наблюдение за волнами тяги без сопротивления',
    instructions: 'Когда появляется волна тяги на экране, не пытайтесь её остановить. Наблюдайте, как она поднимается, достигает пика и естественно спадает. Дышите в ритм с волной.',
    benefits: [
      'Принятие неприятных ощущений',
      'Развитие терпимости к дискомфорту',
      'Понимание временности тяги',
      'Навыки осознанности'
    ],
    cognitiveSkills: [
      { name: 'Толерантность к дистрессу', description: 'Способность переносить дискомфорт', improvementFactor: 0.95 },
      { name: 'Эмоциональная регуляция', description: 'Управление эмоциональными реакциями', improvementFactor: 0.9 },
      { name: 'Осознанное наблюдение', description: 'Наблюдение без вмешательства', improvementFactor: 0.8 }
    ],
    adaptiveDifficulty: false
  },

  {
    id: 'habit_architect',
    name: 'Архитектор привычек',
    category: 'cognitive',
    difficulty: 'medium',
    duration: 20,
    description: 'Проектируйте и строите новые здоровые привычки, разрушая архитектуру старых зависимых паттернов',
    instructions: 'Разберите старые привычки по кирпичикам и используйте эти элементы для строительства новых, здоровых паттернов поведения. Каждый элемент имеет свою функцию.',
    benefits: [
      'Понимание механизмов привычек',
      'Навыки формирования новых привычек',
      'Креативный подход к изменениям',
      'Долгосрочное планирование'
    ],
    cognitiveSkills: [
      { name: 'Поведенческое планирование', description: 'Планирование изменений поведения', improvementFactor: 0.9 },
      { name: 'Анализ паттернов', description: 'Распознавание поведенческих паттернов', improvementFactor: 0.8 },
      { name: 'Конструктивное мышление', description: 'Способность к построению новых решений', improvementFactor: 0.7 }
    ],
    adaptiveDifficulty: true
  },

  {
    id: 'energy_flow_balance',
    name: 'Баланс потоков энергии',
    category: 'mindfulness',
    difficulty: 'easy',
    duration: 10,
    description: 'Балансируйте энергетические потоки в виртуальном теле, восстанавливая гармонию и равновесие',
    instructions: 'Перенаправляйте энергетические потоки от центров тяги к центрам здоровья и радости. Наблюдайте, как изменяется цвет и интенсивность энергии.',
    benefits: [
      'Энергетическое восстановление',
      'Визуализация внутренних процессов',
      'Развитие интуиции',
      'Гармонизация состояний'
    ],
    cognitiveSkills: [
      { name: 'Интуитивное мышление', description: 'Развитие интуиции и чувственного восприятия', improvementFactor: 0.8 },
      { name: 'Визуально-пространственное мышление', description: 'Работа с ментальными образами', improvementFactor: 0.7 },
      { name: 'Саморегуляция', description: 'Способность к самонастройке и балансу', improvementFactor: 0.9 }
    ],
    adaptiveDifficulty: false
  },

  {
    id: 'decision_tree_navigator',
    name: 'Навигатор дерева решений',
    category: 'cognitive',
    difficulty: 'hard',
    duration: 15,
    description: 'Навигируйте через сложное дерево решений, выбирая пути, ведущие к здоровым исходам',
    instructions: 'На каждой развилке выбирайте решение, которое приближает к цели трезвости. Анализируйте долгосрочные последствия каждого выбора.',
    benefits: [
      'Улучшение принятия решений',
      'Анализ последствий',
      'Стратегическое мышление',
      'Предвидение результатов'
    ],
    cognitiveSkills: [
      { name: 'Принятие решений', description: 'Качество и скорость принятия решений', improvementFactor: 0.95 },
      { name: 'Прогностическое мышление', description: 'Способность предвидеть последствия', improvementFactor: 0.8 },
      { name: 'Аналитическое мышление', description: 'Анализ сложной информации', improvementFactor: 0.9 }
    ],
    adaptiveDifficulty: true
  },

  {
    id: 'virtual_support_circle',
    name: 'Виртуальный круг поддержки',
    category: 'social',
    difficulty: 'easy',
    duration: 12,
    description: 'Взаимодействуйте с виртуальными персонажами, которые предлагают поддержку и делятся опытом выздоровления',
    instructions: 'Слушайте истории выздоровления, отвечайте на вопросы персонажей о ваших чувствах, получайте поддержку в сложных моментах.',
    benefits: [
      'Чувство поддержки и понимания',
      'Изучение опыта других',
      'Развитие эмпатии',
      'Снижение изоляции'
    ],
    cognitiveSkills: [
      { name: 'Социальная когниция', description: 'Понимание социальных ситуаций', improvementFactor: 0.7 },
      { name: 'Эмпатия', description: 'Способность к сопереживанию', improvementFactor: 0.8 },
      { name: 'Коммуникативные навыки', description: 'Навыки общения и самовыражения', improvementFactor: 0.6 }
    ],
    adaptiveDifficulty: false
  },

  {
    id: 'trigger_transformation_lab',
    name: 'Лаборатория трансформации триггеров',
    category: 'cognitive',
    difficulty: 'hard',
    duration: 18,
    description: 'Экспериментируйте с различными способами трансформации личных триггеров в позитивные стимулы',
    instructions: 'Загружайте свои триггеры в виртуальную лабораторию и экспериментируйте с различными техниками их преобразования в мотивирующие стимулы для здорового поведения.',
    benefits: [
      'Переосмысление триггеров',
      'Развитие когнитивной гибкости',
      'Создание позитивных ассоциаций',
      'Научный подход к изменениям'
    ],
    cognitiveSkills: [
      { name: 'Когнитивная реструктуризация', description: 'Изменение мыслительных паттернов', improvementFactor: 0.9 },
      { name: 'Экспериментальное мышление', description: 'Способность к экспериментированию с решениями', improvementFactor: 0.8 },
      { name: 'Ассоциативное мышление', description: 'Создание новых ментальных связей', improvementFactor: 0.85 }
    ],
    adaptiveDifficulty: true
  },

  {
    id: 'mindful_walking_sim',
    name: 'Симулятор осознанной ходьбы',
    category: 'mindfulness',
    difficulty: 'easy',
    duration: 10,
    description: 'Виртуальная прогулка по красивым пейзажам с фокусом на каждом шаге и дыхании',
    instructions: 'Медленно ведите персонажа по тропинкам, синхронизируя шаги с дыханием. Обращайте внимание на детали окружения, звуки природы, ощущения.',
    benefits: [
      'Практика осознанности в движении',
      'Связь с природой',
      'Успокоение нервной системы',
      'Развитие присутствия'
    ],
    cognitiveSkills: [
      { name: 'Кинестетическая осознанность', description: 'Осознание телесных ощущений в движении', improvementFactor: 0.8 },
      { name: 'Сенсорная внимательность', description: 'Внимание к сенсорным деталям', improvementFactor: 0.9 },
      { name: 'Ритмическая координация', description: 'Координация движения и дыхания', improvementFactor: 0.7 }
    ],
    adaptiveDifficulty: false
  },

  {
    id: 'memory_palace_recovery',
    name: 'Дворец памяти восстановления',
    category: 'cognitive',
    difficulty: 'medium',
    duration: 25,
    description: 'Создайте виртуальный дворец памяти, наполненный позитивными воспоминаниями и мотивирующими образами трезвости',
    instructions: 'Постройте комнаты в своем дворце памяти, каждая из которых содержит мощные позитивные воспоминания, цели и мотивацию для поддержания трезвости.',
    benefits: [
      'Укрепление позитивных воспоминаний',
      'Создание ментальных ресурсов',
      'Улучшение памяти',
      'Визуализация целей'
    ],
    cognitiveSkills: [
      { name: 'Пространственная память', description: 'Создание и навигация ментальных пространств', improvementFactor: 0.8 },
      { name: 'Ассоциативная память', description: 'Связывание образов с воспоминаниями', improvementFactor: 0.9 },
      { name: 'Визуальное мышление', description: 'Создание и манипуляция ментальными образами', improvementFactor: 0.85 }
    ],
    adaptiveDifficulty: true
  }
];

export class MiniGameEngine {
  private sessions: Map<string, GameSession[]> = new Map();
  private userStats: Map<string, UserGameStats> = new Map();

  // Запуск игры
  async startGame(userId: string, gameId: string, cravingLevel: number, mood: number): Promise<GameSession> {
    const game = addictionDistractiveGames.find(g => g.id === gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    const session: GameSession = {
      gameId,
      userId,
      startTime: new Date(),
      score: 0,
      difficulty: this.calculateInitialDifficulty(userId, gameId),
      completed: false,
      cravingLevelBefore: cravingLevel,
      moodBefore: mood
    };

    // Добавляем сессию в историю
    const userSessions = this.sessions.get(userId) || [];
    userSessions.push(session);
    this.sessions.set(userId, userSessions);

    return session;
  }

  // Завершение игры
  async completeGame(
    userId: string, 
    sessionId: string, 
    finalScore: number, 
    cravingLevelAfter: number, 
    moodAfter: number
  ): Promise<void> {
    const sessions = this.sessions.get(userId);
    if (!sessions) return;

    const session = sessions.find(s => s.startTime.toISOString() === sessionId);
    if (!session) return;

    session.endTime = new Date();
    session.score = finalScore;
    session.completed = true;
    session.cravingLevelAfter = cravingLevelAfter;
    session.moodAfter = moodAfter;

    // Обновляем статистику пользователя
    await this.updateUserStats(userId, session);

    // Адаптируем сложность для следующий раз
    if (addictionDistractiveGames.find(g => g.id === session.gameId)?.adaptiveDifficulty) {
      await this.adaptDifficulty(userId, session);
    }
  }

  // Рекомендация игры на основе текущего состояния
  recommendGame(userId: string, cravingLevel: number, mood: number, availableTime: number): MiniGame | null {
    const userStats = this.userStats.get(userId);
    
    // Фильтруем игры по доступному времени
    let suitableGames = addictionDistractiveGames.filter(game => game.duration <= availableTime);
    
    // Выбираем категорию на основе состояния
    let preferredCategories: string[] = [];
    
    if (cravingLevel >= 7) {
      // Высокая тяга - нужны отвлекающие игры
      preferredCategories = ['distraction', 'breathing', 'cognitive'];
    } else if (mood <= 3) {
      // Плохое настроение - mindfulness игры
      preferredCategories = ['mindfulness', 'breathing'];
    } else if (cravingLevel >= 4) {
      // Умеренная тяга - когнитивные игры
      preferredCategories = ['cognitive', 'mindfulness'];
    } else {
      // Стабильное состояние - любые игры для развития
      preferredCategories = ['cognitive', 'mindfulness', 'social'];
    }

    // Фильтруем по предпочтительным категориям
    suitableGames = suitableGames.filter(game => 
      preferredCategories.includes(game.category)
    );

    if (suitableGames.length === 0) {
      return addictionDistractiveGames[0]; // Возвращаем самую простую игру
    }

    // Выбираем игру с учетом предыдущего опыта
    if (userStats) {
      // Отдаем предпочтение играм, которые помогали раньше
      const effectiveGames = suitableGames.filter(game => {
        const gameStats = userStats.gameStats.get(game.id);
        return gameStats && gameStats.averageCravingReduction > 1.5;
      });
      
      if (effectiveGames.length > 0) {
        suitableGames = effectiveGames;
      }
    }

    // Возвращаем случайную игру из подходящих
    return suitableGames[Math.floor(Math.random() * suitableGames.length)];
  }

  // Генерация челленджей и достижений
  generateWeeklyChallenge(userId: string): WeeklyChallenge {
    const userStats = this.userStats.get(userId);
    const currentWeek = this.getCurrentWeekNumber();
    
    // Базовые челленджи
    const challenges: WeeklyChallenge[] = [
      {
        id: `breath_master_${currentWeek}`,
        title: 'Мастер дыхания',
        description: 'Сыграйте в дыхательные игры 5 раз на этой неделе',
        category: 'breathing',
        target: 5,
        current: 0,
        reward: 'Значок "Дыхательный мастер"',
        difficulty: 'easy'
      },
      {
        id: `cognitive_warrior_${currentWeek}`,
        title: 'Когнитивный воин',
        description: 'Наберите суммарно 1000 очков в когнитивных играх',
        category: 'cognitive',
        target: 1000,
        current: 0,
        reward: 'Значок "Острый ум"',
        difficulty: 'medium'
      },
      {
        id: `mindful_explorer_${currentWeek}`,
        title: 'Исследователь осознанности',
        description: 'Завершите все игры категории осознанности',
        category: 'mindfulness',
        target: addictionDistractiveGames.filter(g => g.category === 'mindfulness').length,
        current: 0,
        reward: 'Значок "Мастер осознанности"',
        difficulty: 'hard'
      }
    ];

    // Персонализируем на основе статистики пользователя
    if (userStats) {
      const favoriteCategory = this.getFavoriteCategory(userStats);
      const personalizedChallenge: WeeklyChallenge = {
        id: `personal_${currentWeek}`,
        title: `Персональный вызов: ${favoriteCategory}`,
        description: `Улучшите свой рекорд в категории ${favoriteCategory}`,
        category: favoriteCategory,
        target: Math.ceil(userStats.bestScores.get(favoriteCategory) || 100 * 1.2),
        current: 0,
        reward: 'Персональный значок достижения',
        difficulty: 'medium'
      };
      challenges.push(personalizedChallenge);
    }

    return challenges[Math.floor(Math.random() * challenges.length)];
  }

  // Аналитика эффективности игр
  analyzeGameEffectiveness(userId: string): GameAnalytics {
    const sessions = this.sessions.get(userId) || [];
    const completedSessions = sessions.filter(s => s.completed);

    const analytics: GameAnalytics = {
      totalSessions: completedSessions.length,
      averageCravingReduction: 0,
      averageMoodImprovement: 0,
      mostEffectiveGame: '',
      categoryEffectiveness: new Map(),
      timePatterns: this.analyzeTimePatterns(completedSessions),
      progressTrend: this.calculateProgressTrend(completedSessions)
    };

    if (completedSessions.length === 0) return analytics;

    // Вычисляем средние значения
    const cravingReductions = completedSessions
      .filter(s => s.cravingLevelAfter !== undefined)
      .map(s => s.cravingLevelBefore - s.cravingLevelAfter!);
    
    const moodImprovements = completedSessions
      .filter(s => s.moodAfter !== undefined)
      .map(s => s.moodAfter! - s.moodBefore);

    analytics.averageCravingReduction = cravingReductions.reduce((a, b) => a + b, 0) / cravingReductions.length;
    analytics.averageMoodImprovement = moodImprovements.reduce((a, b) => a + b, 0) / moodImprovements.length;

    // Находим самую эффективную игру
    const gameEffectiveness = new Map<string, number>();
    
    addictionDistractiveGames.forEach(game => {
      const gameSessions = completedSessions.filter(s => s.gameId === game.id);
      if (gameSessions.length > 0) {
        const effectiveness = gameSessions.reduce((sum, session) => {
          const cravingReduction = (session.cravingLevelAfter !== undefined) ? 
            session.cravingLevelBefore - session.cravingLevelAfter : 0;
          const moodImprovement = (session.moodAfter !== undefined) ? 
            session.moodAfter - session.moodBefore : 0;
          return sum + cravingReduction + moodImprovement;
        }, 0) / gameSessions.length;
        
        gameEffectiveness.set(game.id, effectiveness);
      }
    });

    const mostEffective = Array.from(gameEffectiveness.entries())
      .sort((a, b) => b[1] - a[1])[0];
    
    analytics.mostEffectiveGame = mostEffective ? mostEffective[0] : '';

    return analytics;
  }

  private calculateInitialDifficulty(userId: string, gameId: string): number {
    const userStats = this.userStats.get(userId);
    if (!userStats) return 1; // Начальная сложность

    const gameStats = userStats.gameStats.get(gameId);
    if (!gameStats) return 1;

    // Адаптируем сложность на основе предыдущих результатов
    if (gameStats.averageScore > gameStats.targetScore * 0.8) {
      return Math.min(gameStats.currentDifficulty + 0.2, 3); // Увеличиваем сложность
    } else if (gameStats.averageScore < gameStats.targetScore * 0.4) {
      return Math.max(gameStats.currentDifficulty - 0.2, 0.5); // Уменьшаем сложность
    }

    return gameStats.currentDifficulty;
  }

  private async updateUserStats(userId: string, session: GameSession): Promise<void> {
    let userStats = this.userStats.get(userId);
    
    if (!userStats) {
      userStats = {
        userId,
        totalPlayTime: 0,
        gamesCompleted: 0,
        averageScore: 0,
        gameStats: new Map(),
        bestScores: new Map(),
        achievements: [],
        currentStreak: 0,
        longestStreak: 0,
        lastPlayDate: new Date()
      };
      this.userStats.set(userId, userStats);
    }

    // Обновляем общую статистику
    userStats.gamesCompleted++;
    userStats.totalPlayTime += (session.endTime!.getTime() - session.startTime.getTime()) / 1000 / 60;
    userStats.lastPlayDate = new Date();

    // Обновляем статистику по конкретной игре
    const gameId = session.gameId;
    let gameStats = userStats.gameStats.get(gameId);
    
    if (!gameStats) {
      gameStats = {
        gameId,
        timesPlayed: 0,
        averageScore: 0,
        bestScore: 0,
        currentDifficulty: 1,
        targetScore: 100,
        averageCravingReduction: 0,
        averageMoodImprovement: 0
      };
      userStats.gameStats.set(gameId, gameStats);
    }

    // Обновляем игровую статистику
    gameStats.timesPlayed++;
    gameStats.averageScore = (gameStats.averageScore * (gameStats.timesPlayed - 1) + session.score) / gameStats.timesPlayed;
    gameStats.bestScore = Math.max(gameStats.bestScore, session.score);

    if (session.cravingLevelAfter !== undefined) {
      const cravingReduction = session.cravingLevelBefore - session.cravingLevelAfter;
      gameStats.averageCravingReduction = (gameStats.averageCravingReduction * (gameStats.timesPlayed - 1) + cravingReduction) / gameStats.timesPlayed;
    }

    if (session.moodAfter !== undefined) {
      const moodImprovement = session.moodAfter - session.moodBefore;
      gameStats.averageMoodImprovement = (gameStats.averageMoodImprovement * (gameStats.timesPlayed - 1) + moodImprovement) / gameStats.timesPlayed;
    }

    // Обновляем лучшие результаты по категориям
    const game = addictionDistractiveGames.find(g => g.id === gameId);
    if (game) {
      const currentBest = userStats.bestScores.get(game.category) || 0;
      userStats.bestScores.set(game.category, Math.max(currentBest, session.score));
    }
  }

  private async adaptDifficulty(userId: string, session: GameSession): Promise<void> {
    const userStats = this.userStats.get(userId);
    if (!userStats) return;

    const gameStats = userStats.gameStats.get(session.gameId);
    if (!gameStats) return;

    // Адаптируем сложность на основе производительности
    const performanceRatio = session.score / gameStats.targetScore;
    
    if (performanceRatio > 0.9) {
      // Отличный результат - увеличиваем сложность
      gameStats.currentDifficulty = Math.min(gameStats.currentDifficulty + 0.1, 3);
      gameStats.targetScore = Math.ceil(gameStats.targetScore * 1.1);
    } else if (performanceRatio < 0.4) {
      // Слабый результат - уменьшаем сложность
      gameStats.currentDifficulty = Math.max(gameStats.currentDifficulty - 0.1, 0.5);
      gameStats.targetScore = Math.ceil(gameStats.targetScore * 0.9);
    }
  }

  private getCurrentWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  }

  private getFavoriteCategory(userStats: UserGameStats): string {
    let maxPlayTime = 0;
    let favoriteCategory = 'cognitive';

    userStats.gameStats.forEach((gameStats, gameId) => {
      const game = addictionDistractiveGames.find(g => g.id === gameId);
      if (game && gameStats.timesPlayed > maxPlayTime) {
        maxPlayTime = gameStats.timesPlayed;
        favoriteCategory = game.category;
      }
    });

    return favoriteCategory;
  }

  private analyzeTimePatterns(sessions: GameSession[]): TimePattern[] {
    const hourCounts = new Array(24).fill(0);
    
    sessions.forEach(session => {
      const hour = session.startTime.getHours();
      hourCounts[hour]++;
    });

    const patterns: TimePattern[] = [];
    
    // Находим пиковые часы
    const maxCount = Math.max(...hourCounts);
    hourCounts.forEach((count, hour) => {
      if (count > maxCount * 0.7) { // Часы с активностью выше 70% от пика
        patterns.push({
          timeRange: `${hour}:00-${hour + 1}:00`,
          frequency: count,
          effectiveness: this.calculateHourEffectiveness(sessions, hour)
        });
      }
    });

    return patterns;
  }

  private calculateHourEffectiveness(sessions: GameSession[], hour: number): number {
    const hourSessions = sessions.filter(s => s.startTime.getHours() === hour);
    if (hourSessions.length === 0) return 0;

    return hourSessions.reduce((sum, session) => {
      const cravingReduction = (session.cravingLevelAfter !== undefined) ? 
        session.cravingLevelBefore - session.cravingLevelAfter : 0;
      const moodImprovement = (session.moodAfter !== undefined) ? 
        session.moodAfter - session.moodBefore : 0;
      return sum + cravingReduction + moodImprovement;
    }, 0) / hourSessions.length;
  }

  private calculateProgressTrend(sessions: GameSession[]): 'improving' | 'stable' | 'declining' {
    if (sessions.length < 5) return 'stable';

    const recent = sessions.slice(-5);
    const older = sessions.slice(-10, -5);

    const recentAvgEffectiveness = this.getAverageEffectiveness(recent);
    const olderAvgEffectiveness = this.getAverageEffectiveness(older);

    if (recentAvgEffectiveness > olderAvgEffectiveness * 1.1) {
      return 'improving';
    } else if (recentAvgEffectiveness < olderAvgEffectiveness * 0.9) {
      return 'declining';  
    } else {
      return 'stable';
    }
  }

  private getAverageEffectiveness(sessions: GameSession[]): number {
    if (sessions.length === 0) return 0;
    
    return sessions.reduce((sum, session) => {
      const cravingReduction = (session.cravingLevelAfter !== undefined) ? 
        session.cravingLevelBefore - session.cravingLevelAfter : 0;
      const moodImprovement = (session.moodAfter !== undefined) ? 
        session.moodAfter - session.moodBefore : 0;
      return sum + cravingReduction + moodImprovement;
    }, 0) / sessions.length;
  }
}

// Интерфейсы
export interface UserGameStats {
  userId: string;
  totalPlayTime: number; // в минутах
  gamesCompleted: number;
  averageScore: number;
  gameStats: Map<string, IndividualGameStats>;
  bestScores: Map<string, number>; // по категориям
  achievements: string[];
  currentStreak: number;
  longestStreak: number;
  lastPlayDate: Date;
}

export interface IndividualGameStats {
  gameId: string;
  timesPlayed: number;
  averageScore: number;
  bestScore: number;
  currentDifficulty: number;
  targetScore: number;
  averageCravingReduction: number;
  averageMoodImprovement: number;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  target: number;
  current: number;
  reward: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GameAnalytics {
  totalSessions: number;
  averageCravingReduction: number;
  averageMoodImprovement: number;
  mostEffectiveGame: string;
  categoryEffectiveness: Map<string, number>;
  timePatterns: TimePattern[];
  progressTrend: 'improving' | 'stable' | 'declining';
}

export interface TimePattern {
  timeRange: string;
  frequency: number;
  effectiveness: number;
}

export default { addictionDistractiveGames, MiniGameEngine };