
// 채팅 관련 전역 변수
let chatHistory = [];

function getMySQLDatetimeString() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

// 로컬 채팅 히스토리 로드 (로그인하지 않은 사용자)
function loadLocalChatHistory() {
    const savedHistory = localStorage.getItem('campingGPTTempHistory');
    if (savedHistory) {
        chatHistory = JSON.parse(savedHistory);
        displayLocalChatHistory();
    }

    // 첫 번째 채팅이 없으면 새 채팅 시작
    if (chatHistory.length === 0) {
        startNewChat();
    }
}

// 로컬 채팅 히스토리 표시
function displayLocalChatHistory() {
    clearChat();
    showWelcomeMessage();

    chatHistory.forEach(message => {
        displayMessage(message.content, message.sender === 'user', false);
    });
}

// 로컬 채팅 히스토리 저장
function saveLocalChatHistory() {
    if (!currentUser) {
        localStorage.setItem('campingGPTTempHistory', JSON.stringify(chatHistory));
    }
}

// 로컬 채팅 히스토리 삭제
function clearLocalChatHistory() {
    localStorage.removeItem('campingGPTTempHistory');
    chatHistory = [];
}

// 메시지 전송
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();

    if (!message) return;

    // 첫 메시지인 경우 채팅방 생성
    if (isFirstMessageInChat()) {
        if (!currentUser) {
            // 게스트 사용자의 경우 로컬 채팅방 생성
            currentChatId = 'local_' + Date.now().toString();

            // 첫 메시지로 채팅방 제목 설정
            const chatTitle = message.length > 30 ? message.substring(0, 30) + '...' : message;
            updateCurrentChatTitle(chatTitle);
        } else {
            // 로그인한 사용자의 경우 새 채팅방 ID 생성
            currentChatId = 'new_' + Date.now().toString();
        }
        setFirstMessageFlag(false);
    }

    // 사용자 메시지 표시
    displayMessage(message, true, true, getMySQLDatetimeString());

    messageInput.value = '';
    showTypingIndicator();

    if (currentUser) {
        // 로그인한 사용자 - 서버에 메시지 전송
        sendMessageToServer(message);
    } else {
        // 게스트 사용자 - 로컬 저장 및 AI 응답
        saveLocalMessage(message, 'user', currentChatId);

        // AI 응답 시뮬레이션
        setTimeout(() => {
            $.ajax({
                url: 'http://49.50.131.0:8000/chat',  // Python API 주소
                type: 'GET',
                data: { message: message },  
                success: function(data) {
                    hideTypingIndicator();
                    const aiResponse = data.answer.replace(/\n/g, '<br>');
                    displayMessage(aiResponse, false, true, getMySQLDatetimeString());
                    saveLocalMessage(aiResponse, 'ai', currentChatId);
                },
                error: function(xhr, status, error) {
                    hideTypingIndicator();
                    console.error('Python API 호출 에러:', error);
                    const aiResponse = "⚠️ AI 응답 중 오류가 발생했습니다."
                    displayMessage(aiResponse, false, true, getMySQLDatetimeString());
                    saveLocalMessage(aiResponse, 'ai', currentChatId);
                }
            });
            

            // 로컬 채팅방 목록 업데이트 및 현재 채팅방 선택 유지
            renderLocalChatRooms();
            maintainChatRoomSelection();
        }, 1500 + Math.random() * 1000);
    }
    
    

}

// 채팅방 선택 상태 유지 함수
function maintainChatRoomSelection() {
    if (!currentChatId) return;

    // 현재 채팅방을 활성화 상태로 표시
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
        if (item.dataset.chatId === currentChatId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // 선택된 채팅방 제목 업데이트
    const selectedItem = Array.from(chatItems).find(item => {
        return item.dataset.chatId === currentChatId;
    });

    if (selectedItem) {
        const chatTitle = selectedItem.querySelector('.chat-title').textContent;
        updateCurrentChatTitle(chatTitle);
    }
}

// 제안 프롬프트 전송
function sendSuggestedPrompt(prompt) {
    document.getElementById('messageInput').value = prompt;
    sendMessage();
}

// 메시지 표시
function displayMessage(content, isUser, animate = true, currentTime) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;

//    const currentTime = new Date().toLocaleTimeString('ko-KR', {
//        hour: '2-digit',
//        minute: '2-digit'
//    });

    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-${isUser ? 'user' : 'robot'}"></i>
        </div>
        <div class="message-content">
            <div class="message-text"></div>
            <div class="message-time">${currentTime}</div>
        </div>
    `;
	messageDiv.querySelector('.message-text').innerHTML = content;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    if (animate) {
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 50);
    }
  
}
//  	messageDiv.querySelector('.message-text').innerHTML = content;
// 메시지 저장
function saveMessage(content, sender) {
    const message = {
        content: content,
        sender: sender,
        timestamp: new Date().toISOString(),
        chatId: currentChatId
    };

    if (currentUser) {
        // 로그인한 사용자의 경우 서버에 저장
        saveMessageToServer(message);
    } else {
        // 로그인하지 않은 사용자의 경우 로컬 저장
        chatHistory.push(message);
        saveLocalChatHistory();
    }
}



// 서버에 메시지 전송
function sendMessageToServer(message) {
    const currentTime = getMySQLDatetimeString();
    let selectedChatRoomId = null;
    let newChatRoomId = null;
    let isNewChat = false;

    console.log('현재 채팅 ID:', currentChatId);

    // 기존 채팅방인지 새 채팅방인지 구분
    if (currentChatId && currentChatId.toString().startsWith('new_')) {
        newChatRoomId = Math.floor(Math.random() * 2147483647);
        isNewChat = true;
        console.log('새 채팅방 생성 - newChatRoomId:', newChatRoomId);
    } else if (currentChatId && !currentChatId.toString().startsWith('local_')) {
        selectedChatRoomId = parseInt(currentChatId);
        console.log('기존 채팅방 사용 - selectedChatRoomId:', selectedChatRoomId);
    }

    $.ajax({
        url: '/ChatLibrary/sendMessage',
        method: 'POST',
        dataType: "JSON",
        data: { 
            message: message,
            savedUser: currentUser,
            currentTime: currentTime,
            selectedChatRoomId: selectedChatRoomId,
            newChatRoomId: newChatRoomId
        },
        success: function (response) {     	
            hideTypingIndicator();
            console.log('메시지 전송 성공:', response.msg);

            // 새 채팅방이 생성된 경우 currentChatId 업데이트
            if (isNewChat && newChatRoomId) {
                currentChatId = newChatRoomId.toString();
                console.log('currentChatId 업데이트:', currentChatId);
            }

            // AI 응답 대기 표시
            showTypingIndicator();

            // AI 응답 시뮬레이션
            setTimeout(() => {
//                hideTypingIndicator();
//                const aiResponse = generateAIResponse(message);
                $.ajax({
                    url: 'http://49.50.131.0:8000/chat',  // Python API 주소
                    type: 'GET',
                    data: { message: message },  
                    success: function(data) {
                        hideTypingIndicator();
                        const aiResponse = data.answer;
                        displayMessage(aiResponse, false, true, getMySQLDatetimeString());
                        const finalChatRoomId = isNewChat ? newChatRoomId : selectedChatRoomId;
                        sendAiMessage(currentUser, finalChatRoomId, aiResponse);
                    },
                    error: function(xhr, status, error) {
                        hideTypingIndicator();
                        console.error('Python API 호출 에러:', error);
                        const aiResponse = "⚠️ AI 응답 중 오류가 발생했습니다."
                        displayMessage(aiResponse, false, true, getMySQLDatetimeString());
                        const finalChatRoomId = isNewChat ? newChatRoomId : selectedChatRoomId;
                        sendAiMessage(currentUser, finalChatRoomId, aiResponse);
                    }
                });
                
//                displayMessage(aiResponse, false);
                
                // AI 응답 저장 - 업데이트된 currentChatId 사용
                
            }, 1500 + Math.random() * 1000);
        },
        error: function (xhr, status, error) {
            hideTypingIndicator();
            console.error('메시지 전송 실패:', error);
            alert("메시지 전송에 실패했습니다.");
        }
    });
}

// AI 메시지 서버에 전송
function sendAiMessage(userId, finalChatRoomId, aiResponse) {
    const currentTime = getMySQLDatetimeString();

    console.log('AI 메시지 전송 - finalChatRoomId:', finalChatRoomId);

    $.ajax({
        url: '/ChatHistory/sendAiMessage',
        method: 'POST',
        dataType: "JSON",
        data: { 
            message: aiResponse,
            savedUser: userId,
            currentTime: currentTime,
            finalChatRoomId: finalChatRoomId
        },
        success: function (response) {
            console.log('AI 응답 저장 성공:', response.msg);
            
            // 채팅방 목록 새로고침 후 선택 상태 유지
            loadChatRoomsFromServerWithSelection();
        },
        error: function (xhr, status, error) {
            console.error('AI 응답 저장 실패:', error);
        }
    });
}

// 채팅방 목록 로드 후 선택 상태 유지
function loadChatRoomsFromServerWithSelection() {
    if (!currentUser) return;

    const previousChatId = currentChatId; // 현재 선택된 채팅방 ID 저장

    $.ajax({
        url: '/ChatLibrary/getChatRooms',
        method: 'GET',
        dataType: "JSON",
        data: {
            user_id: currentUser
        },
        success: function(data) {
            if (data.success && data.chatRooms) {
                chatRooms = data.chatRooms;
                renderChatRooms();

                // 이전에 선택되었던 채팅방을 다시 선택
                if (previousChatId) {
                    currentChatId = previousChatId;
                    maintainChatRoomSelection();
                }
            }
        },
        error: function(xhr, status, error) {
            console.error('채팅방 로드 오류:', error);
        }
    });
}

// 채팅 화면 초기화
function clearChat() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '';
}

// 환영 메시지 표시
function showWelcomeMessage() {
    const messagesContainer = document.getElementById('chatMessages');
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'message ai-message';
    welcomeMessage.innerHTML = `
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
    `;
    messagesContainer.appendChild(welcomeMessage);

    // 제안 프롬프트 표시
    const suggestedPrompts = document.createElement('div');
    suggestedPrompts.className = 'suggested-prompts';
    suggestedPrompts.innerHTML = `
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
    `;
    messagesContainer.appendChild(suggestedPrompts);
}

// 타이핑 인디케이터 표시
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 타이핑 인디케이터 숨김
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// AI 응답 생성 (시뮬레이션)
//function generateAIResponse(userMessage) {
//    const responses = {
//        '준비물': `캠핑 준비물 리스트를 알려드릴게요! 🏕️
//
//**필수 준비물:**
//• 텐트 (인원수에 맞게)
//• 침낭, 매트리스
//• 랜턴, 손전등
//• 취사도구 (버너, 연료, 냄비 등)
//• 식수, 음식
//• 응급처치용품
//• 휴지, 물티슈
//
//**편의용품:**
//• 접이식 테이블, 의자
//• 쿨러박스
//• 멀티탭, 충전기
//• 모기퇴치용품
//• 여분의 옷
//
//더 자세한 정보가 필요하시면 언제든 물어보세요!`,
//
//        '캠핑장': `가족 캠핑하기 좋은 캠핑장을 추천해드릴게요! 👨‍👩‍👧‍👦
//
//**추천 캠핑장:**
//
//**1. 자라섬 캠핑장 (가평)**
//• 아이들이 뛰어놀 수 있는 넓은 잔디밭
//• 깨끗한 화장실, 샤워실
//• 편의점, 마트 접근성 좋음
//
//**2. 오토캠핑장 (여주)**
//• 가족 단위 전용 구획
//• 전기, 상수도 완비
//• 안전한 놀이터 시설
//
//**3. 청평호반 캠핑장**
//• 물놀이 가능
//• 바베큐 시설 완비
//• 주말 예약 필수
//
//각 캠핑장의 특징:
//• 안전 시설 완비
//• 편의시설 우수
//• 가족 친화적 환경
//
//더 구체적인 지역이나 조건이 있으시면 알려주세요!`,
//
//        '요리': `캠핑에서 만들 수 있는 간단한 요리 레시피를 알려드릴게요! 🍳
//
//**초간단 레시피:**
//
//**1. 캠핑 라면 🍜**
//• 재료: 라면, 계란, 햄, 양파
//• 끓는 물에 야채 먼저 넣고 라면 추가
//• 계란 풀어서 마지막에 넣기
//
//**2. 호일구이 🥘**
//• 재료: 감자, 고구마, 옥수수, 버터
//• 호일에 싸서 숯불에 구우면 완성
//
//**3. 캠핑 볶음밥 🍚**
//• 재료: 밥, 계란, 햄, 김치
//• 버터에서 간단하게 볶아내기
//
//**4. 마시멜로우 구이 🍡**
//• 나무젓가락에 꽂고 숯불에 구워 먹기
//• 아이들이 특히 좋아해요!
//
//**팁:**
//• 미리 재료를 손질해서 가세요
//• 일회용 식기 활용하면 설거지 편해요
//• 쿨러백에 얼음 충분히 준비하세요`,
//
//        '안전': `캠핑 안전 수칙과 주의사항을 알려드릴게요! ⚠️
//
//**화재 안전:**
//• 텐트 근처에서 취사금지
//• 소화기 또는 물 항상 준비
//• 숯불은 완전히 끈 후 처리
//• 가스버너 사용 후 밸브 완전히 잠그기
//
//**자연재해 대비:**
//• 천둥번개 시 텐트 내부로 대피
//• 강풍 시 텐트 고정 재확인
//• 비 올 때 계곡 근처 피하기
//
//**응급상황 대비:**
//• 응급처치용품 필수 준비
//• 119, 캠핑장 관리사무소 번호 저장
//• 약물 복용자는 상비약 지참
//
//**야생동물 대비:**
//• 음식물 밀폐 보관
//• 쓰레기 정리 철저히
//• 야생동물 발견 시 거리두기
//
//안전한 캠핑을 위해 항상 주의하세요!`
//    };
//
//    // 키워드 매칭으로 응답 선택
//    for (const [keyword, response] of Object.entries(responses)) {
//        if (userMessage.includes(keyword)) {
//            return response;
//        }
//    }
//
//    // 기본 응답
//    return `${userMessage}에 대한 질문 감사합니다! 🏕️
//
//캠핑에 관한 더 구체적인 질문을 해주시면 더 자세한 답변을 드릴 수 있어요.
//
//예를 들어:
//• 캠핑 준비물에 대해 궁금하시다면 "준비물"
//• 캠핑장 추천을 원하시면 "캠핑장"
//• 캠핑 요리가 궁금하시면 "요리"
//• 안전 수칙을 알고 싶으시면 "안전"
//
//언제든 편하게 물어보세요!`;
//}

// 엔터 키 입력 처리
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}


function startRecording() {
	navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
		const mediaRecorder = new MediaRecorder(stream);
		const chunks = [];
	
		// alert("알러트테스트"); // 마이크 접근 확인

		mediaRecorder.ondataavailable = e => {
			chunks.push(e.data);
		};

		mediaRecorder.start();
		setTimeout(() => mediaRecorder.stop(), 3000); // 2초 녹음
		mediaRecorder.onstop = () => {
			// ✅ MIME 타입 수정: voice/mp3 → audio/mp3 또는 생략
			const blob = new Blob(chunks, { type: "audio/mp3" });
			console.log("🔊 녹음된 형식:", blob.type);

			const formData = new FormData();
			formData.append("file", blob, "voice.mp3");
			$.ajax({
				url: '/stt',
				method: 'POST',
				data: formData,
				processData: false,
				contentType: false,
				success: function(response) {
					console.log("✅ STT 응답:", response);
					const text = response.text || response.message || "[음성 인식 실패]";
					$("#messageInput").val(text);
					stream.getTracks().forEach(track => track.stop());
					
					sendMessage();
				},
				error: function(xhr, status, error) {
					console.error("❌ 음성 인식 오류:", error);
					console.error("서버 응답 본문:", xhr.responseText);
					$("#messageInput").val("[STT 서버 오류]");
					stream.getTracks().forEach(track => track.stop());

				}
			});

		};

	}).catch(err => {
		alert("❌ 마이크 권한이 필요합니다");
		console.error("마이크 오류:", err);
	});


}


/*            const res = await fetch("/stt", {
                method: "POST",
                body: formData
            });

            const result = await res.json();
            const text = result.text || result.message || "[음성 인식 실패]";
            document.getElementById("messageInput").value = text;*/
