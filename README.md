# FBEye Processing Server

## 설치
1. Node.js 12 or later 설치
2. `npm install` 명령을 사용하여 의존성 패키지 설치

## 실행
- `npm start`

## 설정
- settings.json 파일을 수정하여 설정
### `net`: 네트워크 설정
- `key`: TLS에 사용할 개인키
- `cert`: TLS에 사용할 인증서
- `desktop.port`: 데스크탑 앱 연결을 위한 포트
- `mobile.port`: 모바일 앱 연결을 위한 포트
### `db`: 데이터베이스 설정
- `uri`: MongoDB 서버 주소
### `auth`: 사용자 인증 설정
- `size`: 인증 코드의 길이
- `interval`: 인증 코드 갱신 주기
### `crypto`: 암호화 설정
- `algorithm`: 암호화 알고리즘
- `length`: 암호화에 사용할 키의 길이
