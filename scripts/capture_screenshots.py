from playwright.sync_api import sync_playwright

def capture_screenshots(page):
    page.goto("http://localhost:8081")
    page.wait_for_timeout(10000)

    # Screenshot 1: Welcome/Onboarding
    page.screenshot(path="assets/screenshots/1_welcome.png")

    # Navigate to Home
    if page.get_by_role("link", name="Начать путь").is_visible():
        page.get_by_role("link", name="Начать путь").click()
        page.wait_for_timeout(3000)

    # Screenshot 2: Home Page
    page.screenshot(path="assets/screenshots/2_home.png")

    # Navigate to AI Coach (Tabs) - assuming icons or labels
    # Let's try to click by text if available
    try:
        page.get_by_text("Коуч").click()
        page.wait_for_timeout(2000)
        page.screenshot(path="assets/screenshots/3_ai_coach.png")
    except:
        pass

    # Navigate to Analytics
    try:
        page.get_by_text("Анализ").click()
        page.wait_for_timeout(2000)
        page.screenshot(path="assets/screenshots/4_analytics.png")
    except:
        pass

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 390, 'height': 844}) # iPhone 12/13 size
        try:
            capture_screenshots(page)
        finally:
            browser.close()
