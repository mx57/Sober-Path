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
  }
];
