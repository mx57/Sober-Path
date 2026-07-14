
export interface SuccessStory {
  id: string;
  userName: string;
  daysSober: number;
  story: string;
  avatar?: string;
  date: string;
}

import AsyncStorage from '@react-native-async-storage/async-storage';

export type ReactionType = 'support' | 'agree' | 'hug' | 'like';

export interface PostPollOption {
  id: string;
  text: string;
  votes: number;
}

export interface PostPoll {
  question: string;
  options: PostPollOption[];
  userVote?: string;
}

export interface SupportPost {
  id: string;
  author: string;
  authorSoberDays?: number;
  content: string;
  likes: number;
  comments: number;
  timeAgo: string;
  category: 'motivation' | 'question' | 'support' | 'milestone' | 'daily_thread' | 'group_early' | 'group_work' | 'poll';
  reactions?: Record<ReactionType, number>;
  authorDaysSober?: number;
  poll?: PostPoll;
}

export interface PulseActivity {
  id: string;
  userName: string;
  type: 'post' | 'comment' | 'reaction' | 'milestone';
  text: string;
  timestamp: Date;
}

export interface ExpertQA {
  id: string;
  question: string;
  answer: string;
  expertName: string;
  expertTitle: string;
  date: string;
}

export interface CommunityGoal {
  id: string;
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  icon: string;
  color: string;
}

export interface GroupChallenge {
  id: string;
  title: string;
  description: string;
  participants: number;
  daysRemaining: number;
  category: string;
}

const POSTS_STORAGE_KEY = 'sober_path_community_posts';
const CHALLENGES_STORAGE_KEY = 'sober_path_community_challenges';

export class CommunityService {
  private static userPosts: SupportPost[] = [];
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
      },
      {
        id: '6',
        userName: 'Кирилл',
        daysSober: 180,
        story: 'Полгода назад я думал, что моя жизнь разрушена. Сегодня я занимаюсь любимым делом и полон планов. Трезвость — это лучший подарок себе.',
        avatar: 'https://i.pravatar.cc/150?u=kirill',
        date: '2024-03-26'
      },
      {
        id: '7',
        userName: 'Татьяна',
        daysSober: 90,
        story: 'Три месяца чистоты. Я заново учусь общаться, радоваться и справляться со стрессом. Это удивительный путь познания себя.',
        avatar: 'https://i.pravatar.cc/150?u=tanya',
        date: '2024-03-27'
      },
      {
        id: '8',
        userName: 'Вадим',
        daysSober: 1000,
        story: '1000 дней — это просто число, но за ним стоит колоссальная работа над собой. Жизнь стала честнее, ярче и глубже.',
        avatar: 'https://i.pravatar.cc/150?u=vadim',
        date: '2024-03-28'
      },
      {
        id: '9',
        userName: 'Михаил',
        daysSober: 450,
        story: 'Трезвость позволила мне снова сесть за руль и заняться воспитанием сына. Я пропустил много лет, но теперь я здесь и я трезв.',
        avatar: 'https://i.pravatar.cc/150?u=mikhail',
        date: '2024-04-01'
      },
      {
        id: '10',
        userName: 'Наталья',
        daysSober: 210,
        story: 'Мое здоровье восстановилось, кожа сияет, а тревога ушла. Жалею только об одном — что не сделала этого раньше.',
        avatar: 'https://i.pravatar.cc/150?u=nataly',
        date: '2024-04-05'
      },
      {
        id: '11',
        userName: 'Артур',
        daysSober: 60,
        story: 'Два месяца назад я был на дне. Сегодня я работаю и посещаю зал. Жизнь налаживается маленькими шагами.',
        avatar: 'https://i.pravatar.cc/150?u=artur',
        date: '2024-04-10'
      },
      {
        id: '12',
        userName: 'Светлана П.',
        daysSober: 150,
        story: 'Я открыла в себе талант к рисованию, который годами топила в вине. Трезвость — это время для творчества.',
        avatar: 'https://i.pravatar.cc/150?u=svetlana',
        date: '2024-04-12'
      },
      {
        id: '13',
        userName: 'Виктор С.',
        daysSober: 1200,
        story: 'Более трех лет чистоты. Свобода от зависимости — это самое ценное, что у меня есть. Помогаю новичкам и верю в каждого.',
        avatar: 'https://i.pravatar.cc/150?u=victor',
        date: '2024-04-15'
      }
    ];
  }

  static async getGroupChallenges(): Promise<(GroupChallenge & { isParticipating: boolean })[]> {
    const participatingIds = await this.getParticipatingChallenges();
    const challenges: GroupChallenge[] = [
      {
        id: 'c1',
        title: 'Марафон "Чистый Октябрь"',
        description: 'Продержимся весь месяц вместе! Еженедельные созвоны и поддержка.',
        participants: 450,
        daysRemaining: 12,
        category: 'Марафон'
      },
      {
        id: 'c2',
        title: 'Утренняя осознанность',
        description: 'Группа для тех, кто практикует медитацию каждое утро.',
        participants: 120,
        daysRemaining: 5,
        category: 'Привычки'
      },
      {
        id: 'c3',
        title: 'Шаги к здоровью',
        description: 'Проходим 10 000 шагов каждый день и делимся результатами.',
        participants: 85,
        daysRemaining: 20,
        category: 'Здоровье'
      }
    ];

    return challenges.map(c => ({
      ...c,
      isParticipating: participatingIds.includes(c.id),
      participants: participatingIds.includes(c.id) ? c.participants + 1 : c.participants
    }));
  }

  private static async getParticipatingChallenges(): Promise<string[]> {
    try {
      const stored = await AsyncStorage.getItem(CHALLENGES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  static async toggleChallengeParticipation(challengeId: string): Promise<boolean> {
    const participating = await this.getParticipatingChallenges();
    let updated: string[];
    let joined = false;

    if (participating.includes(challengeId)) {
      updated = participating.filter(id => id !== challengeId);
    } else {
      updated = [...participating, challengeId];
      joined = true;
    }

    await AsyncStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(updated));
    return joined;
  }

  static async getSupportPosts(): Promise<SupportPost[]> {
    const localPosts = await this.loadUserPosts();
    const staticPosts: SupportPost[] = [
      {
        id: 'p1',
        author: 'Мария',
        authorSoberDays: 30,
        content: 'Сегодня 30 дней! Не верится, что я дошла до этого рубежа. Спасибо всем за поддержку в этом чате.',
        likes: 24,
        comments: 5,
        timeAgo: '2ч назад',
        category: 'milestone'
      },
      {
        id: 'p2',
        author: 'Игорь',
        authorSoberDays: 45,
        content: 'Ребята, как вы справляетесь с тягой в пятницу вечером? Поделитесь своими проверенными способами.',
        likes: 12,
        comments: 18,
        timeAgo: '5ч назад',
        category: 'question'
      },
      {
        id: 'p3',
        author: 'Анна',
        authorSoberDays: 120,
        content: 'Помните, что один плохой день не перечеркивает ваш прогресс. Просто продолжайте идти вперед.',
        likes: 45,
        comments: 2,
        timeAgo: '8ч назад',
        category: 'motivation'
      },
      {
        id: 'p4',
        author: 'Виктор',
        authorSoberDays: 1100,
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
      },
      {
        id: 'p7',
        author: 'Николай',
        content: 'Вчера чуть не сорвался на дне рождения друга, но вовремя открыл это приложение и прочитал статью про триггеры. Помогло!',
        likes: 56,
        comments: 8,
        timeAgo: '1д назад',
        category: 'support'
      },
      {
        id: 'p8',
        author: 'Елена В.',
        content: 'Как вы объясняете друзьям, почему перестали пить? Особенно тем, кто постоянно уговаривает "ну одну-то можно".',
        likes: 19,
        comments: 32,
        timeAgo: '2д назад',
        category: 'question'
      },
      {
        id: 'p9',
        author: 'Артем',
        content: 'Полгода трезвости! За это время купил машину на деньги, которые раньше уходили на алкоголь и бары. Лучшая инвестиция.',
        likes: 124,
        comments: 15,
        timeAgo: '2д назад',
        category: 'milestone'
      },
      {
        id: 'p10',
        author: 'Ирина',
        content: 'Для тех, кто в начале пути: тяга — это просто мысль, а не приказ к действию. Вы сильнее своих мыслей.',
        likes: 72,
        comments: 4,
        timeAgo: '3д назад',
        category: 'motivation'
      },
      {
        id: 'p11',
        author: 'Павел',
        content: 'Снова 1-й день. Обидно, но я не сдаюсь. Главное — проанализировать ошибку и идти дальше.',
        likes: 48,
        comments: 21,
        timeAgo: '3д назад',
        category: 'support'
      },
      {
        id: 'p12',
        author: 'Оксана',
        content: 'Сегодня проснулась в 6 утра сама, без будильника и похмелья. Это потрясающее чувство!',
        likes: 95,
        comments: 6,
        timeAgo: '4д назад',
        category: 'milestone'
      },
      {
        id: 'p13',
        author: 'Макс',
        content: 'Кто-нибудь пробовал медитацию при острой тяге? Насколько реально помогает?',
        likes: 15,
        comments: 42,
        timeAgo: '5д назад',
        category: 'question'
      },
      {
        id: 'p14',
        author: 'Юлия',
        content: 'Ребята, спасибо за поддержку на прошлой неделе. Без вас я бы не справилась. Идем дальше!',
        likes: 88,
        comments: 10,
        timeAgo: '5д назад',
        category: 'support'
      },
      {
        id: 'p15',
        author: 'Денис',
        content: 'Заменил пиво по вечерам на безалкогольные коктейли и чтение. Мозг начал работать намного яснее.',
        likes: 64,
        comments: 7,
        timeAgo: '6д назад',
        category: 'motivation'
      },
      {
        id: 'p16',
        author: 'Марина',
        content: 'Год и два месяца. Жизнь заиграла новыми красками. Всем новичкам — терпения, оно того стоит!',
        likes: 210,
        comments: 34,
        timeAgo: '1нед назад',
        category: 'milestone'
      },
      {
        id: 'p17',
        author: 'Стас',
        content: 'Как вы боретесь с чувством вины за прошлое? Иногда оно накрывает так сильно, что хочется всё бросить.',
        likes: 42,
        comments: 56,
        timeAgo: '1ч назад',
        category: 'question'
      },
      {
        id: 'p18',
        author: 'Антон',
        content: 'Трезвость дает ясность, которую не заменит никакой допинг. Наслаждайтесь каждым моментом осознанности.',
        likes: 67,
        comments: 3,
        timeAgo: '3ч назад',
        category: 'motivation'
      },
      {
        id: 'p19',
        author: 'Олеся',
        content: 'Прошла первые 2 недели! Было трудно, но физически стало намного легче. Кто в начале пути — держитесь, станет лучше!',
        likes: 83,
        comments: 14,
        timeAgo: '4ч назад',
        category: 'milestone'
      },
      {
        id: 'p20',
        author: 'Аркадий',
        content: 'Начал писать дневник благодарности. Удивительно, как много хорошего мы не замечаем в погоне за суррогатами радости.',
        likes: 54,
        comments: 11,
        timeAgo: '6ч назад',
        category: 'support'
      },
      {
        id: 'p21',
        author: 'Юрий',
        content: 'Есть ли смысл идти на группы АА, если я интроверт и мне тяжело говорить на людях?',
        likes: 25,
        comments: 48,
        timeAgo: '9ч назад',
        category: 'question'
      },
      {
        id: 'p22',
        author: 'Валентина',
        content: 'Помните: тяга длится в среднем 15-20 минут. Если вы переживете этот пик, она отступит. Дышите.',
        likes: 92,
        comments: 9,
        timeAgo: '11ч назад',
        category: 'motivation'
      },
      {
        id: 'p23',
        author: 'Костя',
        content: 'Только вступил в группу "Первые шаги". Сегодня мой второй день. Поддержите, пожалуйста!',
        likes: 15,
        comments: 4,
        timeAgo: '10мин назад',
        category: 'group_early'
      },
      {
        id: 'p24',
        author: 'Наталья',
        content: 'В комнате "Работа и стресс" обсуждали как справляться с дедлайнами без бокала вина. Для меня открытие — короткая медитация прямо на рабочем месте.',
        likes: 28,
        comments: 6,
        timeAgo: '1ч назад',
        category: 'group_work',
        authorDaysSober: 185
      },
      {
        id: 'p25',
        author: 'Владимир',
        content: 'Вчера был на первой вечеринке без алкоголя. Оказалось, что танцевать трезвым гораздо веселее и совсем не стыдно утром!',
        likes: 34,
        comments: 7,
        timeAgo: '2ч назад',
        category: 'motivation',
        authorDaysSober: 42
      },
      {
        id: 'p26',
        author: 'Елена Михайловна',
        content: 'Сегодня ровно 5 лет трезвости. Жизнь стала спокойной, предсказуемой в хорошем смысле и полной истинного смысла. Держитесь, это того стоит.',
        likes: 156,
        comments: 23,
        timeAgo: '5ч назад',
        category: 'milestone',
        authorDaysSober: 1825
      },
      {
        id: 'p27',
        author: 'Sober Path Poll',
        content: 'Какой главный триггер мешает вам оставаться трезвым сегодня?',
        likes: 42,
        comments: 89,
        timeAgo: '1д назад',
        category: 'poll',
        poll: {
          question: 'Ваш главный триггер?',
          options: [
            { id: 'o1', text: 'Стресс на работе', votes: 156 },
            { id: 'o2', text: 'Одиночество', votes: 84 },
            { id: 'o3', text: 'Праздники/Компании', votes: 122 },
            { id: 'o4', text: 'Скука', votes: 67 }
          ]
        }
      },
      {
        id: 'p28',
        author: 'Sober Path Poll',
        content: 'Какое время суток для вас самое сложное?',
        likes: 31,
        comments: 56,
        timeAgo: '2д назад',
        category: 'poll',
        poll: {
          question: 'Сложное время суток?',
          options: [
            { id: 'o1', text: 'Утро (состояние)', votes: 45 },
            { id: 'o2', text: 'Обед (стресс)', votes: 23 },
            { id: 'o3', text: 'Вечер (привычка)', votes: 310 },
            { id: 'o4', text: 'Ночь (бессонница)', votes: 89 }
          ]
        }
      },
      {
        id: 'p29',
        author: 'Sober Path Poll',
        content: 'Что вам больше всего помогает в моменты тяги?',
        likes: 85,
        comments: 112,
        timeAgo: '3д назад',
        category: 'poll',
        poll: {
          question: 'Лучшая техника помощи?',
          options: [
            { id: 'o1', text: 'Дыхательные практики', votes: 145 },
            { id: 'o2', text: 'Звонок другу/наставнику', votes: 98 },
            { id: 'o3', text: 'Чтение статей/дневник', votes: 76 },
            { id: 'o4', text: 'Спорт/Прогулка', votes: 210 }
          ]
        }
      },
      {
        id: 'p30',
        author: 'Sober Path Poll',
        content: 'Как ваша семья относится к вашей трезвости?',
        likes: 64,
        comments: 43,
        timeAgo: '4д назад',
        category: 'poll',
        poll: {
          question: 'Поддержка семьи?',
          options: [
            { id: 'o1', text: 'Активно поддерживают', votes: 189 },
            { id: 'o2', text: 'Нейтрально', votes: 56 },
            { id: 'o3', text: 'Не верят (пока)', votes: 72 },
            { id: 'o4', text: 'Я не рассказывал(а)', votes: 34 }
          ]
        }
      },
      {
        id: 'p31',
        author: 'Sober Path Poll',
        content: 'Планируете ли вы полностью изменить круг общения?',
        likes: 29,
        comments: 78,
        timeAgo: '5д назад',
        category: 'poll',
        poll: {
          question: 'Смена окружения?',
          options: [
            { id: 'o1', text: 'Уже изменил(а)', votes: 112 },
            { id: 'o2', text: 'Планирую', votes: 95 },
            { id: 'o3', text: 'Оставил(а) только верных', votes: 156 },
            { id: 'o4', text: 'Не считаю нужным', votes: 42 }
          ]
        }
      }
    ];
    return [...localPosts, ...staticPosts.map(p => ({
      ...p,
      authorDaysSober: p.authorDaysSober || (p.author === 'Sober Path Bot' ? 9999 : Math.floor(Math.random() * 100))
    }))];
  }

  static async saveUserPost(post: SupportPost): Promise<void> {
    const posts = await this.loadUserPosts();
    const updated = [post, ...posts];
    await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updated));
  }

  static async addComment(postId: string): Promise<void> {
    const posts = await this.loadUserPosts();
    const updated = posts.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p);
    await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updated));
  }

  static async addReaction(postId: string, reaction: ReactionType): Promise<void> {
    const posts = await this.loadUserPosts();
    const updated = posts.map(p => {
      if (p.id === postId) {
        const reactions = p.reactions || { support: 0, agree: 0, hug: 0, like: 0 };
        reactions[reaction] = (reactions[reaction] || 0) + 1;
        return { ...p, reactions };
      }
      return p;
    });
    await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updated));
  }

  static async voteInPoll(postId: string, optionId: string): Promise<void> {
    const posts = await this.loadUserPosts();
    const updated = posts.map(p => {
      if (p.id === postId && p.poll && !p.poll.userVote) {
        const updatedOptions = p.poll.options.map(o =>
          o.id === optionId ? { ...o, votes: o.votes + 1 } : o
        );
        return { ...p, poll: { ...p.poll, options: updatedOptions, userVote: optionId } };
      }
      return p;
    });
    await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updated));
  }

  static getDailyThread(): SupportPost {
    const today = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    return {
      id: `daily_${new Date().toDateString()}`,
      author: 'Sober Path Bot',
      content: `🗓 Ежедневный поток поддержки: ${today}\n\nКак началось ваше утро? Поделитесь своими планами на сегодня и пожелайте друг другу трезвого дня! 👇`,
      likes: 156,
      comments: 42,
      timeAgo: 'Сегодня',
      category: 'daily_thread',
      reactions: { support: 45, agree: 12, hug: 38, like: 61 }
    };
  }

  static getCommunityPulse(): PulseActivity[] {
    return [
      { id: '1', userName: 'Александр', type: 'milestone', text: 'достиг 400 дней трезвости!', timestamp: new Date() },
      { id: '2', userName: 'Елена', type: 'reaction', text: 'поддержала пост Марии', timestamp: new Date() },
      { id: '3', userName: 'Дмитрий', type: 'comment', text: 'ответил в круге "Первые шаги"', timestamp: new Date() },
      { id: '4', userName: 'Светлана', type: 'post', text: 'поделилась новой историей успеха', timestamp: new Date() },
      { id: '5', userName: 'Игорь', type: 'reaction', text: 'поставил "Обнимаю" посту новичка', timestamp: new Date() },
    ];
  }

  private static async loadUserPosts(): Promise<SupportPost[]> {
    try {
      const stored = await AsyncStorage.getItem(POSTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load user posts', e);
      return [];
    }
  }

  static getCircles(): { id: string; name: string; icon: string; color: string; description: string }[] {
    return [
      { id: 'all', name: 'Все', icon: 'apps', color: '#2E7D4A', description: 'Общий поток всех сообщений сообщества.' },
      { id: 'motivation', name: 'Мотивация', icon: 'auto-awesome', color: '#FFC107', description: 'Цитаты, личные инсайты и всё, что дает силы двигаться дальше.' },
      { id: 'question', name: 'Вопросы', icon: 'help-outline', color: '#2196F3', description: 'Спрашивайте совета у тех, кто уже прошел через это.' },
      { id: 'support', name: 'Поддержка', icon: 'favorite-border', color: '#4CAF50', description: 'Взаимная помощь в трудные минуты.' },
      { id: 'milestone', name: 'Достижения', icon: 'emoji-events', color: '#E91E63', description: 'Делитесь своими победами, большими и маленькими!' },
      { id: 'group_early', name: 'Первые шаги', icon: 'child-care', color: '#FF5722', description: 'Комната для тех, у кого стаж трезвости меньше 30 дней.' },
      { id: 'group_work', name: 'Работа и стресс', icon: 'business-center', color: '#607D8B', description: 'Обсуждаем, как оставаться трезвым в рабочем ритме.' }
    ];
  }

  static getMentorshipAdvice(categoryId?: string): { author: string; text: string; role: string }[] {
    const allAdvice = [
      { category: 'all', author: 'Виктор', role: 'Наставник (3 года)', text: 'В моменты тяги просто скажите себе: "Не сейчас". Не "никогда", а просто не в эту минуту. Это снимает панику.' },
      { category: 'motivation', author: 'Марина', role: 'Наставник (5 лет)', text: 'Скука — это ваш мозг восстанавливается. Дайте ему время научиться радоваться простым вещам без допинга.' },
      { category: 'group_early', author: 'Алексей', role: 'Наставник (1.5 года)', text: 'Окружение решает всё. Если друзья не уважают ваш выбор — они не друзья.' },
      { category: 'question', author: 'Елена', role: 'Наставник (2 года)', text: 'Не бойтесь показаться слабым. Просить о помощи — это признак силы, а не поражения.' },
      { category: 'milestone', author: 'Сергей', role: 'Наставник (4 года)', text: 'Каждая победа заслуживает празднования. Новым кроссовкам или походу в кино — да, алкоголю — нет.' },
      { category: 'group_work', author: 'Ирина', role: 'Наставник (3.5 года)', text: 'Работа — это просто работа. Ваша трезвость всегда должна быть на первом месте в списке приоритетов.' },
      { category: 'support', author: 'Дмитрий', role: 'Наставник (6 лет)', text: 'Помогая другим, мы помогаем себе. Это один из главных принципов долгосрочной трезвости.' }
    ];

    if (!categoryId || categoryId === 'all') {
      return [allAdvice[0], allAdvice[1], allAdvice[6]];
    }

    return allAdvice.filter(a => a.category === categoryId || a.category === 'all');
  }

  static getCommunityGoals(): CommunityGoal[] {
    return [
      {
        id: 'g1',
        title: 'Общие дни трезвости',
        currentValue: 8420,
        targetValue: 10000,
        unit: 'дней',
        icon: 'wb-sunny',
        color: '#2E7D4A'
      },
      {
        id: 'g2',
        title: 'Взаимная поддержка',
        currentValue: 1250,
        targetValue: 2000,
        unit: 'ответов',
        icon: 'favorite',
        color: '#E91E63'
      }
    ];
  }

  static getExpertQA(): ExpertQA[] {
    return [
      {
        id: 'q16',
        question: 'Как вести себя на свадьбах и праздниках в первые месяцы?',
        answer: 'Заранее решите, что вы будете пить (сок, воду) и всегда держите свой стакан в руках. Подготовьте короткую фразу отказа ("Я сейчас на курсе детокса"). Если чувствуете сильный дискомфорт — уходите. Ваша трезвость важнее вежливости.',
        expertName: 'Игорь Петров',
        expertTitle: 'Аддиктолог',
        date: '2024-05-10'
      },
      {
        id: 'q17',
        question: 'Стоит ли начинать новые отношения сразу после отказа от алкоголя?',
        answer: 'Специалисты рекомендуют подождать хотя бы год. Первый год — это время для знакомства с самим собой "новым". Эмоциональные качели в отношениях могут стать серьезным триггером для срыва.',
        expertName: 'Марина Волкова',
        expertTitle: 'Семейный психолог',
        date: '2024-05-08'
      },
      {
        id: 'q18',
        question: 'Что делать, если семья продолжает напоминать о прошлых ошибках?',
        answer: 'Поймите их боль. Доверие разрушается мгновенно, а восстанавливается годами. Будьте последовательны. Спокойно скажите: "Я понимаю, что причинил вам боль, и я делаю всё, чтобы это не повторилось". Дела убедительнее слов.',
        expertName: 'Марина Волкова',
        expertTitle: 'Семейный психолог',
        date: '2024-05-05'
      },
      {
        id: 'q19',
        question: 'Как распознать приближающийся "сухой срыв"?',
        answer: 'Срыв начинается задолго до первого глотка. Признаки: раздражительность, нарушение сна, изоляция, мысли "я уже всё могу контролировать" или "один раз ничего не изменит". Если заметили это — срочно идите на группу или к терапевту.',
        expertName: 'Алексей Соколов',
        expertTitle: 'Клинический психолог',
        date: '2024-05-01'
      },
      {
        id: 'q20',
        question: 'Как работа влияет на риск рецидива?',
        answer: 'Перфекционизм и переработки — враги трезвости. Усталость (Tired в HALT) часто маскируется под тягу. Научитесь делать перерывы и не брать на себя слишком много. Трезвый сотрудник полезнее уставшего перфекциониста.',
        expertName: 'Ксения Эйчар',
        expertTitle: 'Корпоративный психолог',
        date: '2024-04-28'
      },
      {
        id: 'q1',
        question: 'Как бороться с бессонницей в первый месяц трезвости?',
        answer: 'Бессонница — частое явление. Рекомендуется соблюдать гигиену сна: ложиться в одно время, исключить гаджеты за час до сна и попробовать легкие травяные чаи. Если проблема сохраняется более 3 недель, стоит обратиться к врачу.',
        expertName: 'Д-р Анна Смирнова',
        expertTitle: 'Нарколог-психотерапевт',
        date: '2024-03-25'
      },
      {
        id: 'q2',
        question: 'Что делать, если все друзья продолжают употреблять?',
        answer: 'На первых этапах важно минимизировать контакты с пьющими компаниями. Объясните друзьям свое решение. Настоящие друзья поддержат вас. Ищите новые сообщества, где трезвость является нормой.',
        expertName: 'Игорь Петров',
        expertTitle: 'Аддиктолог',
        date: '2024-03-24'
      },
      {
        id: 'q3',
        question: 'Как восстановить доверие семьи после многих лет зависимости?',
        answer: 'Доверие восстанавливается делами, а не словами. Будьте последовательны в своей трезвости, берите на себя ответственность и будьте терпеливы. Это долгий процесс, который требует времени.',
        expertName: 'Марина Волкова',
        expertTitle: 'Семейный психолог',
        date: '2024-03-22'
      },
      {
        id: 'q4',
        question: 'Правда ли, что тяга к алкоголю никогда не проходит полностью?',
        answer: 'Тяга со временем становится намного слабее и реже. Она превращается в мимолетную мысль, которой легко управлять. Главное — выработать механизмы совладания (копинг-стратегии).',
        expertName: 'Алексей Соколов',
        expertTitle: 'Клинический психолог',
        date: '2024-03-20'
      },
      {
        id: 'q5',
        question: 'Как справляться с тревогой без привычного "допинга"?',
        answer: 'Изучайте техники заземления и дыхательные упражнения. Спорт и физическая активность также отлично помогают перерабатывать гормоны стресса естественным путем.',
        expertName: 'Елена Кузнецова',
        expertTitle: 'Психотерапевт',
        date: '2024-03-18'
      },
      {
        id: 'q6',
        question: 'Что означают сны об употреблении алкоголя?',
        answer: 'Такие сны (drugs dreams) — нормальная часть процесса детоксикации мозга. Мозг перерабатывает старый опыт и страхи. Это не значит, что вы хотите выпить или сорветесь. Относитесь к ним как к "бесплатной проверке": вы проснулись трезвым и почувствовали облегчение.',
        expertName: 'Артем Марков',
        expertTitle: 'Сомнолог, аддиктолог',
        date: '2024-04-02'
      },
      {
        id: 'q7',
        question: 'Можно ли заниматься интенсивным спортом в первый месяц?',
        answer: 'Важно не перегружать сердце, которое восстанавливается. Рекомендуются прогулки, йога, легкое плавание. Интенсивные нагрузки лучше вводить постепенно со второго месяца, обязательно следя за пульсом и общим состоянием.',
        expertName: 'Олег Спортивный',
        expertTitle: 'Реабилитолог',
        date: '2024-04-04'
      },
      {
        id: 'q8',
        question: 'Как наладить отношения с партнером, который еще помнит обиды?',
        answer: 'Дайте партнеру время. Ваши слова сейчас значат меньше, чем стабильные трезвые поступки. Не требуйте мгновенного прощения. Рекомендуется семейная терапия, чтобы научиться общаться без претензий и алкогольного контекста.',
        expertName: 'Марина Волкова',
        expertTitle: 'Семейный психолог',
        date: '2024-04-06'
      },
      {
        id: 'q9',
        question: 'Помогают ли антидепрессанты при отказе от алкоголя?',
        answer: 'Медикаментозная поддержка должна назначаться ТОЛЬКО врачом-психиатром. Иногда они необходимы для коррекции сопутствующей депрессии или тревожного расстройства, которые часто маскируются алкоголем.',
        expertName: 'Д-р Анна Смирнова',
        expertTitle: 'Нарколог-психотерапевт',
        date: '2024-04-08'
      },
      {
        id: 'q10',
        question: 'Как справляться с ПАВ-замещением (например, перееданием)?',
        answer: 'Это распространенная ловушка — замена одной зависимости другой. Мозг ищет дофамин. Старайтесь находить радость в нехимических источниках: хобби, общение, обучение. Если тяга к еде становится бесконтрольной, стоит проконсультироваться с терапевтом.',
        expertName: 'Игорь Петров',
        expertTitle: 'Аддиктолог',
        date: '2024-04-10'
      },
      {
        id: 'q11',
        question: 'Стоит ли рассказывать коллегам на работе о своей завязке?',
        answer: 'Это зависит от климата в коллективе. Если вы не уверены в поддержке, достаточно сказать, что вы выбрали здоровый образ жизни или проходите курс детокса. Вы не обязаны делиться подробностями своего диагноза.',
        expertName: 'Ксения Эйчар',
        expertTitle: 'Корпоративный психолог',
        date: '2024-04-12'
      },
      {
        id: 'q12',
        question: 'Почему после месяца трезвости наступила сильная апатия?',
        answer: 'Это так называемая "розовая фаза" сменилась реальностью. Мозг адаптируется к жизни без стимулятора. Базовый уровень дофамина временно низок. Это состояние пройдет, если продолжать работать над собой и поддерживать режим.',
        expertName: 'Алексей Соколов',
        expertTitle: 'Клинический психолог',
        date: '2024-04-14'
      },
      {
        id: 'q13',
        question: 'Как алкоголь влияет на психосоматику (боли в теле)?',
        answer: 'Алкоголь часто скрывал физический дискомфорт. При отказе могут "вылезти" старые зажимы, боли в спине, головные боли. Часто это проявления накопленного стресса. Рекомендуются массаж, растяжка и техники релаксации.',
        expertName: 'Елена Кузнецова',
        expertTitle: 'Психотерапевт',
        date: '2024-04-16'
      },
      {
        id: 'q14',
        question: 'Что делать, если тяга возникла спустя год трезвости?',
        answer: 'Это называется "сухой срыв" или постабстинентный синдром. Он может случиться на любом сроке из-за сильного стресса. Вернитесь к базовым инструментам: группы поддержки, дневник, техника HALT. Вы уже знаете, что делать.',
        expertName: 'Игорь Петров',
        expertTitle: 'Аддиктолог',
        date: '2024-04-18'
      },
      {
        id: 'q15',
        question: 'Как научиться радоваться праздникам без алкоголя?',
        answer: 'Нужно сформировать новые ассоциации. Праздник — это встреча, вкусная еда, смех, а не этанол. Подготовьте себе вкусные безалкогольные коктейли. Вы заметите, что общение становится качественнее, когда все остаются в ясном сознании.',
        expertName: 'Марина Волкова',
        expertTitle: 'Семейный психолог',
        date: '2024-04-20'
      }
    ];
  }
}
