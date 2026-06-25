import { PsychologyService } from '../services/PsychologyService';

describe('PsychologyService', () => {
  it('should return a non-empty list of techniques', () => {
    const result = PsychologyService.getTechniques();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty('id');
    }
  });

  it('should return a technique by id', () => {
    const result = PsychologyService.getTechniques();
    if (result.success) {
      const id = result.data[0].id;
      const techResult = PsychologyService.getTechniqueById(id);
      expect(techResult.success).toBe(true);
      if (techResult.success) {
        expect(techResult.data).toBeDefined();
        expect(techResult.data?.id).toBe(id);
      }
    }
  });

  it('should return solfeggio sounds', () => {
    const result = PsychologyService.getSounds();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.some(s => s.type === 'solfeggio')).toBe(true);
    }
  });
});
