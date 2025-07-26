
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ page session="false" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>캠핑AI - 채팅</title>
    <link rel="stylesheet" href="/resources/css/style.css" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
    <!-- 메인 채팅 앱 -->
    <div id="chatApp" class="chat-app">
        <!-- 사이드바 -->
        <div class="sidebar">
            <div class="sidebar-header">
                <div class="logo">
                    <i class="fas fa-campground"></i>
                    <span>캠핑AI</span>
                </div>
                <button class="new-chat-btn" onclick="startNewChat()">
                    <i class="fas fa-plus"></i>
                    	새 대화
                </button>                 
            </div>

            <div class="chat-history" id="chatHistory">
                <!-- 동적으로 생성됨 -->
            </div>

            <div class="sidebar-footer">
                <div class="user-info" id="userInfo">
                    <!-- 동적으로 생성됨 -->
                </div>
            </div>
        </div>

        <!-- 메인 채팅 영역 -->
        <div class="main-content">
            <div class="chat-header">
                <h2>캠핑 AI 챗봇</h2>
                <div class="header-right">
					<a id="apkDownloadLink" href="/downloadApk" style="display:none;"></a>
					<button onclick="downloadAPK()" class="apk-download-btn">
					    <i class="fas fa-download"></i> 다운로드
					</button>
					
                    <div class="chat-status">
                        <i class="fas fa-circle online"></i>
                        	온라인
                    </div>
                    <div class="user-menu" id="headerUserMenu">
                        <!-- 동적으로 생성됨 -->
                    </div>
                </div>
            </div>

            <div class="chat-messages" id="chatMessages">
                <!-- 환영 메시지 -->
                <div class="message ai-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-text">
                            	안녕하세요! 저는 캠핑 전문 AI입니다. 🏕️<br>
                            	캠핑에 관한 모든 질문에 답해드릴게요. 궁금한 것이 있으시면 언제든 물어보세요!
                        </div>
                        <div class="message-time">방금 전</div>
                    </div>
                </div>

                <!-- 제안 프롬프트 -->
                <div class="suggested-prompts" id="suggestedPrompts">
                    <div class="prompt-card" onclick="sendSuggestedPrompt('초보자를 위한 캠핑 준비물 리스트를 알려주세요')">
                        <i class="fas fa-backpack"></i>
                        <span>초보자 캠핑 준비물</span>
                    </div>
                    <div class="prompt-card" onclick="sendSuggestedPrompt('가족 캠핑하기 좋은 캠핑장을 추천해주세요')">
                        <i class="fas fa-users"></i>
                        <span>가족 캠핑장 추천</span>
                    </div>
                    <div class="prompt-card" onclick="sendSuggestedPrompt('캠핑에서 만들 수 있는 간단한 요리 레시피를 알려주세요')">
                        <i class="fas fa-utensils"></i>
                        <span>캠핑 요리 레시피</span>
                    </div>
                    <div class="prompt-card" onclick="sendSuggestedPrompt('캠핑 안전 수칙과 주의사항을 알려주세요')">
                        <i class="fas fa-shield-alt"></i>
                        <span>캠핑 안전 수칙</span>
                    </div>
                </div>
            </div>

            <div class="chat-input-container">
                <div class="chat-input">
                	<button class="voice-btn" title="음성 인식" onclick="startRecording()">
                        <i class="fas fa-microphone"></i>
                    </button>
                    <button class="file-btn" title="파일 첨부">
                        <i class="fas fa-paperclip"></i>
                    </button>
                    <input type="file" id="fileInput" style="display: none;" accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt" onchange="handleFileUpload(event)">
                    <input type="text" id="messageInput" placeholder="캠핑에 대해 무엇이든 물어보세요..." onkeypress="handleKeyPress(event)">
                    <button onclick="sendMessage()" class="send-btn">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                <div class="input-hint">
                    <i class="fas fa-lightbulb"></i>
                    팁: 구체적으로 질문할수록 더 정확한 답변을 받을 수 있습니다
                </div>
            </div>
        </div>
    </div>

    <script src="/resources/script/chatroom.js"></script>
    <script src="/resources/script/chat.js"></script>
    <script src="/resources/script/auth.js"></script>
    <script src="/resources/script/main.js"></script>
    <script src="/resources/script/voice.js"></script>
</body>
</html>
