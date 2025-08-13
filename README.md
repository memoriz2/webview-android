# 웹뷰 앱 (WebView App)

React Native + Expo로 만든 안드로이드 웹뷰 애플리케이션입니다.

## 🚀 계획된 기능

- [ ] **웹뷰** - 웹사이트를 앱 내에서 표시
- [ ] **푸시알림** - 사용자에게 알림 전송
- [ ] **사용자 권한 동의** - 필요한 권한 요청 및 관리

## 🛠️ 기술 스택

- **React Native** - 크로스 플랫폼 모바일 앱 개발
- **Expo** - React Native 개발 플랫폼
- **TypeScript** - 타입 안전성
- **Android** - 타겟 플랫폼

## 📱 앱 구조

```
App.tsx          # 메인 앱 컴포넌트
├── Header       # 앱 헤더 (제목, 부제목)
├── Content      # 메인 컨텐츠 영역
└── Footer       # 앱 푸터
```

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 시작

```bash
npm start
```

### 3. 안드로이드에서 실행

```bash
npm run android
```

## 📁 프로젝트 구조

```
WebViewApp/
├── App.tsx              # 메인 앱 컴포넌트
├── app.json             # Expo 설정
├── package.json         # 의존성 관리
├── tsconfig.json        # TypeScript 설정
├── assets/              # 이미지, 아이콘 등
├── android/             # 안드로이드 네이티브 코드
└── node_modules/        # 설치된 패키지들
```

## 🔧 개발 단계

### 1단계: 기본 앱 구조 ✅

- 깔끔한 UI 구조
- 헤더, 컨텐츠, 푸터 레이아웃
- 기본 스타일링

### 2단계: 웹뷰 기능 (예정)

- react-native-webview 설치
- 웹뷰 컴포넌트 구현
- 네비게이션 컨트롤

### 3단계: 푸시알림 (예정)

- 알림 권한 요청
- 로컬 알림 구현
- 원격 알림 설정

### 4단계: 사용자 권한 (예정)

- 카메라, 위치 등 권한 요청
- 권한 상태 관리
- 사용자 동의 UI

## 📱 빌드

### APK 빌드 (예정)

```bash
# 안드로이드 프로젝트 생성
npx expo prebuild --platform android

# APK 빌드
cd android
./gradlew assembleRelease
```

## 🎯 목표

- **안정성**: 크래시 없는 안정적인 앱
- **성능**: 빠른 로딩과 부드러운 동작
- **사용성**: 직관적이고 사용하기 쉬운 UI
- **확장성**: 새로운 기능 추가가 쉬운 구조

## 📄 라이선스

MIT License
