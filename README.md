# <p align="center">🏥 CareBridge</p>
<p align="center"><i>간호간병통합서비스 플랫폼</i></p>

<div align="center">
  <img src="./public/icons/logo.jpg" alt="CareBridge 로고" width="250">
  <h3>병원 입원 생활을 더 스마트하게, 더 편리하게</h3>
  
  [![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue.svg)](https://www.typescriptlang.org/)
  [![React Router](https://img.shields.io/badge/React_Router-6.x-CA4245.svg)](https://reactrouter.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC.svg)](https://tailwindcss.com/)
</div>

<hr>

## 📋 프로젝트 소개

> **CareBridge**는 입원 환자들의 병원 생활을 보다 편안하고 효율적으로 지원하는 **간호간병 통합 컨시어지 지원 플랫폼**입니다. 환자와 의료진 간의 원활한 의사소통을 도모하고, 병원의 의료 서비스 효율성을 극대화하며, 환자 만족도를 향상시키는 것을 목표로 합니다.

<br>

## 🎯 핵심 기능

<table style="width: 100%; border-collapse: separate; border-spacing: 0 10px;">
  <tr>
    <td width="50%" style="padding: 15px; vertical-align: top;">
      <h3>📱 스마트 콜벨 서비스</h3>
      <ul>
        <li>환자와 간병인이 메시지 기반으로 필요한 서비스(식사, 청소, 간호 등)를 요청하면 AI가 자동 분류</li>
        <li>요청 유형에 따라 적절한 처리 경로로 자동 분배:
          <ul>
            <li>콜벨 요청: 담당 의료진에게 즉시 전달</li>
            <li>일반 문의: 의료진과 실시간 소통</li>
            <li>의료 상담: ChatGPT LLM 기반 프롬프트를 통해 정보 자동 응답</li>
          </ul>
        </li>
      </ul>
    </td>
    <td width="50%" style="padding: 15px; vertical-align: top;">
      <h3>🏥 입원 생활 편의성 향상</h3>
      <ul>
        <li>입퇴원 절차, 병실 생활 정보, 의료 행정 서비스 등의 정보를 쉽게 확인</li>
        <li>환자 맞춤형 정보와 서비스를 원스톱으로 제공하는 통합 플랫폼</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td style="padding: 15px; vertical-align: top;">
      <h3>🩺 의료 정보 전달 효율화</h3>
      <ul>
        <li>진료 및 검사 일정, 검진 전 주의사항 등을 환자와 간병인에게 사전 알림</li>
        <li>의료진이 반복적인 문의와 절차에서 벗어나 본연의 의료 서비스에 집중할 수 있도록 지원</li>
      </ul>
    </td>
    <td style="padding: 15px; vertical-align: top;">
      <h3>📚 AI 기반 지능형 환자 케어 시스템</h3>
      <ul>
        <li>Chat GPT Open API 활용 챗봇으로 24시간 정보 제공 및 기초 상담 지원</li>
        <li>환자-의료진 간 실시간 소통 채널 확보</li>
        <li>병원 정보 및 저장된 데이터를 기반으로 맞춤형 응답 제공</li>
        <li>중요 정보의 실시간 푸시 알림 서비스</li>
      </ul>
    </td>
  </tr>
</table>

<br>

## 📱 화면 구성

```mermaid
graph TD
    A[로그인 화면] --> B{사용자 유형}
    B --> C[환자 인터페이스]
    B --> D[간호사 인터페이스]
    
    C --> C1[콜벨서비스 화면]
    C --> C2[병원 정보 확인]
    C --> C3[스케줄러 화면]
    
    D --> D1[환자 관리 대시보드]
    D --> D2[요청 모니터링]
    D --> D3[환자별 채팅]
    D --> D4[업무 일정 관리]

    style A fill:#f9f9f9,stroke:#333,stroke-width:1px,color:#000000,font-weight:bold
    style B fill:#e6f7ff,stroke:#333,stroke-width:1px,color:#000000,font-weight:bold
    style C fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000000,font-weight:bold
    style D fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000000,font-weight:bold
```

<br>

## 🛠️ 기술 스택

<div align="center">

| 분류 | 기술 |
|:---:|:---:|
| **프레임워크/라이브러리** | <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" height="25"> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" height="25"> |
| **라우팅** | <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" height="25"> |
| **상태 관리** | <img src="https://img.shields.io/badge/React_Context-61DAFB?style=for-the-badge&logo=react&logoColor=black" height="25"> <img src="https://img.shields.io/badge/React_Hooks-61DAFB?style=for-the-badge&logo=react&logoColor=black" height="25"> |
| **스타일링** | <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" height="25"> <img src="https://img.shields.io/badge/CSS_Modules-000000?style=for-the-badge&logo=css3&logoColor=white" height="25"> |
| **실시간 통신** | <img src="https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socketdotio&logoColor=white" height="25"> <img src="https://img.shields.io/badge/STOMP-000000?style=for-the-badge" height="25"> |
| **HTTP 통신** | <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" height="25"> |
| **알림 서비스** | <img src="https://img.shields.io/badge/Firebase_Cloud_Messaging-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" height="25"> |

</div>

<br>

## 📖 개발 프로세스

<div align="center">
<table>
  <tr>
    <td align="center"><b>1️⃣</b></td>
    <td>React Router를 사용하여 페이지 간 네비게이션 설정</td>
  </tr>
  <tr>
    <td align="center"><b>2️⃣</b></td>
    <td>간호사와 환자용 컴포넌트 및 페이지 구현</td>
  </tr>
  <tr>
    <td align="center"><b>3️⃣</b></td>
    <td>사용자 인증 및 상태 관리 구현</td>
  </tr>
  <tr>
    <td align="center"><b>4️⃣</b></td>
    <td>React 훅을 활용한 컴포넌트 상태 및 사이드 이펙트 관리</td>
  </tr>
  <tr>
    <td align="center"><b>5️⃣</b></td>
    <td>백엔드 API와의 연동 및 데이터 흐름 최적화</td>
  </tr>
</table>
</div>

<br>

## 🔗 백엔드 깃허브 저장소
<br>

링크 - https://github.com/carebridge-capstone/carebridge-backend

<br>

## 🧑‍💻 개발팀

<div align="center">
  
> CareBridge는 한양대학교 ERICA 캠퍼스 캡스톤 프로젝트로 개발되었습니다.

| 이름 | 역할 |
|:---:|:---:|
| 강민경 | 프론트엔드 개발 |
| 김채현 | 프론트엔드 개발 |
| 문민영 | 프론트엔드 개발 |
| 박세현 | 백엔드 개발 |
| 성동진 | 백엔드 개발 |

</div>

<br>

## 📄 라이센스

<div align="center">
  
본 프로젝트는 비공개 캡스톤 프로젝트로, 모든 권리가 개발팀에게 있습니다.

© 2024 CareBridge Team. All Rights Reserved.

</div>