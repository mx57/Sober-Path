import { microCoursesDatabase } from '../services/microCoursesDatabase';

describe('Micro Courses Database', () => {
  it('should contain the social anxiety course with correct structure', () => {
    const course = microCoursesDatabase.find(c => c.id === 'social_anxiety_overcome');

    expect(course).toBeDefined();
    expect(course?.title).toBe('Преодоление социальной тревожности');
    expect(course?.category).toBe('growth');
    expect(course?.difficulty).toBe('intermediate');
    expect(course?.points).toBe(150);

    expect(course?.lessons).toBeDefined();
    expect(course?.lessons.length).toBe(3);

    const [lesson1, lesson2, lesson3] = course!.lessons;

    expect(lesson1.id).toBe('sa_l1');
    expect(lesson1.title).toBe('Что такое социальная тревожность?');
    expect(lesson1.type).toBe('text');
    expect(lesson1.duration).toBe(8);

    expect(lesson2.id).toBe('sa_l2');
    expect(lesson2.title).toBe('Техника заземления в компании');
    expect(lesson2.type).toBe('exercise');
    expect(lesson2.exerciseId).toBe('stop-technique');
    expect(lesson2.duration).toBe(12);

    expect(lesson3.id).toBe('sa_l3');
    expect(lesson3.title).toBe('Постепенное расширение зоны комфорта');
    expect(lesson3.type).toBe('text');
    expect(lesson3.duration).toBe(10);
  });
});
