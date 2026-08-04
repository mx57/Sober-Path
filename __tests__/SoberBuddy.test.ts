import { CommunityService } from '../services/communityService';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('CommunityService Sober Buddy', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('should return available buddies list', () => {
    const buddies = CommunityService.getAvailableBuddies();
    expect(buddies.length).toBe(3);
    expect(buddies[0].name).toBe('Андрей');
    expect(buddies[1].name).toBe('Марина');
  });

  it('should select and retrieve a sober buddy correctly', async () => {
    const buddies = CommunityService.getAvailableBuddies();
    await CommunityService.selectBuddy(buddies[0].id);

    const selected = await CommunityService.getSelectedBuddy();
    expect(selected).toBeDefined();
    expect(selected?.id).toBe(buddies[0].id);
    expect(selected?.name).toBe('Андрей');
  });

  it('should return null if no buddy is selected', async () => {
    const selected = await CommunityService.getSelectedBuddy();
    expect(selected).toBeNull();
  });

  it('should disconnect buddy and clear selection', async () => {
    const buddies = CommunityService.getAvailableBuddies();
    await CommunityService.selectBuddy(buddies[1].id);

    let selected = await CommunityService.getSelectedBuddy();
    expect(selected?.id).toBe(buddies[1].id);

    await CommunityService.disconnectBuddy();
    selected = await CommunityService.getSelectedBuddy();
    expect(selected).toBeNull();
  });

  it('should allow sending daily support pulse only once per day', async () => {
    const initialKarma = await CommunityService.getUserKarma();
    expect(initialKarma).toBe(0);

    // First pulse of the day should succeed
    const firstPulse = await CommunityService.sendSupportPulse();
    expect(firstPulse).toBe(true);

    const updatedKarma = await CommunityService.getUserKarma();
    expect(updatedKarma).toBe(15);

    // Second pulse of the day should fail
    const secondPulse = await CommunityService.sendSupportPulse();
    expect(secondPulse).toBe(false);

    const finalKarma = await CommunityService.getUserKarma();
    expect(finalKarma).toBe(15); // Karma remains unchanged
  });
});
