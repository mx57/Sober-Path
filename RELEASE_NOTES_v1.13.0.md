# Release Notes - v1.13.0 (Cycle 13) ⚡

## 🎮 Gamification & Retention
- **30-Day Quest Map**: A new interactive journey on the Home screen. Track your progress through critical milestones (Day 1, 3, 7, 14, 21, 30) and earn XP.
- **Enhanced Achievements**: Expanded achievement system with 11 unique badges tracking both streaks and total sobriety milestones. Includes a new progress visualization UI.

## 🤖 AI Coach Evolution
- **Weekly Analytics Reports**: AI now generates comprehensive reports every 7 days, analyzing your mood trends, identified triggers, and key successes.
- **Interactive Weekly Roadmap**: A dedicated widget on the Home screen that syncs with the AI Coach to help you stay focused on your personalized recovery goals.
- **Performance Optimization**: Chat and challenges now use `React.memo` for butter-smooth interactions.

## 💬 Community & Communication
- **Anonymous Mode**: Users can now post questions and stories anonymously to discuss sensitive topics with full privacy.
- **Thematic Circles**: Added a new "Anonymous" room and polished existing community circles with verified mentorship advice.
- **Reaction System v2**: Improved visual feedback for community reactions (Support, Agree, Hug, Like).

## 🎨 UI/UX & Theming
- **Dynamic Themes Integrated**: Fully operational theme engine with 4 presets: Nature (Default Green), Ocean (Blue), Sunset (Orange), and Minimal (Grey).
- **Accessibility Improvements**: Added ARIA-like attributes and better support for screen readers.
- **Android Stability**: Fixed navigation issues related to the hardware back button in all Modals.

## 🛠 Technical Updates
- **Automated Android Signing**: APKs generated via GitHub Actions are now automatically signed using a persistent release configuration.
- **Reliable Exports**: Switched to `lottie-react-native` for high-performance animations across all platforms.
- **Clean Codebase**: Fixed runtime styling errors and removed legacy Apollo/Supabase dependencies.

---
*Stay Sober. Stay Strong.*
