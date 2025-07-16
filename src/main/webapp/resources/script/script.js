// 전역 변수
let currentUser = null;
let chatHistory = [];
let currentChatId = null;
let chatRooms = [];
let isFirstMessage = true;

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 앱 초기화
function initializeApp() {
    // 저장된 사용자 정보 확인
    const savedUser = localStorage.getItem('campingGPTUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showChatApp();
    } else {
        showAuthScreen();
    }
}

// 인증 화면 표시/숨김
function showAuthScreen() {
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('chatApp').style.display = 'none';
}

function showChatApp() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('chatApp').style.display = 'flex';

    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('headerUserName').textContent = currentUser.name;
    }

    loadChatHistory();
}

// 로그인/회원가입 폼 전환
function showLogin() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('signupForm').classList.remove('active');
}

function showSignup() {
    document.getElementById('signupForm').classList.add('active');
    document.getElementById('loginForm').classList.remove('active');
}

// 로그인 처리


// 회원가입 처리
function handleSignup(event) {
    event.preventDefault();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!name || !email || !password || !confirmPassword) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

    if (password !== confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }

    if (password.length < 6) {
        alert('비밀번호는 6자 이상이어야 합니다.');
        return;
    }

    // 임시 회원가입 (실제로는 서버에 저장 필요)
    currentUser = {
        id: Date.now(),
        name: name,
        email: email
    };

    localStorage.setItem('campingGPTUser', JSON.stringify(currentUser));
    alert('회원가입이 완료되었습니다!');
    showChatApp();
}

// 사용자 메뉴 토글
function toggleUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    userMenu.classList.toggle('open');
}

// 로그아웃
function logout() {
    if (confirm('정말 로그아웃 하시겠습니까?')) {
        currentUser = null;
        localStorage.removeItem('campingGPTUser');
        localStorage.removeItem('campingGPTHistory');
        showAuthScreen();
        clearChat();

        // 사용자 메뉴 닫기
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            userMenu.classList.remove('open');
        }
        
        alert('로그아웃되었습니다.');
    }
}

// 새 채팅 시작
function startNewChat() {
//    currentChatId = Date.now().toString();
    currentChatId = Math.floor(Math.random() * 2147483647).toString();
    isFirstMessage = true;
    clearChat();
    showWelcomeMessage();
    
    // 모든 채팅방 비활성화
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
}

// 새 채팅방 생성
function createNewChatRoom(firstMessage) {
//    const chatId = Date.now().toString();
    const chatId = Math.floor(Math.random() * 2147483647).toString();
    currentChatId = chatId;
    
    // 채팅방 제목 생성 (첫 메시지의 처음 20글자)
    const title = firstMessage.length > 20 ? 
        firstMessage.substring(0, 20) + '...' : firstMessage;
    
    // 새 채팅방 객체 생성
    const newChatRoom = {
        id: chatId,
        title: title,
        preview: firstMessage,
        timestamp: new Date(),
        icon: getChatIcon(firstMessage)
    };
    
    // 채팅방 배열에 추가 (맨 앞에)
    chatRooms.unshift(newChatRoom);
    
    // 사이드바에 채팅방 추가
    addChatRoomToSidebar(newChatRoom);
    
    // 로컬 스토리지에 저장
    saveChatRooms();
}

// 사이드바에 채팅방 추가
function addChatRoomToSidebar(chatRoom) {
    const chatHistory = document.querySelector('.chat-history');
    
    // 새 채팅방 HTML 생성
    const chatItemHTML = `
        <div class="chat-item active" onclick="selectChat(this)" data-chat-id="${chatRoom.id}">
            <i class="${chatRoom.icon}"></i>
            <div class="chat-info">
                <div class="chat-title">${chatRoom.title}</div>
                <div class="chat-preview">${chatRoom.preview}</div>
            </div>
        </div>
    `;
    
    // 모든 기존 채팅방 비활성화
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 새 채팅방을 맨 위에 추가
    chatHistory.insertAdjacentHTML('afterbegin', chatItemHTML);
}

// 채팅 아이콘 결정
function getChatIcon(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('준비물') || lowerMessage.includes('장비')) {
        return 'fas fa-backpack';
    } else if (lowerMessage.includes('캠핑장') || lowerMessage.includes('추천')) {
        return 'fas fa-map-marked-alt';
    } else if (lowerMessage.includes('요리') || lowerMessage.includes('레시피') || lowerMessage.includes('음식')) {
        return 'fas fa-utensils';
    } else if (lowerMessage.includes('안전') || lowerMessage.includes('주의')) {
        return 'fas fa-shield-alt';
    } else if (lowerMessage.includes('텐트')) {
        return 'fas fa-campground';
    } else if (lowerMessage.includes('불') || lowerMessage.includes('화재')) {
        return 'fas fa-fire';
    } else {
        return 'fas fa-comments';
    }
}

// 채팅방 저장
function saveChatRooms() {
    localStorage.setItem('campingGPTRooms', JSON.stringify(chatRooms));
}

// 채팅방 로드
function loadChatRooms() {
    const savedRooms = localStorage.getItem('campingGPTRooms');
    if (savedRooms) {
        chatRooms = JSON.parse(savedRooms);
        renderChatRooms();
    }
}

// 채팅방 렌더링
function renderChatRooms() {
    const chatHistory = document.querySelector('.chat-history');
    chatHistory.innerHTML = '';
    
    chatRooms.forEach((room, index) => {
        const isActive = index === 0 ? 'active' : '';
        const chatItemHTML = `
            <div class="chat-item ${isActive}" onclick="selectChat(this)" data-chat-id="${room.id}">
                <i class="${room.icon}"></i>
                <div class="chat-info">
                    <div class="chat-title">${room.title}</div>
                    <div class="chat-preview">${room.preview}</div>
                </div>
            </div>
        `;
        chatHistory.insertAdjacentHTML('beforeend', chatItemHTML);
    });
}

// 채팅 기록 로드
function loadChatHistory() {
    const savedHistory = localStorage.getItem('campingGPTHistory');
    if (savedHistory) {
        chatHistory = JSON.parse(savedHistory);
    }

    // 채팅방 로드
    loadChatRooms();

    // 채팅방이 없으면 새 채팅 시작
    if (chatRooms.length === 0) {
        startNewChat();
    }
}

// 채팅 선택
function selectChat(element) {
    // 이전 선택 제거
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });

    // 현재 선택 표시
    element.classList.add('active');

    // 채팅 ID 가져오기
    const chatId = element.getAttribute('data-chat-id');
    currentChatId = chatId;
    isFirstMessage = false;

    // 해당 채팅 내용 로드 (임시로 새 채팅으로 처리)
    clearChat();
    showWelcomeMessage();
}

// 채팅 화면 초기화
function clearChat() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
}

// 환영 메시지 표시
function showWelcomeMessage() {
    const chatMessages = document.getElementById('chatMessages');

    const welcomeHTML = `
        <div class="message ai-message">
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-text">
                    안녕하세요! 저는 캠핑 전문 AI입니다. 🏕️<br>
                    캠핑에 관한 모든 질문에 답해드릴게요. 궁금한 것이 있으시면 언제든 물어보세요!
                </div>
                <div class="message-time">${getCurrentTime()}</div>
            </div>
        </div>

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
    `;

    chatMessages.innerHTML = welcomeHTML;
}

// 제안 프롬프트 전송
function sendSuggestedPrompt(message) {
    document.getElementById('messageInput').value = message;
    sendMessage();
}

function getCurrentDateTimeString() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 0-based
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

//현재 선택된 채팅방 ID 가져오기
function getCurrentChatRoomId() {
    return currentChatId;
}

//새로 생성된 채팅방 ID 가져오기 (마지막으로 생성된 것)
function getLastCreatedChatRoomId() {
    const activeChatItem = document.querySelector('.chat-item.active');
    if (activeChatItem) {
        return activeChatItem.getAttribute('data-chat-id');
    }
    return currentChatId;
}
// 메시지 전송
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    const savedUser = localStorage.getItem('campingGPTUser');
    const currentTime = getCurrentDateTimeString(); 
    
    // 현재 선택된 채팅방 ID
    const selectedChatRoomId = getCurrentChatRoomId();
    // 새로 생성된 채팅방 ID (첫 메시지인 경우)
    const newChatRoomId = isFirstMessage ? createNewChatRoom(message) : null;
    
    if (!message) return;
    
    let userId = null;
    try {
        const parsedUser = JSON.parse(savedUser);
        userId = parsedUser.id;
    } catch (e) {
        console.error("사용자 정보 파싱 실패", e);
        return;
    }
    
    if(userId == null){
    	userId = "guest"
    }

    // 사용자 메시지 추가
    addMessage(message, 'user');

    // 입력 필드 초기화
    input.value = '';

    // 제안 프롬프트 숨기기
    const suggestedPrompts = document.querySelector('.suggested-prompts');
    if (suggestedPrompts) {
        suggestedPrompts.style.display = 'none';
    }

    $.ajax({
        url: '/ChatLibrary/sendMessage',
        method: 'POST',
        dataType :  "JSON",
        data: { message: message,
        	savedUser : userId,
        	currentTime : currentTime,
        	selectedChatRoomId : selectedChatRoomId,
        	newChatRoomId : newChatRoomId},
        
        success: function (response) {     	
        	hideTypingIndicator();
        	alert(response.msg);

            // AI 응답 대기 표시
            showTypingIndicator();

            // AI 응답 시뮬레이션
            setTimeout(() => {
                hideTypingIndicator();
                const aiResponse = generateAIResponse(message);
                addMessage(aiResponse, 'ai');
            }, 1500 + Math.random() * 1000);
//            addMessage(response.reply, 'ai'); // Spring에서 보낸 응답 사용
        },
        error: function (xhr, status, error) {
            hideTypingIndicator();
//            console.error('에러 발생:', error);
            alert("실페");
//            addMessage("AI 응답 중 오류가 발생했습니다.", 'ai');
        }
    });

}

// 메시지 추가
function addMessage(text, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const avatarIcon = sender === 'ai' ? 'fas fa-robot' : 'fas fa-user';

    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="${avatarIcon}"></i>
        </div>
        <div class="message-content">
            <div class="message-text">${text}</div>
            <div class="message-time">${getCurrentTime()}</div>
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// 타이핑 인디케이터 표시
function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message typing-indicator';
    typingDiv.id = 'typingIndicator';

    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <span>AI가 답변을 작성 중입니다</span>
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;

    chatMessages.appendChild(typingDiv);
    scrollToBottom();
}

// 타이핑 인디케이터 숨기기
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// AI 응답 생성
function generateAIResponse(userMessage) {
    const responses = {
        '준비물': `초보자를 위한 캠핑 필수 준비물을 알려드릴게요! 🎒

**필수 준비물:**
• 텐트 (인원수에 맞는 크기)
• 침낭 및 매트리스
• 랜턴 및 손전등
• 휴대용 가스버너
• 식기류 (컵, 그릇, 수저)
• 응급처치용품

**편의용품:**
• 의자 및 테이블
• 쿨러백
• 타프 (그늘막)
• 멀티툴

**계절별 추가 준비물:**
• 여름: 선크림, 모기퇴치제, 부채
• 겨울: 핫팩, 따뜻한 의류, 방한용품

처음 캠핑이시라면 렌탈 서비스를 이용하시는 것도 좋은 방법이에요!`,

        '캠핑장': `가족 캠핑하기 좋은 캠핑장을 추천해드릴게요! 👨‍👩‍👧‍👦

**서울 근교:**
• 양평 두물머리 캠핑장 - 깨끗한 시설, 아이 놀이터 완비
• 가평 자라섬 캠핑장 - 물놀이 가능, 펜션도 함께 운영

**강원도:**
• 춘천 남이섬 인근 캠핑장 - 관광지 접근성 좋음
• 홍천 비발디파크 캠핑장 - 다양한 액티비티

**경기도:**
• 포천 허브아일랜드 글램핑 - 초보자에게 추천
• 연천 재인폭포 캠핑장 - 자연경관 우수

**선택 시 고려사항:**
• 화장실, 샤워실 시설
• 아이들 안전시설
• 주변 편의점 거리
• 예약 난이도

더 구체적인 지역이 있으시면 알려주세요!`,

        '요리': `캠핑에서 만들 수 있는 간단한 요리 레시피를 알려드릴게요! 🍳

**초간단 레시피:**

**1. 캠핑 라면 🍜**
• 재료: 라면, 계란, 햄, 양파
• 끓는 물에 야채 먼저 넣고 라면 추가
• 계란 풀어서 마지막에 넣기

**2. 호일구이 🥘**
• 재료: 감자, 고구마, 옥수수, 버터
• 호일에 싸서 숯불에 구우면 완성

**3. 캠핑 볶음밥 🍚**
• 재료: 밥, 계란, 햄, 김치
• 버너에서 간단하게 볶아내기

**4. 마시멜로우 구이 🍡**
• 나무젓가락에 꽂고 숯불에 구워 먹기
• 아이들이 특히 좋아해요!

**팁:**
• 미리 재료를 손질해서 가세요
• 일회용 식기 활용하면 설거지 편해요
• 쿨러백에 얼음 충분히 준비하세요`,

        '안전': `캠핑 안전 수칙과 주의사항을 알려드릴게요! ⚠️

**화재 안전:**
• 텐트 근처에서 취사금지
• 소화기 또는 물 항상 준비
• 숯불은 완전히 끈 후 처리
• 가스버너 사용 후 밸브 완전히 잠그기

**자연재해 대비:**
• 천둥번개 시 텐트 내부로 대피
• 강풍 시 텐트 고정 재확인
• 비 올 때 계곡 근처 피하기

**응급상황 대비:**
• 응급처치용품 필수 준비
• 119, 캠핑장 관리사무소 번호 저장
• 약물 복용자는 상비약 지참

**야생동물 대처:**
• 음식물 밀폐용기에 보관
• 쓰레기 제대로 처리
• 야생동물 발견 시 거리두기

**일반 안전수칙:**
• 어둠 속 이동 시 랜턴 사용
• 아이들 안전사고 주의
• 음주 후 불 다루기 금지

안전한 캠핑이 즐거운 캠핑이에요! 🏕️`,

        'default': `캠핑에 관한 질문이시군요! 🏕️

더 구체적으로 알려주시면 더 정확한 답변을 드릴 수 있어요.

예를 들어:
• 어떤 종류의 캠핑을 계획하고 계신가요? (차박, 백패킹, 글램핑 등)
• 몇 명이서 가시나요?
• 어느 계절에 가시나요?
• 어느 지역을 고려하고 계신가요?

이런 정보를 알려주시면 더 맞춤형 조언을 해드릴 수 있습니다! 😊`
    };

    // 키워드 기반 응답 선택
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('준비물') || lowerMessage.includes('장비')) {
        return responses['준비물'];
    } else if (lowerMessage.includes('캠핑장') || lowerMessage.includes('추천')) {
        return responses['캠핑장'];
    } else if (lowerMessage.includes('요리') || lowerMessage.includes('레시피') || lowerMessage.includes('음식')) {
        return responses['요리'];
    } else if (lowerMessage.includes('안전') || lowerMessage.includes('주의')) {
        return responses['안전'];
    } else {
        return responses['default'];
    }
}

// 현재 시간 반환
function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// 채팅 화면 맨 아래로 스크롤
function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 엔터키 처리
function handleEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// 모바일 반응형 처리
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
}

// 채팅 기록 저장
function saveChatHistory() {
    localStorage.setItem('campingGPTHistory', JSON.stringify(chatHistory));
}

// 페이지 새로고침 시 경고
window.addEventListener('beforeunload', function(e) {
    if (document.getElementById('messageInput').value.trim()) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// 모바일에서 사이드바 외부 클릭 시 닫기 및 사용자 메뉴 닫기
document.addEventListener('click', function(event) {
    const sidebar = document.querySelector('.sidebar');
    const userMenu = document.querySelector('.user-menu');
    const target = event.target;

    // 사이드바 닫기 (모바일)
    if (window.innerWidth <= 768 && 
        sidebar.classList.contains('open') && 
        !sidebar.contains(target)) {
        sidebar.classList.remove('open');
    }

    // 사용자 메뉴 닫기
    if (userMenu && userMenu.classList.contains('open') && 
        !userMenu.contains(target)) {
        userMenu.classList.remove('open');
    }
});