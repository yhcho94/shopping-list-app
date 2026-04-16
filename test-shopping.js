const { chromium } = require('playwright');
const path = require('path');

const FILE_URL = 'file:///' + path.resolve(__dirname, 'shopping-list.html').replace(/\\/g, '/');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ ${message}`);
    failed++;
  }
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 400 });
  const page = await browser.newPage();

  // localStorage 초기화 후 페이지 로드
  await page.goto(FILE_URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  console.log('\n🧪 쇼핑 리스트 자동 테스트 시작\n');

  // ─────────────────────────────────────────
  console.log('📋 [1] 초기 상태 확인');
  const emptyMsg = await page.locator('.empty').isVisible();
  assert(emptyMsg, '빈 상태 메시지가 표시됨');

  const summaryInit = await page.locator('#summaryText').innerText();
  assert(summaryInit === '항목 없음', `초기 요약 텍스트: "${summaryInit}"`);

  // ─────────────────────────────────────────
  console.log('\n📋 [2] 아이템 추가 테스트');

  await page.fill('#itemInput', '사과');
  await page.click('button:has-text("추가")');
  let items = await page.locator('.item').count();
  assert(items === 1, '사과 추가됨 (총 1개)');

  await page.fill('#itemInput', '바나나');
  await page.keyboard.press('Enter');
  items = await page.locator('.item').count();
  assert(items === 2, '바나나 추가됨 (총 2개)');

  await page.fill('#itemInput', '우유');
  await page.keyboard.press('Enter');
  items = await page.locator('.item').count();
  assert(items === 3, '우유 추가됨 (총 3개)');

  await page.fill('#itemInput', '   ');
  await page.click('button:has-text("추가")');
  items = await page.locator('.item').count();
  assert(items === 3, '공백 입력은 추가되지 않음 (여전히 3개)');

  const summaryAfterAdd = await page.locator('#summaryText').innerText();
  assert(summaryAfterAdd.includes('총 3개'), `요약 텍스트 업데이트: "${summaryAfterAdd}"`);

  // ─────────────────────────────────────────
  console.log('\n📋 [3] 체크 기능 테스트');

  await page.locator('.item').first().locator('input[type="checkbox"]').click();
  const isChecked = await page.locator('.item').first().locator('input[type="checkbox"]').isChecked();
  assert(isChecked, '첫 번째 항목 체크됨');

  const hasCheckedClass = await page.locator('.item').first().evaluate(el => el.classList.contains('checked'));
  assert(hasCheckedClass, '체크된 항목에 .checked 클래스 적용됨');

  const summaryChecked = await page.locator('#summaryText').innerText();
  assert(summaryChecked.includes('완료 1개'), `완료 카운트 반영: "${summaryChecked}"`);

  await page.locator('.item').first().locator('input[type="checkbox"]').click();
  const isUnchecked = await page.locator('.item').first().locator('input[type="checkbox"]').isChecked();
  assert(!isUnchecked, '첫 번째 항목 체크 해제됨');

  // ─────────────────────────────────────────
  console.log('\n📋 [4] 삭제 기능 테스트');

  await page.locator('.item').first().locator('.delete-btn').click();
  items = await page.locator('.item').count();
  assert(items === 2, '항목 삭제됨 (총 2개 남음)');

  // ─────────────────────────────────────────
  console.log('\n📋 [5] 완료 항목 일괄 삭제 테스트');

  const allItems = await page.locator('.item').count();
  for (let i = 0; i < allItems; i++) {
    await page.locator('.item').nth(i).locator('input[type="checkbox"]').click();
  }

  await page.click('.clear-btn');
  items = await page.locator('.item').count();
  assert(items === 0, '완료 항목 모두 삭제됨 (0개 남음)');

  const emptyAfterClear = await page.locator('.empty').isVisible();
  assert(emptyAfterClear, '삭제 후 빈 상태 메시지 표시됨');

  // ─────────────────────────────────────────
  console.log('\n📋 [6] localStorage 유지 테스트');

  await page.fill('#itemInput', '새 항목');
  await page.keyboard.press('Enter');
  await page.reload();

  items = await page.locator('.item').count();
  assert(items === 1, '새로고침 후에도 항목이 유지됨 (localStorage)');

  // ─────────────────────────────────────────
  console.log('\n' + '─'.repeat(40));
  console.log(`\n결과: ${passed + failed}개 테스트 중 ✅ ${passed}개 통과 / ❌ ${failed}개 실패\n`);

  if (failed === 0) {
    console.log('🎉 모든 테스트 통과!\n');
  } else {
    console.log(`⚠️  ${failed}개 테스트 실패\n`);
  }

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();