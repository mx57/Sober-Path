import { success, failure, Result } from './types';

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

export interface AdvancedTherapy {
  id: string;
  name: string;
  type: 'trauma' | 'addiction' | 'anxiety' | 'depression' | 'self_esteem';
  method: 'emdr' | 'ifs' | 'eft' | 'somatic' | 'neurofeedback' | 'brainspotting' | 'havening';
  description: string;
  instructions: string[];
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  contraindications: string[];
  benefits: string[];
}

export interface TherapeuticSound {
  id: string;
  name: string;
  frequency: string;
  type: 'solfeggio' | 'binaural' | 'isochronic' | 'chakra' | 'planetary';
  purpose: string;
  duration: number;
  instructions: string;
}

export interface ModernTechnique {
  id: string;
  title: string;
  category: 'cbt' | 'dbt' | 'act' | 'mindfulness' | 'emdr' | 'somatic' | 'ifs' | 'eft' | 'polyvagal' | 'neurofeedback';
  description: string;
  instructions: string[];
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  benefits: string[];
}

export interface MindfulnessExercise {
  id: string;
  title: string;
  description: string;
  duration?: number;
}

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
      { id: 'identify-thought', title: 'Определение мысли', instruction: 'Выберите навязчивую мысль о выпивке', type: 'assessment', examples: ['"Я не справлюсь без алкоголя"'] },
      { id: 'notice-thought', title: 'Наблюдение за мыслью', instruction: 'Скажите себе: "Я замечаю, что у меня есть мысль, что..."', type: 'intervention' },
      { id: 'thank-mind', title: 'Благодарность уму', instruction: 'Скажите: "Спасибо, ум, за эту мысль"', type: 'intervention' }
    ],
    benefits: ['Снижение эмоционального воздействия мыслей', 'Увеличение психологической гибкости']
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
      { id: 'life-domains', title: 'Сферы жизни', instruction: 'Рассмотрите ключевые сферы: семья, карьера, здоровье...', type: 'assessment' },
      { id: 'funeral-exercise', title: 'Упражнение "Похороны"', instruction: 'Представьте свои похороны через 80 лет. Что бы вы хотели услышать?', type: 'reflection' }
    ],
    benefits: ['Ясное понимание жизненных приоритетов', 'Сильная мотивация']
  },
  {
    id: 'behavioral-activation',
    name: 'Поведенческая активация',
    category: 'behavioral_experiments',
    description: 'Планирование и выполнение значимых активностей вместо употребления алкоголя',
    difficulty: 'beginner',
    duration: 25,
    evidenceBase: 'Доказанная эффективность при депрессии и зависимостях',
    steps: [],
    benefits: ['Улучшение настроения', 'Замещение времени, проводимого с алкоголем']
  }
];

export const advancedTherapies: AdvancedTherapy[] = [
  {
    id: '1',
    name: 'EMDR: Десенсибилизация движениями глаз',
    type: 'trauma',
    method: 'emdr',
    description: 'Техника переработки травматических воспоминаний через билатеральную стимуляцию',
    duration: 30,
    difficulty: 'advanced',
    contraindications: ['Острые психотические состояния', 'Серьезные сердечно-сосудистые заболевания', 'Эпилепсия'],
    benefits: ['Снижение интенсивности травматических воспоминаний', 'Уменьшение симптомов ПТСР'],
    instructions: [
      'Сядьте удобно, определите беспокоящее воспоминание',
      'Начните медленные движения глазами слева направо (24 раза)',
      'После каждого подхода делайте глубокий вдох'
    ]
  },
  {
    id: '2',
    name: 'IFS: Терапия внутренних семейных систем',
    type: 'addiction',
    method: 'ifs',
    description: 'Работа с различными частями личности для достижения внутренней гармонии',
    duration: 45,
    difficulty: 'intermediate',
    contraindications: ['Диссоциативные расстройства без сопровождения'],
    benefits: ['Понимание внутренних конфликтов', 'Развитие самолидерства'],
    instructions: [
      'Закройте глаза и сосредоточьтесь на желании выпить',
      'Представьте эту часть как отдельную личность или образ',
      'Спросите: "Что ты пытаешься для меня сделать?"'
    ]
  },
  {
    id: '3',
    name: 'EFT: Техника эмоциональной свободы',
    type: 'addiction',
    method: 'eft',
    description: 'Простукивание акупунктурных точек для освобождения от негативных эмоций',
    duration: 15,
    difficulty: 'beginner',
    contraindications: [],
    benefits: ['Быстрое снижение тревоги и стресса'],
    instructions: [
      'Определите проблему и оцените интенсивность эмоций (0-10)',
      'Простукайте ребро ладони: "Хотя у меня есть эта проблема, я полностью принимаю себя"',
      'Простукайте точки: макушка, брови, сбоку от глаз, под носом...'
    ]
  }
];

export const therapeuticSounds: TherapeuticSound[] = [
  { id: '1', name: 'Частота 174 Гц - Основа', frequency: '174 Hz', type: 'solfeggio', purpose: 'Освобождение от физической боли и стресса', duration: 1800, instructions: 'Слушайте через наушники' },
  { id: '2', name: 'Частота 528 Гц - Любовь', frequency: '528 Hz', type: 'solfeggio', purpose: 'Исцеление ДНК и трансформация', duration: 2700, instructions: 'Положите руки на сердце' },
  { id: '10', name: 'Бинауральные биты 10 Гц', frequency: '10 Hz Alpha', type: 'binaural', purpose: 'Расслабление и креативность', duration: 1800, instructions: 'Используйте стереонаушники' }
];

export const modernTechniques: ModernTechnique[] = [
  {
    id: 'm1',
    title: 'CBT: Техника "Мысленный суд"',
    category: 'cbt',
    description: 'Когнитивно-поведенческая техника для оспаривания иррациональных мыслей',
    duration: 15,
    difficulty: 'intermediate',
    benefits: ['Изменение автоматических мыслей'],
    instructions: ['Запишите мысль', 'Представьте себя прокурором', 'В роли судьи вынесите вердикт']
  },
  {
    id: 'm2',
    title: 'DBT: Навык "STOP"',
    category: 'dbt',
    description: 'Диалектическая поведенческая терапия для управления кризисными моментами',
    duration: 5,
    difficulty: 'beginner',
    benefits: ['Быстрое снижение интенсивности эмоций'],
    instructions: ['S - СТОП', 'T - ТЕМПЕРАТУРА', 'O - ОРГАНИЗМ', 'P - ПРОГРЕССИВНАЯ релаксация']
  }
];

export const mindfulnessExercises: MindfulnessExercise[] = [
  {
    id: 'breath-awareness',
    title: 'Осознание дыхания',
    description: 'Простая практика наблюдения за вдохом и выдохом для возвращения в настоящий момент',
    duration: 5
  },
  {
    id: 'body-scan',
    title: 'Сканирование тела',
    description: 'Постепенное внимание к ощущениям в каждой части тела для снятия напряжения',
    duration: 10
  },
  {
    id: 'loving-kindness',
    title: 'Любящая доброта',
    description: 'Медитация направленная на развитие сострадания к себе и окружающим',
    duration: 15
  },
  {
    id: 'urge-surfing',
    title: 'Серфинг тяги',
    description: 'Техника наблюдения за импульсом как за волной, которая неизбежно проходит',
    duration: 10
  }
];

export const PsychologyService = {
  getTechniques: (): Result<ModernTechnique[]> => {
    try {
        return success([...advancedCBTTechniques, ...modernTechniques] as any);
    } catch (e) {
        return failure(e as Error);
    }
  },

  getTherapies: (): Result<AdvancedTherapy[]> => {
    try {
        return success(advancedTherapies);
    } catch (e) {
        return failure(e as Error);
    }
  },

  getSounds: (): Result<TherapeuticSound[]> => {
    try {
        return success(therapeuticSounds);
    } catch (e) {
        return failure(e as Error);
    }
  },

  getDistortions: () => {
    return [
        { id: 'all-or-nothing', name: 'Черно-белое мышление', description: 'Видение ситуаций только в крайностях' }
    ];
  },

  getTechniqueById: (id: string): Result<ModernTechnique | undefined> => {
    try {
        const tech = [...advancedCBTTechniques, ...modernTechniques].find(t => t.id === id);
        return success(tech as any);
    } catch (e) {
        return failure(e as Error);
    }
  }
};
