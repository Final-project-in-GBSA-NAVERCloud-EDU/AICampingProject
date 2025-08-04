1조

# AICAMPING

## 🌲 소개 (Introduction)

AICAMPING은 사용자가 AI에게 자연어로 캠핑 관련 질문을 던지면,
캠핑 장소, 날씨 정보, 추천 장비, 음식 등을 받아볼 수 있는 **AI 캠핑 추천 플랫폼**입니다.

## 💻 기술 스택 (Tech Stack)

* **언어 및 프레임워크**: Java, Spring Framework
* **ORM/데이터 처리**: MyBatis
* **개발 환경**: Eclipse IDE
* **클라우드 서비스**: NAVER Cloud Platform (NCP)
* **데이터베이스**: Cloud for MySQL (NCP 기반)
* **빌드 도구**: Maven
* **AI 기술**: Vector DB 기반 RAG (Retrieval-Augmented Generation), AI Agent 활용

## ✨ 주요 기능 (Features)

* 🤖 **AI 챗 기반 캠핑 추천 시스템**

  * 날씨 정보 기반 장소 추천
  * 추천 장비 리스트 제공
  * 음식 추천 기능
* 🔐 **회원가입 및 로그인 기능**

  * 사용자별 Q\&A 대화 저장 기능
  * 마이페이지에서 대화내역 확인 가능

## 🏗️ 아키텍처 (Architecture)
<img width="1640" height="900" alt="Image" src="https://github.com/user-attachments/assets/c301d847-e4be-4aae-b76a-9d0b3d43ff52" />


## 🚀 실행 방법 (Getting Started)

* 웹 브라우저를 통해 챗봇 인터페이스에 접속합니다.

* 캠핑 관련 질문을 자유롭게 입력하면, AI가 날씨 정보, 장비 추천, 캠핑장 정보를 응답합니다.

* 회원가입 및 로그인 후 챗봇과의 대화가 자동으로 저장되며, 마이페이지에서 이전 대화를 확인할 수 있습니다.

## 📦 프로젝트 구조 (Structure)
📁 src/

┣ 📁 main/

┃ ┣ 📁 java/

┃ ┃ ┣ 📁 com.ncloud.ai/          # 컨트롤러 (Chat, Home, Login 등)

┃ ┃ ┣ 📁 com.ncloud.common/      # 공통 유틸리티 (Json 핸들링 등)

┃ ┃ ┣ 📁 com.ncloud.dao/         # DAO 및 DAOImpl 클래스

┃ ┃ ┣ 📁 com.ncloud.domain/      # VO (Value Object)

┃ ┃ ┣ 📁 com.ncloud.openfeign/   # 외부 API 호출용 FeignClient

┃ ┃ ┗ 📁 com.ncloud.service/     # 서비스 및 서비스 구현체

┃ ┣ 📁 resources/

┃ ┃ ┣ 📁 mappers/                # MyBatis 매퍼 XML

┃ ┗ 📁 webapp/

┃   ┣ 📁 download/               # APK 파일

┃   ┣ 📁 resources/

┃   ┃ ┣ 📁 css/

┃   ┃ ┗ 📁 script/               # JavaScript (chat, main 등)

┃   ┗ 📁 WEB-INF/

┃     ┣ 📁 spring/              # Spring 설정 XML

┃     ┗ 📁 views/               # JSP 페이지 (chat, login, signup 등)

┗ 📁 test/                      # 테스트 코드


## 📌 기타 사항

> 해당 프로젝트는 NAVER Cloud AI 기술 기반의 기능 확장을 고려 중입니다.

---

추가 내용은 차후 업데이트 예정입니다
