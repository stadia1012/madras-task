## 프로젝트 소개
<img width="550" alt="image" src="https://github.com/user-attachments/assets/26f10981-546e-4884-ae3f-a8e99df8ddb9" />

파일 업로드 시 차단할 확장자를 관리하는 웹 애플리케이션입니다.
고정 확장자와 커스텀 확장자를 간편하게 등록/제거하여 보안 정책을 관리할 수 있습니다.

## 접속 주소
- URL: [http://114.203.210.152:7000/](http://114.203.210.152:7000/)

## 주요 기능
- 사전 정의된 고정 확장자를 체크박스 토글로 간편하게 활성화/비활성화
- 커스텀 확장자 추가 시 유효성 검증 (영문+숫자, 20자 길이 제한, 200개 제한)
- 중복 확장자 검사
- DB와 클라이언트 사이드 상태 동기화
- Toast 알림을 통한 즉각적 피드백

## 기술 스택
프론트엔드와 백엔드의 빠른 구현 및 테스트를 위해 Next.js 풀스택 프레임워크와 Tailwind 스타일링을 채택하였고, TypeScript를 통해 타입 안정성을 보장했습니다. Prisma ORM을 도입하여 타입에 안전한 쿼리 작성, 그리고 다양한 데이터베이스로의 전환 유연성을 확보했습니다.

#### 프론트엔드
- 프레임워크: Next.js 16 (App Router)
- 개발언어: TypeScript 5
- 스타일링: Tailwind CSS 4
- 상태관리: React Hooks (useState, useEffect, useRef)

#### 백엔드
- 프레임워크: Next.js API Routes (REST API)
- 개발언어: TypeScript 5
- ORM: Prisma 6.19
- 데이터베이스: MySQL 5.7

#### DevOps
- 패키지 관리: npm
- 형상 관리: Git

## 배포 환경
- 가상화: Hyper-V
- OS: Ubuntu 24.04 LTS
- 웹서버: Nginx
- 프로세스 관리: PM2

## 데이터베이스 스키마
- 관리를 위한 기본 키 `extension_id`와 중복 방지를 위한 유니크 제약조건을 가진 `extension_name`을 설정했습니다.
- 고정 확장자와 커스텀 확장자를 데이터베이스 레벨에서 구분하지 않고 프론트/백엔드에서 상수(const) 배열로 관리하여 스키마를 단순화하고 고정 확장자 목록의 유연한 수정이 가능하도록 설계했습니다.
- 확장자는 단순 문자열로 복구 필요성 낮아 Hard Delete를 채택했습니다.
```sql
CREATE TABLE extensions (
  `extension_id` int(11) NOT NULL AUTO_INCREMENT,
  `extension_name` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '확장자명',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`extension_id`),
  UNIQUE KEY `uk_extension_name` (`extension_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='차단 확장자';
```

## 프로젝트 구조
```
│  global.d.ts
│
├─app
│  │  favicon.ico
│  │  globals.css
│  │  layout.tsx
│  │  page.tsx                # 메인 페이지 (클라이언트 사이드)
│  ├─api
│  │  └─extensions
│  │      │  route.ts         # API Collection 엔드포인트
│  │      └─[name]
│  │              route.ts    # API Resource 엔드포인트
│  └─lib
│      └─api
├─components
│  │  defaultExtension.tsx
│  │  toast.tsx
│  │  toastContainer.tsx
│  └─icons
│          addIcon.tsx
│          deleteIcon.tsx
├─context
│      ToastContext.tsx
└─fonts
        PretendardVariable.woff2
```

## API 설계
- RESTful 원칙을 준수해 설계했습니다. Hard Delete로 처리하므로 업데이트(PUT) 없이 간단하게 구현됩니다.
```
GET    /api/extensions       - 목록 조회
POST   /api/extensions       - 추가
DELETE /api/extensions/:name - 삭제
```

## 주요 기능 및 특징
### 1. 고정/커스텀을 클라이언트 사이드에서 구분
- 데이터베이스 레벨에서 고정/커스텀 확장자를 구분하지 않고 전체 확장자를 조회한 후 클라이언트 사이드에서 구분합니다.
  (커스텀 확장자의 개수 제한은 서버 사이드에서 재검사)
- 이를 통해 스키마를 단순화하고 상수(const) 배열 수정을 통해 고정 확장자 목록을 유연하게 수정할 수 있습니다.
```typescript
/* file: /src/app/page.tsx */
/* 최대 차단 개수, 고정 확장자 목록 상수 */

// 최대 차단 개수
const maxLength = 200;
// 고정 확장자 목록
const fixedExtensions = ['bat', 'cmd', 'com', 'cpl', 'exe', 'scr', 'js'];
```
```typescript
/* file: /src/app/page.tsx */
/* 고정 확장자를 제외하고 커스텀 확장자만 알파벳 순으로 출력 */

{Array.from(totalExtensions)
  .filter((ext) => !fixedExtensions.includes(ext))
  .sort().map((ext) => (
    /* 생략 */
  ))}
```

### 2. 입력 데이터 유효성 검사
- 클라이언트 사이드에서 1차 검증을 수행하여 즉각적인 사용자 피드백을 제공하고, 불필요한 API 호출을 방지했습니다.
```typescript
/* file: /src/app/page.tsx [클라이언트 사이드] */

// 입력값 없음 검사
if (!newExt) {
  showToast('확장자를 입력해주세요.', 'error');
  inputEl.focus();
  return;
}

// 유효하지 않은 입력값 검사 (영문 + 숫자만 허용)
const extRegex = /^[a-z0-9]{1,20}$/;
if (!extRegex.test(newExt)) {
  showToast('확장자는 영문과 숫자만 입력해주세요.', 'error');
  inputEl.focus();
  return;
}

// 중복 검사
if (totalExtensions.has(newExt)) {
  showToast(`'${newExt}'는 이미 등록된 확장자입니다.`, 'error');
  return;
}

// 최대 개수(200) 검사
if (customLength >= 200) {
  showToast(`커스텀 확장자는 ${maxLength}개를 초과할 수 없습니다.`, 'error');
  return;
}
```
- 서버 사이드에서 실제 입력 데이터의 유효성을 재검사합니다.
```typescript
/* file: /src/app/api/extensions/route.ts [서버 사이드] */
// 입력값 검증
if (!extension_name || typeof extension_name !== 'string') {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      message: '확장자를 입력해주세요.',
    },
    { status: 400 }
  );
}

newExtName = extension_name.trim().toLowerCase();

// 유효성 검증 (영문 + 숫자, 1-20자)
const extRegex = /^[a-z0-9]{1,20}$/;
if (!extRegex.test(newExtName)) {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      message: '확장자는 영문과 숫자만 1-20자 이내로 입력해주세요.',
    },
    { status: 400 }
  );
}

// 커스텀 최대 개수 체크
const totalCount = await prisma.extensions.count({
  where: {
    extension_name: {
      notIn: fixedExtensions
    }
  }
});

if (totalCount >= maxLength) {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      message: `커스텀 확장자는 ${maxLength}개를 초과할 수 없습니다.`,
    },
    { status: 400 }
  );
}
/* ... 생략 ... */
// 데이터 중복 에러 처리
if (error instanceof Prisma.PrismaClientKnownRequestError) {
  if (error.code === 'P2002') {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: `'${newExtName}'는 이미 등록된 확장자입니다.`,
      },
      { status: 409 }
    );
  }
}
```

### 3. DB와 클라이언트 데이터 불일치 시 자동 재동기화
- 장시간 화면을 새로고침하지 않거나 다른 사용자가 동시에 수정하는 경우, 클라이언트와 DB 간 데이터 불일치가 발생할 수 있습니다. 이러한 상황에서 클라이언트 사이드의 유효성 검사을 통과했으나 서버에서 중복 등록/삭제 에러가 발생하면 Toast 알림으로 안내 후 `fetchAllExtensions()` 함수를 재실행하여 React State를 DB와 재동기화합니다.
- 관리자 메뉴이므로 동시접속자가 적고 실시간성이 중요하지 않아 효율적인 처리를 위해 WebSocket 방식과 매 API 요청마다의 데이터 동기화는 채택하지 않았습니다.

### 4. 프론트엔드 디자인
- 협업툴의 경우 실무자가 매일 사용하며, 솔루션 사용여부에 실무자의 의견이 크게 적용되기 때문에 UI/UX의 중요도가 높아 디테일하게 구현하였습니다.
#### 1) 기존 플로우와 유사한 디자인 테마 적용
<img width="600" height="472" alt="image" src="https://github.com/user-attachments/assets/c356aec7-016b-4a27-9ada-80bdb5c94561" />

  - 플로우의 테마 색상(보라색)을 적용하고 체크박스를 커스텀 적용했습니다. 헤더 부분은 플로우 관리자 메뉴 디자인을 copy 했습니다.
#### 2) Toast 알림을 통한 사용자 피드백
<img width="279" height="71" alt="image" src="https://github.com/user-attachments/assets/bd2620d7-d21f-4aab-a20a-1622d5e74301" />


<img width="296" height="63" alt="image" src="https://github.com/user-attachments/assets/e2e3c9c3-f24c-462f-a60b-6ca55663625e" />

- 확장자 등록/삭제 API 요청의 성공 또는 실패 시 Toast 알림을 통해 사용자에게 피드백합니다.

#### 3) 그외 사용자 친화적 인터랙션
- 엔터키를 통한 입력
- Tab 키를 통한 focus 이동
- hover/focus 시 색상 변경 등을 통한 시각적 피드백


  
