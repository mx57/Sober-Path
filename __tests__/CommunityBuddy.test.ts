import { CommunityService, SoberBuddy } from '../services/communityService';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('CommunityService Sober Buddy ("Трезвый напарник") ', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('should return a non-empty list of potential buddies', () => {
    const list = CommunityService.getPotentialBuddies();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toHaveProperty('name');
    expect(list[0]).toHaveProperty('daysSober');
    expect(list[0]).toHaveProperty('avatar');
    expect(list[0]).toHaveProperty('status');
  });

  it('should manage buddy selection and unpairing correctly', async () => {
    // 1. Initial should be null
    let buddy = await CommunityService.getSelectedBuddy();
    expect(buddy).toBeNull();

    // 2. Select a buddy
    const potential = CommunityService.getPotentialBuddies()[0];
    await CommunityService.selectBuddy(potential);

    // 3. Get selected buddy
    buddy = await CommunityService.getSelectedBuddy();
    expect(buddy).not.toBeNull();
    expect(buddy!.id).toBe(potential.id);

    // 4. Remove buddy
    await CommunityService.removeBuddy();
    buddy = await CommunityService.getSelectedBuddy();
    expect(buddy).toBeNull();
  });

  it('should send daily support pulse and award +15 Karma', async () => {
    const potential = CommunityService.getPotentialBuddies()[0];
    await CommunityService.selectBuddy(potential);

    // Initial karma should be 0 (or default)
    let karma = await CommunityService.getUserKarma();
    expect(karma).toBe(0);

    // Send support pulse
    const success = await CommunityService.sendBuddyPulse();
    expect(success).toBe(true);

    // Karma should increase by 15
    karma = await CommunityService.getUserKarma();
    expect(karma).toBe(15);

    // Buddy lastPulseSent should be set to today
    const buddy = await CommunityService.getSelectedBuddy();
    expect(buddy!.lastPulseSent).toBe(new Date().toDateString());

    // Try sending again today - should fail and not award karma
    const secondTry = await CommunityService.sendBuddyPulse();
    expect(secondTry).toBe(false);

    karma = await CommunityService.getUserKarma();
    expect(karma).toBe(15); // Stays at 15
  });

  it('should return false when sending pulse with no selected buddy', async () => {
    const success = await CommunityService.sendBuddyPulse();
    expect(success).toBe(false);
  });
});
