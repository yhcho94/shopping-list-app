# 🛒 쇼핑 리스트 앱

간단한 쇼핑 리스트 웹 앱입니다. 별도의 서버 없이 브라우저에서 바로 실행됩니다.

## 기능

- 항목 추가 (버튼 클릭 또는 Enter 키)
- 항목 체크/체크 해제
- 항목 개별 삭제
- 완료된 항목 일괄 삭제
- localStorage를 통한 데이터 영속성 (새로고침 후에도 유지)

## 실행 방법

`shopping-list.html` 파일을 브라우저에서 직접 열면 됩니다.

## 테스트 실행

Playwright 기반 자동 테스트가 포함되어 있습니다.

```bash
npm install playwright
node test-shopping.js
```
