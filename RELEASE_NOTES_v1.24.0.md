# Release Notes v1.24.0

## 🤖 AI Coach & Interactive Exercises
- **New CBT Exercise `anxiety_management`**: Integrated a 5-step guided exercise for quick grounding and anxiety control during panic attacks or high emotional stress.
- **Dynamic Assistant Triggers**: The AI Coach now immediately identifies anxiety and panic keywords ('тревожность', 'паника', 'паническая атака', 'тревога') and suggests launching the grounding technique.

## 📚 Content & Educational Materials
- **New Micro-course `anxiety_and_panic_control`**: Added a 3-lesson micro-course ("Управление тревогой и паникой") with interactive grounding techniques.
- **Knowledge Base Expansion**: Added 5 articles (IDs 103–107) covering panic attack neurobiology, somatic grounding, panic in social/work settings, and breathing CO2 balance.

## 💬 Community & Peer Support
- **Quick Support Action**: Added `sendQuickSupport` in `CommunityService` rewarding users with +15 Karma points for sending peer encouragement to anxious members.

## 🛠 Quality & Verification
- 100% test coverage with 55 unit tests passing across all suites.
- Exported and verified Expo Web build with screenshot captured at `assets/screenshots/cycle24_verification.png`.
