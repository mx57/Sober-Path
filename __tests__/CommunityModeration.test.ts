import { CommunityService } from '../services/communityService';

describe('CommunityService Moderation', () => {
  it('should validate a good post', () => {
    const result = CommunityService.validatePost('Сегодня отличный день для прогулки!');
    expect(result.isValid).toBe(true);
  });

  it('should reject posts with forbidden keywords', () => {
    const result = CommunityService.validatePost('Ты просто тупой идиот!');
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('оскорбительные выражения');
  });

  it('should reject very short posts', () => {
    const result = CommunityService.validatePost('Хай');
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('короткий');
  });

  it('should reject posts with excessive CAPS', () => {
    const result = CommunityService.validatePost('СЕГОДНЯ ОЧЕНЬ ХОРОШИЙ ДЕНЬ ДЛЯ ТОГО ЧТОБЫ СДЕЛАТЬ ЧТО-ТО ПОЛЕЗНОЕ');
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('заглавных букв');
  });
});
