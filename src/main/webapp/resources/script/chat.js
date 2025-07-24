
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
        displayMessage(message.content, message.sender === 'user', false, getMySQLDatetimeString());
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
                    const aiResponse = data.answer;
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

    let imageHtml = '';

    // AI 메시지에 음성 듣기 버튼 추가
    let audioButton = '';
    if (!isUser && content.trim()) {
        const messageId = 'msg_' + Date.now();
        audioButton = `<button class="audio-btn" onclick="playTextToSpeech('${messageId}', \`${content.replace(/`/g, '\\`').replace(/'/g, "\\'")}\`)" title="음성으로 듣기">
            <i class="fas fa-volume-up"></i>
        </button>`;
    }

    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-${isUser ? 'user' : 'robot'}"></i>
        </div>
        <div class="message-content">
            ${imageHtml}
            <div class="message-text">${content}</div>
            <div class="message-time">
                ${currentTime}
                ${audioButton}
            </div>
        </div>
    `;

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
                updateChatRoomTitleWithMessage(currentChatId,message);
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

// 엔터 키 입력 처리
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

//첫 메시지로 채팅방 제목 업데이트
function updateChatRoomTitleWithMessage(chatRoomId, message) {
    const chatTitle = message.length > 30 ? message.substring(0, 30) + '...' : message;

    $.ajax({
        url: '/ChatLibrary/updateChatRoomTitle',
        method: 'POST',
        dataType: "JSON",
        data: {
            chatRoomId: chatRoomId,
            title: chatTitle
        },
        success: function (response) {
            console.log('채팅방 제목 업데이트 성공:', response.message);          
            loadChatRoomsFromServer(true);
            // 채팅방 목록 새로고침
//            loadChatRoomsFromServer();
        },
        error: function (xhr, status, error) {
            console.error('채팅방 제목 업데이트 실패:', error);
        }
    });
}

//TTS 기능
function playTextToSpeech(text, content) {
    console.log('TTS 요청:', text);
    alert(content);
    
    if (!content || content.trim().length === 0) {
        alert('재생할 텍스트가 없습니다.');
        return;
    }
    
    // 로딩 상태 표시
    showTTSLoading();
    
    $.ajax({
        url: '/voice/textToSpeech',
        method: 'POST',
        dataType: 'JSON',
        data: {
            text: content.trim()
        },
        success: function(response) {
            hideTTSLoading();
            
            if (response.success) {
                console.log('TTS 생성 성공:', response.audioUrl);
                playAudio(response.audioUrl);
            } else {
                console.error('TTS 생성 실패:', response.message);
                alert('음성 생성에 실패했습니다: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            hideTTSLoading();
            console.error('TTS 요청 실패:', error);
            alert('음성 생성 요청에 실패했습니다.');
        }
    });
}

// 개선된 오디오 재생 함수
function playAudio(audioUrl) {
    console.log('오디오 재생 시작:', audioUrl);
    
    // 이전 오디오 정리
    if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio = null;
    }
    
    const audio = new Audio();
    window.currentAudio = audio;
    
    // 오디오 이벤트 리스너
    audio.addEventListener('loadstart', function() {
        console.log('오디오 로딩 시작');
        showAudioLoading();
    });
    
    audio.addEventListener('canplaythrough', function() {
        console.log('오디오 재생 준비 완료');
        hideAudioLoading();
    });
    
    audio.addEventListener('play', function() {
        console.log('오디오 재생 시작');
        showAudioPlaying();
    });
    
    audio.addEventListener('pause', function() {
        console.log('오디오 일시정지');
        hideAudioPlaying();
    });
    
    audio.addEventListener('ended', function() {
        console.log('오디오 재생 완료');
        hideAudioPlaying();
        window.currentAudio = null;
    });
    
    audio.addEventListener('error', function(e) {
        console.error('오디오 재생 오류:', e);
        hideAudioLoading();
        hideAudioPlaying();
        
        // 구체적인 오류 메시지
        let errorMessage = '오디오 재생에 실패했습니다.';
        if (e.target.error) {
            switch(e.target.error.code) {
                case e.target.error.MEDIA_ERR_ABORTED:
                    errorMessage = '오디오 재생이 중단되었습니다.';
                    break;
                case e.target.error.MEDIA_ERR_NETWORK:
                    errorMessage = '네트워크 오류로 오디오를 불러올 수 없습니다.';
                    break;
                case e.target.error.MEDIA_ERR_DECODE:
                    errorMessage = '오디오 파일이 손상되었습니다.';
                    break;
                case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    errorMessage = '지원되지 않는 오디오 형식입니다.';
                    break;
            }
        }
        alert(errorMessage);
    });
    
    // 오디오 소스 설정 및 재생
    audio.src = audioUrl;
    audio.load(); // 명시적으로 로드
    
    // 사용자 인터랙션이 필요한 경우를 위한 처리
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                console.log('오디오 재생 성공');
            })
            .catch(error => {
                console.error('오디오 재생 실패:', error);
                hideAudioLoading();
                hideAudioPlaying();
                
                if (error.name === 'NotAllowedError') {
                    alert('브라우저에서 자동 재생이 차단되었습니다. 페이지를 클릭한 후 다시 시도해주세요.');
                } else {
                    alert('오디오 재생에 실패했습니다: ' + error.message);
                }
            });
    }
}

// TTS 로딩 상태 표시/숨김
function showTTSLoading() {
    // 기존 로딩 표시기가 있다면 제거
    hideTTSLoading();
    
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'ttsLoading';
    loadingDiv.className = 'tts-loading';
    loadingDiv.innerHTML = `
        <div class="loading-content">
            <i class="fas fa-microphone-alt fa-spin"></i>
            <span>음성 생성 중...</span>
        </div>
    `;
    
    document.body.appendChild(loadingDiv);
}

function hideTTSLoading() {
    const loadingDiv = document.getElementById('ttsLoading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// 오디오 로딩/재생 상태 표시
function showAudioLoading() {
    const statusDiv = getOrCreateAudioStatus();
    statusDiv.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <span>오디오 로딩 중...</span>
    `;
    statusDiv.style.display = 'block';
}

function hideAudioLoading() {
    const statusDiv = document.getElementById('audioStatus');
    if (statusDiv) {
        statusDiv.style.display = 'none';
    }
}

function showAudioPlaying() {
    const statusDiv = getOrCreateAudioStatus();
    statusDiv.innerHTML = `
        <i class="fas fa-volume-up"></i>
        <span>재생 중...</span>
        <button onclick="stopAudio()" class="stop-audio-btn">
            <i class="fas fa-stop"></i>
        </button>
    `;
    statusDiv.style.display = 'block';
}

function hideAudioPlaying() {
    const statusDiv = document.getElementById('audioStatus');
    if (statusDiv) {
        statusDiv.style.display = 'none';
    }
}

function getOrCreateAudioStatus() {
    let statusDiv = document.getElementById('audioStatus');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'audioStatus';
        statusDiv.className = 'audio-status';
        document.body.appendChild(statusDiv);
    }
    return statusDiv;
}

// 오디오 정지 함수
function stopAudio() {
    if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio.currentTime = 0;
        window.currentAudio = null;
    }
    hideAudioPlaying();
}