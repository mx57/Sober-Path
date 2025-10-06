// Расширенная библиотека когнитивно-поведенческой терапии (КПТ)

export interface CBTTechnique {
  id: string;
  name: string;
  category: 'thought_records' | 'behavioral_experiments' | 'exposure' | 'mindfulness_cbt' | 'relapse_prevention' | 'problem_solving' | 'acceptance_commitment';
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  steps: CBTStep[];
  worksheets?: CBTWorksheet[];
  benefits: string[];
  evidenceBase: string;
  adaptations?: string[];
}

export interface CBTStep {
  id: string;
  title: string;
  instruction: string;
  duration?: number;
  type: 'assessment' | 'intervention' | 'practice' | 'reflection' | 'homework';
  materials?: string[];
  examples?: string[];
}

export interface CBTWorksheet {
  id: string;
  name: string;
  fields: CBTField[];
  instructions: string[];
}

export interface CBTField {
  id: string;
  label: string;
  type: 'text' | 'scale' | 'checkbox' | 'select';
  options?: string[];
  required: boolean;
}

// Техники КПТ третьей волны
export const advancedCBTTechniques: CBTTechnique[] = [
  {
    id: 'thought-defusion',
    name: 'Когнитивная дефузия',
    category: 'acceptance_commitment',
    description: 'Техника для снижения влияния навязчивых мыслей о выпивке',
    difficulty: 'intermediate',
    duration: 15,
    evidenceBase: 'ACT (Терапия принятия и ответственности)',
    steps: [
      {
        id: 'identify-thought',
        title: 'Определение мысли',
        instruction: 'Выберите навязчивую мысль о выпивке, например "Мне нужно выпить"',
        duration: 2,
        type: 'assessment',
        examples: ['"Я не справлюсь без алкоголя"', '"Один бокал не повредит"', '"Я слабак"']
      },
      {
        id: 'notice-thought',
        title: 'Наблюдение за мыслью',
        instruction: 'Скажите себе: "Я замечаю, что у меня есть мысль, что..."',
        duration: 2,
        type: 'intervention',
        examples: ['"Я замечаю мысль о том, что мне нужно выпить"']
      },
      {
        id: 'thank-mind',
        title: 'Благодарность уму',
        instruction: 'Скажите: "Спасибо, ум, за эту мысль" с легкой иронией',
        duration: 2,
        type: 'intervention'
      },
      {
        id: 'silly-voice',
        title: 'Глупый голос',
        instruction: 'Повторите мысль голосом мультипликационного персонажа',
        duration: 3,
        type: 'intervention',
        examples: ['Голос Дональда Дака, робота или очень медленный голос']
      },
      {
        id: 'singing-thought',
        title: 'Пение мысли',
        instruction: 'Пропойте мысль на мелодию "Happy Birthday" или другой знакомой песни',
        duration: 3,
        type: 'intervention'
      },
      {
        id: 'labels-thoughts',
        title: 'Ярлыки для мыслей',
        instruction: 'Дайте типу мысли название: "А, это моя мысль об алкоголе снова"',
        duration: 3,
        type: 'reflection'
      }
    ],
    benefits: [
      'Снижение эмоционального воздействия мыслей',
      'Увеличение психологической гибкости',
      'Развитие наблюдательной позиции'
    ],
    worksheets: [
      {
        id: 'defusion-log',
        name: 'Дневник дефузии',
        instructions: [
          'Записывайте навязчивые мысли',
          'Отмечайте использованную технику',
          'Оценивайте изменение в силе мысли'
        ],
        fields: [
          { id: 'thought', label: 'Навязчивая мысль', type: 'text', required: true },
          { id: 'intensity_before', label: 'Сила до (0-10)', type: 'scale', required: true },
          { id: 'technique_used', label: 'Техника', type: 'select', 
            options: ['Наблюдение', 'Благодарность', 'Глупый голос', 'Пение', 'Ярлыки'], 
            required: true },
          { id: 'intensity_after', label: 'Сила после (0-10)', type: 'scale', required: true }
        ]
      }
    ]
  },

  {
    id: 'values-clarification',
    name: 'Прояснение ценностей',
    category: 'acceptance_commitment',
    description: 'Определение жизненных ценностей для мотивации к трезвости',
    difficulty: 'beginner',
    duration: 30,
    evidenceBase: 'ACT, исследования показывают высокую эффективность',
    steps: [
      {
        id: 'life-domains',
        title: 'Сферы жизни',
        instruction: 'Рассмотрите ключевые сферы: семья, карьера, здоровье, дружба, личностный рост',
        duration: 5,
        type: 'assessment',
        materials: ['Список сфер жизни', 'Бумага для заметок']
      },
      {
        id: 'funeral-exercise',
        title: 'Упражнение "Похороны"',
        instruction: 'Представьте свои похороны через 80 лет. Что бы вы хотели услышать о своей жизни?',
        duration: 10,
        type: 'reflection'
      },
      {
        id: 'values-writing',
        title: 'Письменные ценности',
        instruction: 'Запишите 5-7 главных ценностей в каждой сфере жизни',
        duration: 10,
        type: 'intervention',
        examples: ['Семья: быть заботливым родителем', 'Здоровье: активность и энергичность']
      },
      {
        id: 'alcohol-vs-values',
        title: 'Алкоголь против ценностей',
        instruction: 'Проанализируйте, как алкоголь мешает жить по вашим ценностям',
        duration: 5,
        type: 'reflection'
      }
    ],
    benefits: [
      'Ясное понимание жизненных приоритетов',
      'Сильная мотивация к изменениям',
      'Осмысленность жизни без алкоголя'
    ],
    worksheets: [
      {
        id: 'values-worksheet',
        name: 'Карта ценностей',
        instructions: [
          'Заполните ценности для каждой сферы',
          'Оцените, насколько хорошо вы живете по каждой ценности',
          'Определите, как алкоголь влияет на ваши ценности'
        ],
        fields: [
          { id: 'domain', label: 'Сфера жизни', type: 'select', 
            options: ['Семья', 'Карьера', 'Здоровье', 'Дружба', 'Хобби', 'Духовность'], 
            required: true },
          { id: 'value', label: 'Ценность', type: 'text', required: true },
          { id: 'current_rating', label: 'Текущее соответствие (0-10)', type: 'scale', required: true },
          { id: 'alcohol_impact', label: 'Влияние алкоголя', type: 'text', required: false }
        ]
      }
    ]
  },

  {
    id: 'behavioral-activation',
    name: 'Поведенческая активация',
    category: 'behavioral_experiments',
    description: 'Планирование и выполнение значимых активностей вместо употребления алкоголя',
    difficulty: 'beginner',
    duration: 25,
    evidenceBase: 'Доказанная эффективность при депрессии и зависимостях',
    steps: [
      {
        id: 'activity-monitoring',
        title: 'Мониторинг активности',
        instruction: 'Ведите дневник активности в течение недели, отмечая настроение',
        duration: 5,
        type: 'assessment',
        materials: ['Дневник активности', 'Шкала настроения']
      },
      {
        id: 'value-activities',
        title: 'Ценностно-ориентированные активности',
        instruction: 'Составьте список из 20 активностей, соответствующих вашим ценностям',
        duration: 8,
        type: 'intervention',
        examples: ['Прогулка с детьми', 'Чтение книги', 'Занятия спортом', 'Встреча с друзьями']
      },
      {
        id: 'hierarchy-planning',
        title: 'Иерархическое планирование',
        instruction: 'Разделите активности на простые, средние и сложные',
        duration: 5,
        type: 'intervention'
      },
      {
        id: 'scheduling',
        title: 'Планирование',
        instruction: 'Запланируйте минимум одну активность на каждый день следующей недели',
        duration: 5,
        type: 'practice'
      },
      {
        id: 'implementation',
        title: 'Выполнение и отслеживание',
        instruction: 'Выполните запланированное и отметьте изменения настроения',
        duration: 2,
        type: 'homework'
      }
    ],
    benefits: [
      'Улучшение настроения',
      'Увеличение чувства достижения',
      'Замещение времени, проводимого с алкоголем'
    ]
  },

  {
    id: 'cope-ahead',
    name: 'План преодоления "COPE AHEAD"',
    category: 'relapse_prevention',
    description: 'Детальное планирование действий в ситуациях высокого риска',
    difficulty: 'intermediate',
    duration: 35,
    evidenceBase: 'DBT (Диалектическая поведенческая терапия)',
    steps: [
      {
        id: 'describe-situation',
        title: 'Описание ситуации',
        instruction: 'Детально опишите конкретную ситуацию высокого риска',
        duration: 5,
        type: 'assessment',
        examples: ['Корпоративная вечеринка', 'Стресс на работе', 'Конфликт с партнером']
      },
      {
        id: 'outline-coping',
        title: 'План преодоления',
        instruction: 'Составьте пошаговый план действий в этой ситуации',
        duration: 10,
        type: 'intervention'
      },
      {
        id: 'practice-skills',
        title: 'Отработка навыков',
        instruction: 'Мысленно или физически репетируйте каждый шаг плана',
        duration: 10,
        type: 'practice'
      },
      {
        id: 'evaluate-effectiveness',
        title: 'Оценка эффективности',
        instruction: 'Оцените реалистичность плана и внесите коррективы',
        duration: 5,
        type: 'reflection'
      },
      {
        id: 'anticipate-challenges',
        title: 'Предвидение препятствий',
        instruction: 'Подумайте о возможных препятствиях и запасных планах',
        duration: 5,
        type: 'intervention'
      }
    ],
    benefits: [
      'Уверенность в сложных ситуациях',
      'Автоматические здоровые реакции',
      'Снижение импульсивных решений'
    ]
  },

  {
    id: 'mindful-urge-surfing',
    name: 'Осознанный серфинг по тяге',
    category: 'mindfulness_cbt',
    description: 'Продвинутая техника работы с тягой через осознанность',
    difficulty: 'advanced',
    duration: 20,
    evidenceBase: 'MBRP (Mindfulness-Based Relapse Prevention)',
    steps: [
      {
        id: 'grounding',
        title: 'Заземление',
        instruction: 'Почувствуйте контакт тела с поверхностью, на которой сидите или стоите',
        duration: 2,
        type: 'intervention'
      },
      {
        id: 'breath-awareness',
        title: 'Осознание дыхания',
        instruction: 'Сосредоточьтесь на естественном ритме дыхания',
        duration: 3,
        type: 'intervention'
      },
      {
        id: 'urge-location',
        title: 'Локализация тяги',
        instruction: 'Найдите, где в теле ощущается тяга к алкоголю',
        duration: 2,
        type: 'assessment'
      },
      {
        id: 'observe-qualities',
        title: 'Наблюдение качеств',
        instruction: 'Исследуйте: размер, температуру, текстуру, движение тяги',
        duration: 5,
        type: 'intervention'
      },
      {
        id: 'breathe-into',
        title: 'Дыхание в ощущение',
        instruction: 'Направьте дыхание в место тяги, не пытаясь изменить ее',
        duration: 5,
        type: 'practice'
      },
      {
        id: 'wave-metaphor',
        title: 'Метафора волны',
        instruction: 'Представьте тягу как волну: подъем, пик, спад',
        duration: 3,
        type: 'reflection'
      }
    ],
    benefits: [
      'Принятие дискомфорта',
      'Снижение реактивности',
      'Развитие эмоциональной регуляции'
    ]
  },

  {
    id: 'pros-cons-decisional-balance',
    name: 'Решающий баланс "за" и "против"',
    category: 'problem_solving',
    description: 'Структурированный анализ преимуществ и недостатков употребления алкоголя',
    difficulty: 'beginner',
    duration: 30,
    evidenceBase: 'Мотивационное интервьирование, Модель транстеоретических изменений',
    steps: [
      {
        id: 'four-quadrants',
        title: 'Четыре квадрата',
        instruction: 'Создайте таблицу: плюсы/минусы употребления и плюсы/минусы трезвости',
        duration: 5,
        type: 'assessment'
      },
      {
        id: 'drinking-pros',
        title: 'Плюсы употребления',
        instruction: 'Честно перечислите все, что вам нравится в алкоголе',
        duration: 5,
        type: 'assessment',
        examples: ['Расслабление', 'Социальность', 'Снятие стресса']
      },
      {
        id: 'drinking-cons',
        title: 'Минусы употребления',
        instruction: 'Перечислите все негативные последствия алкоголя в вашей жизни',
        duration: 8,
        type: 'assessment'
      },
      {
        id: 'sobriety-pros',
        title: 'Плюсы трезвости',
        instruction: 'Опишите все преимущества жизни без алкоголя',
        duration: 7,
        type: 'intervention'
      },
      {
        id: 'sobriety-cons',
        title: 'Минусы трезвости',
        instruction: 'Честно признайте сложности трезвой жизни',
        duration: 3,
        type: 'assessment'
      },
      {
        id: 'weight-importance',
        title: 'Взвешивание важности',
        instruction: 'Оцените важность каждого пункта по шкале от 1 до 10',
        duration: 2,
        type: 'reflection'
      }
    ],
    benefits: [
      'Ясность в принятии решений',
      'Повышение мотивации к изменениям',
      'Объективный взгляд на ситуацию'
    ],
    worksheets: [
      {
        id: 'decisional-balance',
        name: 'Решающий баланс',
        instructions: [
          'Заполните все четыре квадрата',
          'Оцените важность каждого пункта',
          'Пересматривайте еженедельно'
        ],
        fields: [
          { id: 'category', label: 'Категория', type: 'select', 
            options: ['Плюсы употребления', 'Минусы употребления', 'Плюсы трезвости', 'Минусы трезвости'], 
            required: true },
          { id: 'item', label: 'Пункт', type: 'text', required: true },
          { id: 'importance', label: 'Важность (1-10)', type: 'scale', required: true }
        ]
      }
    ]
  }
];

// Техники работы с когнитивными искажениями
export interface CognitiveDistortion {
  id: string;
  name: string;
  description: string;
  examples: string[];
  challenges: string[];
  alternatives: string[];
}

export const cognitiveDistortions: CognitiveDistortion[] = [
  {
    id: 'all-or-nothing',
    name: 'Черно-белое мышление',
    description: 'Видение ситуаций только в крайностях',
    examples: [
      '"Я сорвался один раз, значит я полный неудачник"',
      '"Если я не могу быть идеальным в трезвости, то нет смысла пытаться"'
    ],
    challenges: [
      'Где доказательства этого утверждения?',
      'Существуют ли промежуточные варианты?',
      'Что бы вы сказали другу в такой ситуации?'
    ],
    alternatives: [
      '"Один срыв не определяет весь мой путь восстановления"',
      '"Я могу учиться на ошибках и продолжать двигаться вперед"'
    ]
  },
  {
    id: 'fortune-telling',
    name: 'Предсказание будущего',
    description: 'Убежденность в негативном исходе без доказательств',
    examples: [
      '"Я никогда не смогу бросить пить"',
      '"Все подумают, что я скучный без алкоголя"'
    ],
    challenges: [
      'На каких фактах основано это предсказание?',
      'Какова вероятность этого исхода?',
      'Что может произойти хорошего?'
    ],
    alternatives: [
      '"Я не знаю, что произойдет, но могу попробовать"',
      '"У меня есть возможность создать лучшее будущее"'
    ]
  },
  {
    id: 'emotional-reasoning',
    name: 'Эмоциональное рассуждение',
    description: 'Принятие эмоций за факты',
    examples: [
      '"Я чувствую себя безнадежным, значит ситуация безнадежна"',
      '"Мне страшно бросать пить, значит это опасно"'
    ],
    challenges: [
      'Являются ли мои чувства фактами?',
      'Могут ли эмоции обманывать?',
      'Как бы выглядела ситуация без эмоциональной окраски?'
    ],
    alternatives: [
      '"Я чувствую безнадежность, но это временное состояние"',
      '"Страх - нормальная реакция на изменения"'
    ]
  }
];

export default {
  advancedCBTTechniques,
  cognitiveDistortions
};