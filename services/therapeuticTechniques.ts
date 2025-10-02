// Современные терапевтические техники

export interface TherapeuticTechnique {
  id: string;
  name: string;
  approach: 'CBT' | 'DBT' | 'ACT' | 'EMDR' | 'IFS' | 'Somatic' | 'Mindfulness' | 'EFT' | 'Brainspotting';
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: TherapeuticStep[];
  benefits: string[];
  contraindications?: string[];
}

export interface TherapeuticStep {
  id: string;
  title: string;
  instruction: string;
  duration?: number;
  type: 'breathing' | 'movement' | 'visualization' | 'cognitive' | 'emotional' | 'somatic';
  tips?: string[];
}

export const modernTherapeuticTechniques: TherapeuticTechnique[] = [
  // Когнитивно-поведенческая терапия (CBT)
  {
    id: 'thought-record-cbt',
    name: 'Дневник мыслей (CBT)',
    approach: 'CBT',
    description: 'Техника для выявления и изменения автоматических негативных мыслей',
    duration: 15,
    difficulty: 'beginner',
    steps: [
      {
        id: 'situation',
        title: 'Определение ситуации',
        instruction: 'Опишите конкретную ситуацию, вызвавшую желание выпить',
        duration: 3,
        type: 'cognitive',
        tips: ['Будьте максимально конкретны', 'Избегайте интерпретаций']
      },
      {
        id: 'emotions',
        title: 'Эмоции',
        instruction: 'Назовите и оцените интенсивность эмоций (0-10)',
        duration: 2,
        type: 'emotional',
        tips: ['Используйте точные названия эмоций', 'Честно оцените интенсивность']
      },
      {
        id: 'thoughts',
        title: 'Автоматические мысли',
        instruction: 'Запишите все мысли, возникшие в той ситуации',
        duration: 4,
        type: 'cognitive',
        tips: ['Фиксируйте именно мысли, а не чувства', 'Не цензурируйте себя']
      },
      {
        id: 'evidence',
        title: 'Доказательства "за" и "против"',
        instruction: 'Найдите факты, подтверждающие и опровергающие каждую мысль',
        duration: 4,
        type: 'cognitive',
        tips: ['Ищите объективные доказательства', 'Спросите: "Что сказал бы друг?"']
      },
      {
        id: 'alternative',
        title: 'Альтернативные мысли',
        instruction: 'Сформулируйте более сбалансированные мысли',
        duration: 2,
        type: 'cognitive',
        tips: ['Делайте мысли реалистичными, не только позитивными', 'Проверяйте на правдоподобность']
      }
    ],
    benefits: ['Осознание мыслительных паттернов', 'Снижение эмоциональной реактивности', 'Развитие критического мышления']
  },

  // Диалектико-поведенческая терапия (DBT)
  {
    id: 'opposite-action-dbt',
    name: 'Противоположное действие (DBT)',
    approach: 'DBT',
    description: 'Техника для изменения эмоций через противоположные действия',
    duration: 10,
    difficulty: 'intermediate',
    steps: [
      {
        id: 'identify-emotion',
        title: 'Определение эмоции',
        instruction: 'Назовите основную эмоцию, побуждающую к употреблению',
        duration: 2,
        type: 'emotional',
        tips: ['Различайте первичную и вторичную эмоции', 'Будьте точны в названии']
      },
      {
        id: 'check-justified',
        title: 'Проверка обоснованности',
        instruction: 'Определите, оправдана ли эмоция фактами ситуации',
        duration: 3,
        type: 'cognitive',
        tips: ['Отделите факты от интерпретаций', 'Учитывайте интенсивность эмоции']
      },
      {
        id: 'identify-urge',
        title: 'Определение побуждения',
        instruction: 'Поймите, к какому действию толкает эмоция',
        duration: 1,
        type: 'cognitive'
      },
      {
        id: 'opposite-action',
        title: 'Противоположное действие',
        instruction: 'Сделайте что-то противоположное побуждению эмоции',
        duration: 4,
        type: 'movement',
        tips: ['Действуйте полностью противоположно', 'Вкладывайте энергию в действие']
      }
    ],
    benefits: ['Эмоциональная регуляция', 'Разрыв деструктивных паттернов', 'Повышение самоконтроля']
  },

  // Терапия принятия и ответственности (ACT)
  {
    id: 'values-clarification-act',
    name: 'Прояснение ценностей (ACT)',
    approach: 'ACT',
    description: 'Техника для определения жизненных ценностей и направления действий',
    duration: 25,
    difficulty: 'intermediate',
    steps: [
      {
        id: 'life-domains',
        title: 'Сферы жизни',
        instruction: 'Рассмотрите основные сферы: семья, работа, здоровье, отношения, духовность',
        duration: 3,
        type: 'cognitive'
      },
      {
        id: 'values-each-domain',
        title: 'Ценности в каждой сфере',
        instruction: 'Определите, что действительно важно для вас в каждой сфере',
        duration: 8,
        type: 'cognitive',
        tips: ['Ценности - это направления, а не цели', 'Выбирайте то, что важно именно вам']
      },
      {
        id: 'current-actions',
        title: 'Текущие действия',
        instruction: 'Оцените, насколько ваши текущие действия соответствуют ценностям',
        duration: 5,
        type: 'cognitive',
        tips: ['Будьте честны в оценке', 'Не осуждайте себя']
      },
      {
        id: 'value-based-goals',
        title: 'Цели на основе ценностей',
        instruction: 'Поставьте конкретные цели, приближающие к ценностям',
        duration: 6,
        type: 'cognitive',
        tips: ['Цели должны быть конкретными и измеримыми', 'Начните с малых шагов']
      },
      {
        id: 'commitment',
        title: 'Принятие обязательства',
        instruction: 'Выберите одно действие, которое совершите сегодня в соответствии с ценностями',
        duration: 3,
        type: 'cognitive'
      }
    ],
    benefits: ['Ясность жизненных приоритетов', 'Внутренняя мотивация', 'Осмысленность жизни']
  },

  // EMDR (Десенсибилизация и переработка движениями глаз)
  {
    id: 'butterfly-hug-emdr',
    name: 'Объятие бабочки (EMDR)',
    approach: 'EMDR',
    description: 'Техника самоуспокоения через билатеральную стимуляцию',
    duration: 10,
    difficulty: 'beginner',
    steps: [
      {
        id: 'position',
        title: 'Исходная позиция',
        instruction: 'Скрестите руки на груди, ладони на плечах',
        duration: 1,
        type: 'somatic'
      },
      {
        id: 'breathing',
        title: 'Дыхание',
        instruction: 'Дышите медленно и глубоко',
        duration: 2,
        type: 'breathing'
      },
      {
        id: 'tapping',
        title: 'Похлопывания',
        instruction: 'Поочередно похлопывайте ладонями по плечам в медленном ритме',
        duration: 5,
        type: 'somatic',
        tips: ['Ритм как у медленного сердцебиения', 'Сосредоточьтесь на ощущениях']
      },
      {
        id: 'positive-thoughts',
        title: 'Позитивные мысли',
        instruction: 'Думайте о своей силе и способности справляться',
        duration: 2,
        type: 'cognitive'
      }
    ],
    benefits: ['Быстрое успокоение', 'Снижение тревожности', 'Активация парасимпатической системы'],
    contraindications: ['Острые травматические воспоминания без профессиональной поддержки']
  },

  // Терапия внутренних семейных систем (IFS)
  {
    id: 'parts-dialogue-ifs',
    name: 'Диалог с частями (IFS)',
    approach: 'IFS',
    description: 'Техника для работы с различными внутренними частями личности',
    duration: 30,
    difficulty: 'advanced',
    steps: [
      {
        id: 'centering',
        title: 'Центрирование',
        instruction: 'Найдите спокойное состояние вашего истинного Я',
        duration: 5,
        type: 'breathing',
        tips: ['Почувствуйте любопытство и сострадание', 'Отпустите необходимость контролировать']
      },
      {
        id: 'identify-part',
        title: 'Определение части',
        instruction: 'Обратитесь к части, которая хочет употребить алкоголь',
        duration: 3,
        type: 'cognitive',
        tips: ['Говорите с частью, а не от имени части', 'Проявляйте уважение и благодарность']
      },
      {
        id: 'listen-part',
        title: 'Слушание части',
        instruction: 'Спросите часть, что она чувствует и чего боится',
        duration: 8,
        type: 'emotional',
        tips: ['Слушайте без осуждения', 'Задавайте открытые вопросы']
      },
      {
        id: 'understand-role',
        title: 'Понимание роли',
        instruction: 'Узнайте, какую защитную функцию выполняет эта часть',
        duration: 6,
        type: 'cognitive',
        tips: ['Ищите позитивное намерение', 'Благодарите за заботу']
      },
      {
        id: 'negotiate',
        title: 'Переговоры',
        instruction: 'Обсудите с частью другие способы выполнения ее функции',
        duration: 6,
        type: 'cognitive',
        tips: ['Предлагайте, а не требуйте', 'Найдите компромисс']
      },
      {
        id: 'appreciate',
        title: 'Благодарность',
        instruction: 'Поблагодарите часть за ее работу и готовность к изменениям',
        duration: 2,
        type: 'emotional'
      }
    ],
    benefits: ['Внутренняя гармония', 'Понимание мотивов поведения', 'Сострадание к себе'],
    contraindications: ['Диссоциативные расстройства без профессионального сопровождения']
  },

  // Соматические техники
  {
    id: 'somatic-experiencing',
    name: 'Соматическое переживание',
    approach: 'Somatic',
    description: 'Работа с телесными ощущениями для разрядки травматической энергии',
    duration: 20,
    difficulty: 'intermediate',
    steps: [
      {
        id: 'body-awareness',
        title: 'Осознание тела',
        instruction: 'Медленно просканируйте все тело, замечая ощущения',
        duration: 5,
        type: 'somatic',
        tips: ['Не пытайтесь изменить ощущения', 'Просто наблюдайте']
      },
      {
        id: 'track-sensation',
        title: 'Отслеживание ощущения',
        instruction: 'Найдите область напряжения или дискомфорта',
        duration: 3,
        type: 'somatic',
        tips: ['Выберите наиболее заметное ощущение', 'Описывайте качества: температура, плотность, движение']
      },
      {
        id: 'gentle-movement',
        title: 'Мягкое движение',
        instruction: 'Позвольте телу двигаться так, как оно хочет',
        duration: 8,
        type: 'movement',
        tips: ['Движения могут быть очень маленькими', 'Следуйте за импульсами тела']
      },
      {
        id: 'completion',
        title: 'Завершение',
        instruction: 'Почувствуйте, как энергия находит свое завершение',
        duration: 4,
        type: 'somatic',
        tips: ['Может появиться дрожь, зевота, глубокий вдох', 'Это признаки разрядки']
      }
    ],
    benefits: ['Разрядка травматической энергии', 'Восстановление естественной саморегуляции', 'Повышение стресса устойчивости'],
    contraindications: ['Недавние физические травмы', 'Серьезные психические заболевания']
  },

  // Техника эмоциональной свободы (EFT)
  {
    id: 'eft-tapping-addiction',
    name: 'EFT для зависимости',
    approach: 'EFT',
    description: 'Техника постукивания по акупунктурным точкам для снижения тяги',
    duration: 15,
    difficulty: 'beginner',
    steps: [
      {
        id: 'setup-statement',
        title: 'Установочная фраза',
        instruction: 'Постукивайте по точке каратэ, повторяя: "Хотя у меня есть тяга к алкоголю, я полностью принимаю себя"',
        duration: 2,
        type: 'somatic',
        tips: ['Повторите 3 раза', 'Говорите с чувством']
      },
      {
        id: 'sequence-round1',
        title: 'Первый раунд',
        instruction: 'Постукивайте по точкам, фокусируясь на проблеме: макушка, бровь, висок, под носом, подбородок, ключица, под рукой',
        duration: 3,
        type: 'somatic',
        tips: ['7-10 постукиваний по каждой точке', 'Говорите о проблеме']
      },
      {
        id: 'breathing-break',
        title: 'Дыхательная пауза',
        instruction: 'Сделайте глубокий вдох и оцените уровень тяги (0-10)',
        duration: 2,
        type: 'breathing'
      },
      {
        id: 'sequence-round2',
        title: 'Второй раунд',
        instruction: 'Повторите последовательность, фокусируясь на остаточной проблеме',
        duration: 3,
        type: 'somatic'
      },
      {
        id: 'positive-round',
        title: 'Позитивный раунд',
        instruction: 'Постукивайте, произнося позитивные утверждения о своей силе и свободе',
        duration: 3,
        type: 'somatic',
        tips: ['Сосредоточьтесь на желаемом состоянии', 'Почувствуйте позитивные эмоции']
      },
      {
        id: 'final-assessment',
        title: 'Финальная оценка',
        instruction: 'Снова оцените уровень тяги и общее самочувствие',
        duration: 2,
        type: 'cognitive'
      }
    ],
    benefits: ['Быстрое снижение тяги', 'Балансировка энергетической системы', 'Простота использования']
  },

  // Брейнспоттинг
  {
    id: 'brainspotting-basic',
    name: 'Базовый брейнспоттинг',
    approach: 'Brainspotting',
    description: 'Техника фокусировки взгляда для обработки травматических воспоминаний',
    duration: 25,
    difficulty: 'advanced',
    steps: [
      {
        id: 'identify-issue',
        title: 'Определение проблемы',
        instruction: 'Подумайте о ситуации, связанной с желанием выпить',
        duration: 3,
        type: 'cognitive',
        tips: ['Оцените уровень дистресса 0-10', 'Заметьте телесные ощущения']
      },
      {
        id: 'find-brainspot',
        title: 'Поиск брейнспота',
        instruction: 'Медленно двигайте глазами по горизонтали, найдите позицию с наибольшим откликом',
        duration: 5,
        type: 'somatic',
        tips: ['Ищите позицию, где ощущения усиливаются', 'Доверяйте телесным сигналам']
      },
      {
        id: 'maintain-focus',
        title: 'Удержание фокуса',
        instruction: 'Удерживайте взгляд на найденной позиции, позвольте процессу происходить',
        duration: 15,
        type: 'somatic',
        tips: ['Не пытайтесь контролировать процесс', 'Наблюдайте за изменениями в теле']
      },
      {
        id: 'integration',
        title: 'Интеграция',
        instruction: 'Мягко вернитесь в настоящий момент, заметьте изменения',
        duration: 2,
        type: 'cognitive'
      }
    ],
    benefits: ['Глубокая обработка травм', 'Доступ к подсознательным процессам', 'Интеграция опыта'],
    contraindications: ['Острые психотические состояния', 'Серьезная диссоциация без профессиональной поддержки']
  }
];

// Микротехники для ежедневного использования
export interface MicroTechnique {
  id: string;
  name: string;
  duration: number; // в секундах
  description: string;
  steps: string[];
  situation: string;
}

export const microTechniques: MicroTechnique[] = [
  {
    id: 'stop-technique',
    name: 'Техника СТОП',
    duration: 30,
    description: 'Быстрая техника для прерывания автоматических реакций',
    steps: [
      'СТОП - скажите себе "стоп" мысленно или вслух',
      'ВДОХ - сделайте глубокий вдох',
      'НАБЛЮДЕНИЕ - что происходит в теле и уме?',
      'ПАУЗА - дайте себе момент выбора',
      'ПРОДОЛЖЕНИЕ - выберите осознанное действие'
    ],
    situation: 'При внезапной тяге или импульсивности'
  },
  {
    id: 'five-four-three',
    name: 'Техника 5-4-3-2-1',
    duration: 60,
    description: 'Заземляющая техника для возвращения в настоящий момент',
    steps: [
      'Назовите 5 вещей, которые видите',
      'Назовите 4 вещи, которые можете потрогать',
      'Назовите 3 звука, которые слышите',
      'Назовите 2 запаха, которые чувствуете',
      'Назовите 1 вкус во рту'
    ],
    situation: 'При тревоге, панике или диссоциации'
  },
  {
    id: 'box-breathing',
    name: 'Квадратное дыхание',
    duration: 120,
    description: 'Дыхательная техника для быстрого успокоения',
    steps: [
      'Вдох на 4 счета',
      'Задержка на 4 счета',
      'Выдох на 4 счета',
      'Задержка на 4 счета',
      'Повторите цикл 4-8 раз'
    ],
    situation: 'При стрессе, тревоге или перед сложной ситуацией'
  }
];

export default {
  modernTherapeuticTechniques,
  microTechniques
};