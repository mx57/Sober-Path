
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
      }
    ];
  }
}
