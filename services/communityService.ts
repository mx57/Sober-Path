
export interface SuccessStory {
  id: string;
  userName: string;
  daysSober: number;
  story: string;
  avatar?: string;
  date: string;
}

export interface SupportPost {
  id: string;
  author: string;
  content: string;
  likes: number;
  comments: number;
  timeAgo: string;
  category: 'motivation' | 'question' | 'support' | 'milestone';
}

export class CommunityService {
  static getSuccessStories(): SuccessStory[] {
    return [
      {
        id: '1',
        userName: 'Александр',
        daysSober: 365,
        story: 'Год трезвости изменил всё. Я вернулся в спорт и наладил отношения с семьей. Главное — не сдаваться в первые недели.',
        avatar: 'https://i.pravatar.cc/150?u=alex',
        date: '2024-03-20'
      },
      {
        id: '2',
        userName: 'Елена',
        daysSober: 120,
        story: 'Раньше я не верила, что можно радоваться утру без похмелья. Сейчас я чувствую себя живой как никогда.',
        avatar: 'https://i.pravatar.cc/150?u=elena',
        date: '2024-03-18'
      },
      {
        id: '3',
        userName: 'Дмитрий',
        daysSober: 500,
        story: 'Трезвость — это не ограничение, это свобода. Свобода выбора, как провести свой вечер и свою жизнь.',
        avatar: 'https://i.pravatar.cc/150?u=dmitry',
        date: '2024-03-15'
      },
      {
        id: '4',
        userName: 'Сергей',
        daysSober: 730,
        story: 'Два года назад я не мог представить себе и дня без выпивки. Сегодня я пробежал свой первый марафон. Трезвость открыла во мне суперсилы.',
        avatar: 'https://i.pravatar.cc/150?u=sergey',
        date: '2024-03-22'
      },
      {
        id: '5',
        userName: 'Ольга',
        daysSober: 30,
        story: 'Первый месяц был самым сложным, но поддержка в этом приложении помогла мне не сорваться в критические моменты. Иду дальше!',
        avatar: 'https://i.pravatar.cc/150?u=olga',
        date: '2024-03-24'
      }
    ];
  }

  static getSupportPosts(): SupportPost[] {
    return [
      {
        id: 'p1',
        author: 'Мария',
        content: 'Сегодня 30 дней! Не верится, что я дошла до этого рубежа. Спасибо всем за поддержку в этом чате.',
        likes: 24,
        comments: 5,
        timeAgo: '2ч назад',
        category: 'milestone'
      },
      {
        id: 'p2',
        author: 'Игорь',
        content: 'Ребята, как вы справляетесь с тягой в пятницу вечером? Поделитесь своими проверенными способами.',
        likes: 12,
        comments: 18,
        timeAgo: '5ч назад',
        category: 'question'
      },
      {
        id: 'p3',
        author: 'Анна',
        content: 'Помните, что один плохой день не перечеркивает ваш прогресс. Просто продолжайте идти вперед.',
        likes: 45,
        comments: 2,
        timeAgo: '8ч назад',
        category: 'motivation'
      },
      {
        id: 'p4',
        author: 'Виктор',
        content: 'Заметил, что тяга стала намного меньше после того, как я начал заниматься йогой по утрам. Всем советую!',
        likes: 31,
        comments: 4,
        timeAgo: '10ч назад',
        category: 'support'
      },
      {
        id: 'p5',
        author: 'Светлана',
        content: 'У кого-нибудь была бессонница на второй неделе? Как справлялись?',
        likes: 8,
        comments: 24,
        timeAgo: '12ч назад',
        category: 'question'
      },
      {
        id: 'p6',
        author: 'Максим',
        content: 'Сегодня ровно 100 дней! Чувствую себя другим человеком. Энергия зашкаливает!',
        likes: 89,
        comments: 12,
        timeAgo: '1д назад',
        category: 'milestone'
      }
    ];
  }
}
