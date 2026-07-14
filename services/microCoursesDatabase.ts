import { MicroCourse } from './types';

export const microCoursesDatabase: MicroCourse[] = [
  {
    id: 'foundation_week_1',
    title: 'Первая неделя: Фундамент',
    description: 'Критически важные знания и техники для тех, кто только начинает свой путь в трезвости.',
    category: 'foundation',
    difficulty: 'beginner',
    icon: 'foundation',
    points: 100,
    lessons: [
      {
        id: 'f1_l1',
        title: 'Почему сейчас?',
        content: 'В этом уроке мы разберем физиологические изменения в первую неделю и как с ними справляться. Ваше тело начинает процесс очищения, и это может быть непросто, но крайне важно.',
        duration: 5,
        type: 'text'
      },
      {
        id: 'f1_l2',
        title: 'Метод HALT',
        content: 'Никогда не позволяйте себе становиться слишком: Hungry (Голодным), Angry (Злым), Lonely (Одиноким), Tired (Уставшим). Это главные триггеры срыва.',
        duration: 7,
        type: 'exercise',
        exerciseId: 'stop-technique'
      },
      {
        id: 'f1_l3',
        title: 'Ваше "Зачем"',
        content: 'Сформулируйте вашу главную причину отказа от алкоголя. Запишите ее и держите на виду.',
        duration: 10,
        type: 'text'
      }
    ]
  },
  {
    id: 'triggers_mastery',
    title: 'Работа с триггерами',
    description: 'Научитесь распознавать и обезвреживать ловушки вашего разума.',
    category: 'triggers',
    difficulty: 'intermediate',
    icon: 'warning',
    points: 150,
    lessons: [
      {
        id: 'tr_l1',
        title: 'Карта триггеров',
        content: 'Триггеры бывают внешние (места, люди) и внутренние (эмоции, мысли). Давайте составим вашу личную карту.',
        duration: 8,
        type: 'text'
      },
      {
        id: 'tr_l2',
        title: 'Техника "Серфинг по тяге"',
        content: 'Тяга подобна волне: она нарастает, достигает пика и неизбежно спадает. Ваша задача — "проехать" на ней, не поддаваясь.',
        duration: 12,
        type: 'exercise',
        exerciseId: 'box-breathing'
      }
    ]
  },
  {
    id: 'life_rebuild',
    title: 'Пересборка жизни',
    description: 'Как строить новую, наполненную смыслом жизнь без стимуляторов.',
    category: 'growth',
    difficulty: 'advanced',
    icon: 'auto-awesome',
    points: 200,
    lessons: [
      {
        id: 'lr_l1',
        title: 'Новые дофаминовые пути',
        content: 'Алкоголь "выжигает" рецепторы. Мы научимся получать удовольствие от простых и здоровых вещей снова.',
        duration: 10,
        type: 'text'
      },
      {
        id: 'lr_l2',
        title: 'Окружение и границы',
        content: 'Как общаться с пьющими друзьями и как выстраивать границы, которые защитят вашу трезвость.',
        duration: 15,
        type: 'text'
      }
    ]
  },
  {
    id: 'social_fluency',
    title: 'Социальные ситуации',
    description: 'Как оставаться трезвым на праздниках, свадьбах и в компаниях.',
    category: 'growth',
    difficulty: 'intermediate',
    icon: 'groups',
    points: 120,
    lessons: [
      {
        id: 'sc_l1',
        title: 'Первый выход в свет',
        content: 'Ваша первая вечеринка без алкоголя может вызвать тревогу. Это нормально. Главное — иметь план побега и знать, что вы будете пить вместо алкоголя.',
        duration: 8,
        type: 'text'
      },
      {
        id: 'sc_l2',
        title: 'Отказ без оправданий',
        content: 'Вам не нужно объяснять всем, почему вы не пьете. "Я сегодня не пью" — это полное предложение. Практикуйте уверенный тон.',
        duration: 6,
        type: 'exercise'
      },
      {
        id: 'sc_l3',
        title: 'Токсичное окружение',
        content: 'Если кто-то активно заставляет вас выпить после вашего отказа — это повод задуматься о качестве этой дружбы. Настоящие друзья уважают ваш выбор.',
        duration: 10,
        type: 'text'
      }
    ]
  },
  {
    id: 'emotional_intelligence',
    title: 'Эмоциональный интеллект',
    description: 'Развитие способности понимать свои чувства и управлять ими без алкоголя.',
    category: 'growth',
    difficulty: 'intermediate',
    icon: 'psychology',
    points: 180,
    lessons: [
      {
        id: 'ei_l1',
        title: 'Азбука чувств',
        content: 'Зависимость притупляет эмоции. Наша задача — заново научиться распознавать тонкие оттенки настроения.',
        duration: 8,
        type: 'text'
      },
      {
        id: 'ei_l2',
        title: 'Контейнирование эмоций',
        content: 'Упражнение: представьте свои чувства как объекты в безопасном контейнере. Вы наблюдаете за ними, но они не управляют вами.',
        duration: 12,
        type: 'exercise'
      },
      {
        id: 'ei_l3',
        title: 'Эмпатия к себе',
        content: 'Перестаньте быть своим самым строгим судьей. Учитесь состраданию к себе в моменты слабости.',
        duration: 10,
        type: 'text'
      }
    ]
  },
  {
    id: 'relapse_prevention_mindful',
    title: 'Осознанное предотвращение срывов',
    description: 'Продвинутые техники сохранения трезвости в долгосрочной перспективе.',
    category: 'foundation',
    difficulty: 'intermediate',
    icon: 'security',
    points: 150,
    lessons: [
      {
        id: 'rpm_l1',
        title: 'Анатомия срыва',
        content: 'Срыв начинается задолго до первого глотка. Мы изучим эмоциональные и поведенческие предвестники рецидива.',
        duration: 8,
        type: 'text'
      },
      {
        id: 'rpm_l2',
        title: 'Техника "Якорь"',
        content: 'Создание мощного ментального и физического напоминания о причинах вашей трезвости, которое сработает в критический момент.',
        duration: 12,
        type: 'exercise'
      },
      {
        id: 'rpm_l3',
        title: 'План экстренного реагирования',
        content: 'Составим пошаговый алгоритм действий при возникновении острой тяги, чтобы не полагаться на силу воли.',
        duration: 15,
        type: 'text'
      }
    ]
  }
];
