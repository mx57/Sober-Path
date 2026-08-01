const { chromium } = require('playwright-chromium');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // Mobile view
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to root URL...');
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(4000);

  console.log('Taking screenshot of Welcome Screen...');
  await page.screenshot({ path: '/home/jules/verification/screenshots/1_welcome.png' });

  // Click "Начать путь"
  console.log('Clicking "Начать путь"...');
  await page.click('text="Начать путь"');
  await page.waitForTimeout(2000);

  console.log('Taking screenshot of Step 1...');
  await page.screenshot({ path: '/home/jules/verification/screenshots/2_step1.png' });

  // Click Next on Step 1
  console.log('Clicking "Next" or "Далее"...');
  const nextBtn = await page.$('text=/Next|Далее/i');
  if (nextBtn) {
    await nextBtn.click();
  } else {
    await page.click('div[role="button"]:has-text("Next")');
  }
  await page.waitForTimeout(2000);

  console.log('Taking screenshot of Step 2...');
  await page.screenshot({ path: '/home/jules/verification/screenshots/3_step2.png' });

  // Click "Improve health"
  console.log('Clicking a motivation chip...');
  const chip = await page.$('text=/Improve health|Улучшить здоровье/i');
  if (chip) {
    await chip.click();
  } else {
    await page.click('div[role="button"]');
  }
  await page.waitForTimeout(1000);

  console.log('Taking screenshot of Step 2 after selection...');
  await page.screenshot({ path: '/home/jules/verification/screenshots/4_step2_selected.png' });

  // Click Complete
  console.log('Clicking Complete...');
  const completeBtn = await page.$('text=/Complete|Готово|Завершить/i');
  if (completeBtn) {
    await completeBtn.click();
  } else {
    await page.click('div[role="button"]:has-text("Complete")');
  }
  await page.waitForTimeout(5000);

  console.log('Taking screenshot of Home tab...');
  await page.screenshot({ path: '/home/jules/verification/screenshots/5_home_tab.png' });

  // Navigate to Courses (Курсы) tab
  console.log('Navigating to Courses tab...');
  const coursesTab = await page.$('text=/Курсы|Courses|Academy/i');
  if (coursesTab) {
    await coursesTab.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/home/jules/verification/screenshots/9_courses_tab_main.png' });

    // Click "КПТ и ДПТ"
    console.log('Clicking "КПТ и ДПТ" tab...');
    const cbtTab = await page.$('text=/КПТ и ДПТ/i');
    if (cbtTab) {
      await cbtTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/home/jules/verification/screenshots/10_courses_tab_cbt.png' });
    }

    // Click "Глубокая терапия"
    console.log('Clicking "Глубокая терапия" tab...');
    const deepTab = await page.$('text=/Глубокая терапия/i');
    if (deepTab) {
      await deepTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/home/jules/verification/screenshots/11_courses_tab_deep.png' });
    }

    // Click "Звуковая терапия"
    console.log('Clicking "Звуковая терапия" tab...');
    const soundsTab = await page.$('text=/Звуковая терапия/i');
    if (soundsTab) {
      await soundsTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/home/jules/verification/screenshots/12_courses_tab_sounds.png' });
    }
  }

  // Navigate to AI Coach tab
  console.log('Navigating to AI Coach tab...');
  const coachTab = await page.$('text=/AI Coach|Коуч/i');
  if (coachTab) {
    await coachTab.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/home/jules/verification/screenshots/6_ai_coach_tab.png' });
  }

  // Navigate to Community (Общение) tab
  console.log('Navigating to Community tab...');
  const communityTab = await page.$('text=/Community|Общение/i');
  if (communityTab) {
    await communityTab.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/home/jules/verification/screenshots/8_community_tab.png' });
  }

  await context.close();
  await browser.close();
})();
