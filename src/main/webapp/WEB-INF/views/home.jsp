<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ page session="false" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>캠핑GPT - AI 캠핑 전문가</title>
    <link rel="stylesheet" href="/resources/css/style.css" />
<!--     <link href="https://cdnjs.cloudflare.org/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet"> -->
	<script src="https://code.jquery.com/jquery-3.6.0.min.js">
	</script>
	
	<% 
	/* 	 Object logincheck=request.getAttribute("logincheck");
	System.out.println("아아"+logincheck);  */
	 Object logincheckObj = request.getAttribute("logincheck");
	    String logincheck = logincheckObj != null ? logincheckObj.toString() : "0";
/* 	 Object logincheckObj = request.getAttribute("logincheck");
    String logincheck = logincheckObj != null ? logincheckObj.toString() : ""; */
	%>	
	
</head>
<body>
    <!-- 로그인 화면 -->
    <div id="authScreen" class="auth-screen">
        <div class="auth-container">
            <div class="auth-header">
                <i class="fas fa-campground"></i>
                <h1>캠핑GPT</h1>
                <p>AI 캠핑 전문가와 함께하는 완벽한 캠핑 여행</p>
            </div>
            <!-- 로그인 폼 -->
            <div id="loginForm" class="auth-form active">
                <h2>로그인</h2>
                <form action="/Login/signin" method="post" onsubmit="handleLogin(event)">
                    <div class="form-group">
                        <label for="loginEmail">이메일</label>
                        <input type="email" id="loginEmail" name="user_email" required>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">비밀번호</label>
                        <input type="password" id="loginPassword" name="password"required>
                    </div>
                    <!-- <input type="hidden" name="logincheck" value="0"> -->
                    <button type="submit" class="btn-primary">로그인</button>
                </form>
                <div class="auth-switch">
                    <p>계정이 없으신가요? <a href="#" onclick="showSignup()">회원가입</a></p>
                </div>
            </div>
            <!-- 회원가입 폼: signup.jsp -->
			<div id="signupForm" class="auth-form">
			    <h2>회원가입</h2>
			    <form action="/Member/signup" method="post">
			        <div class="form-group">
			            <label for="user_id">아이디</label>
			            <input type="text" id="user_id" name="user_id" required>
			        </div>
			        <div class="form-group">
			            <label for="name">이름</label>
			            <input type="text" id="name" name="name" required>
			        </div>
			        <div class="form-group">
			            <label for="email">이메일</label>
			            <input type="email" id="email" name="email">
			        </div>
			        <div class="form-group">
			            <label for="password">비밀번호</label>
			            <input type="password" id="password" name="password" required>
			        </div>
			        <button type="submit" class="btn-primary">회원가입</button>
			    </form>
			    <div class="auth-switch">
			        <p>이미 계정이 있으신가요? <a href="login.jsp">로그인</a></p>
			    </div>
			</div>

        </div>
    </div>
    <!-- 메인 채팅 앱 -->
    <div id="chatApp" class="chat-app">
        <!-- 사이드바 -->
        <div class="sidebar">
            <div class="sidebar-header">
                <div class="logo">
                    <i class="fas fa-campground"></i>
                    <span>캠핑GPT</span>
                </div>
                <button class="new-chat-btn" onclick="startNewChat()">
                    <i class="fas fa-plus"></i>
                    새 대화
                </button>
            </div>
            <div class="chat-history">
                <div class="chat-item active" onclick="selectChat(this)">
                    <i class="fas fa-mountain"></i>
                    <div class="chat-info">
                        <div class="chat-title">첫 캠핑 준비물</div>
                        <div class="chat-preview">텐트 추천해주세요</div>
                    </div>
                </div>
                <div class="chat-item" onclick="selectChat(this)">
                    <i class="fas fa-fire"></i>
                    <div class="chat-info">
                        <div class="chat-title">캠핑장 추천</div>
                        <div class="chat-preview">가족 캠핑장 찾아주세요</div>
                    </div>
                </div>
                <div class="chat-item" onclick="selectChat(this)">
                    <i class="fas fa-utensils"></i>
                    <div class="chat-info">
                        <div class="chat-title">캠핑 요리 레시피</div>
                        <div class="chat-preview">간단한 캠핑 요리</div>
                    </div>
                </div>
            </div>
            <div class="sidebar-footer">
                <div class="user-info">
                    <div class="user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-details">
                        <div class="user-name" id="userName">캠핑러버</div>
                        <div class="user-status">프리미엄</div>
                    </div>
                </div>
                <button class="logout-btn" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            </div>
        </div>
        <!-- 메인 채팅 영역 -->
        <div class="main-content">
            <div class="chat-header">
                <h2>캠핑 AI 전문가</h2>
                <div class="header-right">
                    <div class="chat-status">
                        <i class="fas fa-circle online"></i>
                        온라인
                    </div>
                    <div class="user-menu">
                        <button class="user-menu-btn" onclick="toggleUserMenu()">
                            <i class="fas fa-user-circle"></i>
                            <span id="headerUserName">캠핑러버</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="user-dropdown" id="userDropdown">
                            <div class="dropdown-item">
                                <i class="fas fa-user"></i>
                                <span>내 프로필</span>
                            </div>
                            <div class="dropdown-item">
                                <i class="fas fa-cog"></i>
                                <span>설정</span>
                            </div>
                            <div class="dropdown-divider"></div>
                            <div class="dropdown-item logout-item" onclick="logout()">
                                <i class="fas fa-sign-out-alt"></i>
                                <span>로그아웃</span>
                            </div>
                        </div>
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
                            안녕하세요! 저는 캠핑 전문 AI입니다. :야영:<br>
                            캠핑에 관한 모든 질문에 답해드릴게요. 궁금한 것이 있으시면 언제든 물어보세요!
                        </div>
                        <div class="message-time">방금 전</div>
                    </div>
                </div>
                <!-- 제안 프롬프트 -->
                <div class="suggested-prompts">
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
                    <input type="text" id="messageInput" placeholder="캠핑에 대해 무엇이든 물어보세요..." onkeypress="handleEnter(event)">
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
    <script src="/resources/script/script.js"></script>
    <script>
    const logincheck="<%=logincheck%>";
	if (logincheck=="1" ){
    function handleLogin(event) {
        event.preventDefault();
        //event.preventDefault();
    	
    	const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
    	
    	console.log("스크립트체크"+logincheck);
    	
    
    		
    		if (!email || !password) {
            alert('이메일과 비밀번호를 입력해주세요.');
            return;
        }

        // 임시 로그인 (실제로는 서버 인증 필요)
        currentUser = {
            id: Date.now(),
            name: email.split('@')[0],
            email: email
        };

        localStorage.setItem('campingGPTUser', JSON.stringify(currentUser));
        showChatApp();
    		
    		
    	
    	
        
        
    	}
    }
	else{
		console.log("logincheck 실패값: "+ logincheck);
	}
	
	function logout() {
		/* event.preventDefault(); */
	    if (confirm('정말 로그아웃 하시겠습니까?')) {
	        currentUser = null;
	        localStorage.removeItem('campingGPTUser');
	        localStorage.removeItem('campingGPTHistory');
	        showAuthScreen();
	        clearChat();
	        logincheck=0;
	        // 사용자 메뉴 닫기
	        const userMenu = document.querySelector('.user-menu');
	        if (userMenu) {
	            userMenu.classList.remove('open');
	            logincheck=0;
	        }
	        
	        alert('로그아웃되었습니다.');
	    }
	}
    </script>

</body>
</html>