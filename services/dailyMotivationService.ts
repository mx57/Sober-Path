
export interface MotivationQuote {
  id: string;
  text: string;
  author: string;
  category: 'motivation' | 'wisdom' | 'discipline' | 'hope';
}

export interface RecoveryTip {
  id: string;
  title: string;
  content: string;
  icon: string;
}

export class DailyMotivationService {
  private static quotes: MotivationQuote[] = [
    {
      id: 'q1',
      text: 'Величайшая победа — это победа над самим собой.',
      author: 'Платон',
      category: 'wisdom'
    },
    {
      id: 'q2',
      text: 'Неважно, как медленно вы идете, пока вы не остановитесь.',
      author: 'Конфуций',
      category: 'discipline'
    },
    {
      id: 'q3',
      text: 'Трезвость не открывает врата рая, чтобы впустить вас туда, она открывает врата ада, чтобы выпустить вас оттуда.',
      author: 'Анонимный источник',
      category: 'motivation'
    },
    {
      id: 'q4',
      text: 'Ваше будущее создается тем, что вы делаете сегодня, а не завтра.',
      author: 'Роберт Кийосаки',
      category: 'discipline'
    },
    {
      id: 'q5',
      text: 'Трудности часто готовят обычного человека к необычной судьбе.',
      author: 'К.С. Льюис',
      category: 'hope'
    }
  ];

  private static tips: RecoveryTip[] = [
    {
      id: 't1',
      title: 'Пейте больше воды',
      content: 'Гидратация помогает вымывать токсины и улучшает когнитивные функции.',
      icon: 'local-drink'
    },
    {
      id: 't2',
      title: 'Практикуйте дыхание',
      content: 'Когда чувствуете тягу, сделайте 10 глубоких вдохов. Это снизит уровень стресса.',
      icon: 'air'
    },
    {
      id: 't3',
      title: 'Планируйте вечер',
      content: 'Заранее придумайте занятие на вечер пятницы, чтобы избежать старых привычек.',
      icon: 'event'
    }
  ];

  static getDailyQuote(): MotivationQuote {
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return this.quotes[dayOfYear % this.quotes.length];
  }

  static getDailyTip(): RecoveryTip {
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return this.tips[dayOfYear % this.tips.length];
  }
}
