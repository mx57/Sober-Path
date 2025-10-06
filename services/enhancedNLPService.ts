// Расширенные НЛП техники и упражнения

export interface NLPTechnique {
  id: string;
  name: string;
  category: 'anchoring' | 'reframing' | 'timeline' | 'submodalities' | 'swish' | 'phobia' | 'belief_change' | 'parts_integration' | 'meta_program' | 'perceptual_positions';
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // в минутах
  steps: NLPStep[];
  benefits: string[];
  precautions?: string[];
  contraindications?: string[];
  energyLevel?: 'low' | 'medium' | 'high'; // требуемый уровень энергии
  emotionalSafety?: 'safe' | 'moderate' | 'intense'; // эмоциональная безопасность
}

export interface NLPStep {
  id: string;
  title: string;
  instruction: string;
  duration?: number;
  type: 'preparation' | 'visualization' | 'physical' | 'mental' | 'integration' | 'breathing' | 'movement';
  tips?: string[];
  warnings?: string[];
}

export const advancedNLPTechniques: NLPTechnique[] = [
  {
    id: 'resource-anchoring',
    name: 'Ресурсное якорение',
    category: 'anchoring',
    description: 'Создание физического якоря для доступа к ресурсным состояниям силы и уверенности',
    difficulty: 'intermediate',
    duration: 20,
    steps: [
      {
        id: 'prep1',
        title: 'Подготовка',
        instruction: 'Сядьте удобно, закройте глаза и сделайте несколько глубоких вдохов',
        duration: 2,
        type: 'preparation'
      },
      {
        id: 'recall1',
        title: 'Воспоминание ресурса',
        instruction: 'Вспомните момент, когда вы чувствовали себя невероятно сильным и уверенным',
        duration: 3,
        type: 'mental',
        tips: ['Выберите конкретный момент', 'Почувствуйте все детали ситуации']
      },
      {
        id: 'amplify1',
        title: 'Усиление переживания',
        instruction: 'Сделайте образ ярче, звуки четче, ощущения сильнее',
        duration: 3,
        type: 'visualization',
        tips: ['Увеличьте яркость образа', 'Добавьте цвета и детали']
      },
      {
        id: 'anchor1',
        title: 'Установка якоря',
        instruction: 'На пике переживания сожмите большой и указательный пальцы правой руки',
        duration: 5,
        type: 'physical',
        tips: ['Держите якорь 10-15 секунд', 'Сжимайте с определенной силой']
      },
      {
        id: 'test1',
        title: 'Тестирование',
        instruction: 'Отпустите якорь, расслабьтесь, затем снова сожмите пальцы',
        duration: 2,
        type: 'mental'
      },
      {
        id: 'reinforce1',
        title: 'Закрепление',
        instruction: 'Повторите процесс с 2-3 другими ресурсными воспоминаниями',
        duration: 5,
        type: 'integration'
      }
    ],
    benefits: ['Быстрый доступ к ресурсным состояниям', 'Повышение уверенности', 'Управление эмоциями'],
    precautions: ['Используйте только позитивные воспоминания', 'Практикуйтесь в безопасной обстановке']
  },

  {
    id: 'addiction-reframe',
    name: 'Рефрейминг зависимости',
    category: 'reframing',
    description: 'Изменение восприятия алкоголя и связанных с ним убеждений',
    difficulty: 'advanced',
    duration: 30,
    steps: [
      {
        id: 'identify1',
        title: 'Выявление убеждения',
        instruction: 'Определите главное убеждение о пользе алкоголя для вас',
        duration: 5,
        type: 'mental',
        tips: ['Будьте честны с собой', 'Найдите корневое убеждение']
      },
      {
        id: 'challenge1',
        title: 'Вызов убеждению',
        instruction: 'Найдите минимум 5 фактов, опровергающих это убеждение',
        duration: 7,
        type: 'mental',
        tips: ['Используйте личный опыт', 'Подумайте о последствиях']
      },
      {
        id: 'reframe1',
        title: 'Новая рамка',
        instruction: 'Создайте новое, позитивное убеждение о трезвости',
        duration: 5,
        type: 'mental',
        tips: ['Сформулируйте утвердительно', 'Сделайте убеждение эмоциональным']
      },
      {
        id: 'anchor-new',
        title: 'Закрепление нового убеждения',
        instruction: 'Представьте себя, живущего по новому убеждению',
        duration: 8,
        type: 'visualization',
        tips: ['Увидьте конкретные сцены', 'Почувствуйте все преимущества']
      },
      {
        id: 'future-pace',
        title: 'Перенос в будущее',
        instruction: 'Представьте, как новое убеждение поможет в сложных ситуациях',
        duration: 5,
        type: 'integration'
      }
    ],
    benefits: ['Изменение отношения к алкоголю', 'Новые позитивные убеждения', 'Снижение тяги'],
    precautions: ['Работайте с одним убеждением за раз', 'При сильном сопротивлении обратитесь к специалисту']
  },

  {
    id: 'timeline-therapy',
    name: 'Терапия временной линии',
    category: 'timeline',
    description: 'Работа с травматическим опытом через метафору временной линии',
    difficulty: 'expert',
    duration: 45,
    steps: [
      {
        id: 'timeline1',
        title: 'Создание временной линии',
        instruction: 'Представьте свою жизнь как линию времени от рождения до сегодня',
        duration: 5,
        type: 'visualization'
      },
      {
        id: 'float1',
        title: 'Подъем над линией',
        instruction: 'Мысленно поднимитесь над линией времени и посмотрите на нее сверху',
        duration: 5,
        type: 'visualization',
        tips: ['Почувствуйте безопасность высоты', 'Сохраняйте спокойствие']
      },
      {
        id: 'locate1',
        title: 'Поиск первого события',
        instruction: 'Найдите первое событие, связанное с началом проблем с алкоголем',
        duration: 7,
        type: 'mental',
        tips: ['Доверяйте первой интуиции', 'Не анализируйте пока']
      },
      {
        id: 'learn1',
        title: 'Извлечение урока',
        instruction: 'Спросите себя: "Какой урок я могу извлечь из этого опыта?"',
        duration: 8,
        type: 'mental'
      },
      {
        id: 'resources1',
        title: 'Дарование ресурсов',
        instruction: 'Представьте, как даете своему прошлому "я" необходимые ресурсы',
        duration: 10,
        type: 'visualization',
        tips: ['Это может быть мудрость, сила, поддержка', 'Почувствуйте изменения в линии времени']
      },
      {
        id: 'return1',
        title: 'Возвращение в настоящее',
        instruction: 'Медленно вернитесь в настоящее, ощущая изменения',
        duration: 5,
        type: 'integration'
      },
      {
        id: 'future1',
        title: 'Проверка будущего',
        instruction: 'Посмотрите в будущее и убедитесь, что изменения сохранились',
        duration: 5,
        type: 'integration'
      }
    ],
    benefits: ['Исцеление прошлых травм', 'Изменение негативных паттернов', 'Освобождение от прошлого'],
    contraindications: ['Серьезные психические расстройства', 'Недавние травмы без проработки'],
    precautions: ['Работайте только в безопасной обстановке', 'При сильных эмоциях остановите упражнение']
  },

  {
    id: 'swish-pattern',
    name: 'Паттерн "Свиш"',
    category: 'swish',
    description: 'Техника для замены нежелательного поведения на желаемое',
    difficulty: 'intermediate',
    duration: 25,
    steps: [
      {
        id: 'problem-image',
        title: 'Проблемный образ',
        instruction: 'Создайте яркий образ ситуации, когда хотите выпить',
        duration: 5,
        type: 'visualization',
        tips: ['Сделайте образ большим и ярким', 'Включите все детали']
      },
      {
        id: 'desired-image',
        title: 'Желаемый образ',
        instruction: 'Создайте образ себя, успешно справляющегося без алкоголя',
        duration: 5,
        type: 'visualization',
        tips: ['Покажите себя уверенным и здоровым', 'Сделайте образ привлекательным']
      },
      {
        id: 'setup-swish',
        title: 'Подготовка свиша',
        instruction: 'Поместите маленький желаемый образ в угол проблемного',
        duration: 3,
        type: 'visualization'
      },
      {
        id: 'swish-action',
        title: 'Выполнение свиша',
        instruction: 'Быстро увеличьте желаемый образ, затемняя проблемный',
        duration: 2,
        type: 'visualization',
        tips: ['Делайте быстро и решительно', 'Сопровождайте звуком "свиш"']
      },
      {
        id: 'blank-screen',
        title: 'Пустой экран',
        instruction: 'Очистите внутренний экран, подумайте о чем-то другом',
        duration: 1,
        type: 'mental'
      },
      {
        id: 'repeat-swish',
        title: 'Повторение',
        instruction: 'Повторите процесс 7-10 раз подряд',
        duration: 7,
        type: 'integration'
      },
      {
        id: 'test-swish',
        title: 'Тестирование',
        instruction: 'Попробуйте вернуть проблемный образ - он должен быть тусклым',
        duration: 2,
        type: 'mental'
      }
    ],
    benefits: ['Автоматическая замена нежелательного поведения', 'Снижение импульсивности', 'Новые здоровые паттерны'],
    precautions: ['Убедитесь в экологичности желаемого образа', 'Делайте свиш быстро и четко']
  },

  {
    id: 'belief-change',
    name: 'Изменение убеждений',
    category: 'belief_change',
    description: 'Системная работа с ограничивающими убеждениями о себе и зависимости',
    difficulty: 'advanced',
    duration: 35,
    steps: [
      {
        id: 'identify-belief',
        title: 'Определение убеждения',
        instruction: 'Выявите главное ограничивающее убеждение о своей способности быть трезвым',
        duration: 5,
        type: 'mental',
        tips: ['Обратите внимание на внутренний голос', 'Найдите убеждение, вызывающее сильные эмоции']
      },
      {
        id: 'doubt-old',
        title: 'Создание сомнения',
        instruction: 'Найдите примеры, когда это убеждение было неверным',
        duration: 7,
        type: 'mental',
        tips: ['Ищите исключения из правила', 'Используйте логику и факты']
      },
      {
        id: 'new-belief',
        title: 'Формирование нового убеждения',
        instruction: 'Создайте противоположное, позитивное убеждение',
        duration: 5,
        type: 'mental',
        tips: ['Сформулируйте утвердительно', 'Сделайте личным и конкретным']
      },
      {
        id: 'evidence-new',
        title: 'Поиск доказательств',
        instruction: 'Найдите минимум 10 доказательств нового убеждения',
        duration: 8,
        type: 'mental',
        tips: ['Включите прошлый опыт', 'Добавьте примеры других людей']
      },
      {
        id: 'embody-new',
        title: 'Воплощение убеждения',
        instruction: 'Почувствуйте, как новое убеждение влияет на ваше тело и эмоции',
        duration: 5,
        type: 'physical',
        tips: ['Обратите внимание на изменения в осанке', 'Почувствуйте новую энергию']
      },
      {
        id: 'future-test',
        title: 'Проверка в будущем',
        instruction: 'Представьте сложную ситуацию с новым убеждением',
        duration: 5,
        type: 'visualization',
        tips: ['Выберите реальную будущую ситуацию', 'Почувствуйте уверенность и силу']
      }
    ],
    benefits: ['Глубокие личностные изменения', 'Новая идентичность', 'Устойчивая мотивация'],
    precautions: ['Работайте с одним убеждением за сессию', 'Убедитесь в экологичности нового убеждения']
  },

  {
    id: 'six-step-reframe',
    name: 'Шестишаговый рефрейминг',
    category: 'reframing',
    description: 'Работа с внутренними частями личности для изменения нежелательного поведения',
    difficulty: 'expert',
    duration: 40,
    steps: [
      {
        id: 'identify-part',
        title: 'Идентификация части',
        instruction: 'Обратитесь к части себя, ответственной за желание пить алкоголь',
        duration: 5,
        type: 'mental',
        tips: ['Говорите уважительно', 'Ждите ответа в виде ощущений или образов']
      },
      {
        id: 'establish-communication',
        title: 'Установление коммуникации',
        instruction: 'Попросите эту часть дать знак "да" и "нет"',
        duration: 5,
        type: 'mental',
        tips: ['Это могут быть ощущения, образы или звуки', 'Поблагодарите за сотрудничество']
      },
      {
        id: 'discover-intention',
        title: 'Выявление позитивного намерения',
        instruction: 'Узнайте, что позитивного эта часть пытается сделать для вас',
        duration: 8,
        type: 'mental',
        tips: ['Копайте глубже поверхностных ответов', 'Ищите положительную цель']
      },
      {
        id: 'creative-alternatives',
        title: 'Поиск альтернатив',
        instruction: 'Обратитесь к творческой части за новыми способами достижения той же цели',
        duration: 10,
        type: 'mental',
        tips: ['Просите минимум 3 альтернативы', 'Убедитесь, что они реалистичны']
      },
      {
        id: 'agreement',
        title: 'Получение согласия',
        instruction: 'Спросите, согласна ли часть попробовать новые способы',
        duration: 5,
        type: 'mental',
        tips: ['Дайте время на размышления', 'Обсудите возможные сомнения']
      },
      {
        id: 'ecology-check',
        title: 'Экологическая проверка',
        instruction: 'Убедитесь, что изменения не навредят другим частям личности',
        duration: 7,
        type: 'integration',
        tips: ['Обратитесь ко всем частям себя', 'Разрешите возникшие конфликты']
      }
    ],
    benefits: ['Гармония между частями личности', 'Устранение внутренних конфликтов', 'Устойчивые изменения'],
    contraindications: ['Диссоциативные расстройства', 'Острые психические состояния'],
    precautions: ['Требует опыта в НЛП', 'При возникновении странных реакций прекратите упражнение']
  }
];

// Дополнительные техники для работы с субмодальностями
export interface SubmodalityTechnique {
  id: string;
  name: string;
  description: string;
  steps: string[];
  targetModalities: ('visual' | 'auditory' | 'kinesthetic')[];
}

export const submodalityTechniques: SubmodalityTechnique[] = [
  {
    id: 'craving-shrink',
    name: 'Сжатие образа тяги',
    description: 'Уменьшение силы тяги через изменение визуальных субмодальностей',
    steps: [
      'Представьте образ, вызывающий тягу к алкоголю',
      'Сделайте образ черно-белым',
      'Уменьшите его размер в два раза',
      'Отодвиньте образ дальше от себя',
      'Сделайте его тусклым и расплывчатым',
      'Заметьте, как изменились ваши ощущения'
    ],
    targetModalities: ['visual']
  },
  {
    id: 'positive-amplify',
    name: 'Усиление позитивного образа',
    description: 'Укрепление мотивации через усиление образа трезвой жизни',
    steps: [
      'Создайте яркий образ себя здорового и трезвого',
      'Сделайте образ больше и ярче',
      'Добавьте насыщенные цвета',
      'Приблизьте образ к себе',
      'Добавьте приятные звуки (смех, музыку)',
      'Почувствуйте радость и гордость'
    ],
    targetModalities: ['visual', 'auditory', 'kinesthetic']
  }
];

// Упражнения на развитие осознанности
export interface MindfulnessExercise {
  id: string;
  name: string;
  duration: number;
  instructions: string[];
  benefits: string[];
}

export const mindfulnessExercises: MindfulnessExercise[] = [
  {
    id: 'urge-surfing',
    name: 'Серфинг по тяге',
    duration: 15,
    instructions: [
      'Когда почувствуете тягу, не сопротивляйтесь ей',
      'Представьте тягу как волну в океане',
      'Наблюдайте за волной: как она поднимается',
      'Заметьте пик волны - самую сильную тягу',
      'Продолжайте наблюдать, как волна начинает спадать',
      'Дышите спокойно, оставаясь наблюдателем',
      'Волна обязательно спадет - это закон природы',
      'Поздравьте себя с успешным "серфингом"'
    ],
    benefits: ['Принятие эмоций', 'Снижение импульсивности', 'Развитие терпения']
  },
  {
    id: 'body-scan',
    name: 'Сканирование тела',
    duration: 20,
    instructions: [
      'Лягте удобно и закройте глаза',
      'Начните с макушки головы',
      'Медленно перемещайте внимание вниз по телу',
      'Замечайте все ощущения без оценки',
      'Если найдете напряжение, просто отметьте это',
      'Продолжайте до кончиков пальцев ног',
      'Почувствуйте тело как единое целое',
      'Полежите еще несколько минут в покое'
    ],
    benefits: ['Снижение стресса', 'Улучшение сна', 'Связь с телом']
  }
];

export default {
  advancedNLPTechniques,
  submodalityTechniques,
  mindfulnessExercises
};