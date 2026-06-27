# Release v1.0.0

Это автоматический релиз, созданный ассистентом.

Что включено в релиз:

- Добавлен workflow GitHub Actions: .github/workflows/android-release.yml
  - Триггер: push тега по шаблону `v*` (например `v1.0.0`) и ручной запуск (workflow_dispatch).
  - Действия: npm ci, npx expo prebuild -p android, Gradle assembleRelease, сборка APK для ABI armeabi-v7a и arm64-v8a, генерация тестового keystore и подпись APK, загрузка артефактов (`release-apks`).
  - Подписанные APK будут в артефакте с префиксом `signed-`.

Инструкции для создания тега и запуска сборки (локально):

1. Обновите локальную ветку main и убедитесь, что все изменения запушены в удалённый репозиторий:
   - git checkout main
   - git pull origin main
   - git push origin main

2. Создайте аннотированный тег и запушьте его:
   - git tag -a v1.0.0 -m "Release v1.0.0: Android CI workflow added, APKs for armeabi-v7a and arm64-v8a"
   - git push origin v1.0.0

   После push тега workflow автоматически запустится и соберёт APK.

3. Если хотите запустить workflow вручную через GitHub UI:
   - Откройте: Actions → Android Release APKs → Run workflow → выберите ветку `main` → Run workflow.

Где скачать APK:
- Откройте выполненный run workflow → секция Artifacts → скачайте `release-apks.zip`. Внутри: подписанные APK (`signed-...`).

Важные замечания:
- Подпись использует тестовый keystore с паролем `android` и alias `release`. Это не предназначено для production.
- Если сборка упадёт, откройте лог конкретного шага в Actions — я помогу проанализировать.

Если хотите, я могу:
- Подготовить текст релиза и подсказать команды для создания GitHub Release (через `gh` CLI или через веб-интерфейс).
- Или, если вы дадите мне доступ (через инструкции/токен), я могу создать тег и релиз от вашего имени — сейчас у меня нет прав вызывать API создания тегов/релизов.

---

Подпись:
GitHub Copilot Chat Assistant
