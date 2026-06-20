import { PsychologyService } from '../services/PsychologyService';

describe('PsychologyService', () => {
  it('should return a non-empty list of techniques', () => {
    const techniques = PsychologyService.getTechniques();
    expect(techniques.length).toBeGreaterThan(0);
    expect(techniques[0]).toHaveProperty('id');
  });

  it('should return a technique by id', () => {
    const techniques = PsychologyService.getTechniques();
    const id = techniques[0].id;
    const technique = PsychologyService.getTechniqueById(id);
    expect(technique).toBeDefined();
    expect(technique?.id).toBe(id);
  });

  it('should return solfeggio sounds', () => {
    const sounds = PsychologyService.getSounds();
    expect(sounds.some(s => s.type === 'solfeggio')).toBe(true);
  });
});
