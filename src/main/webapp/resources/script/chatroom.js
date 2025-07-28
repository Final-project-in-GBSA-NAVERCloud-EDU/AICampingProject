
// 채팅방 관련 전역 변수
let chatRooms = [];
let currentChatId = null;
let isFirstMessage = true;

// 서버에서 채팅방 목록 로드 (로그인한 사용자)
function loadChatRoomsFromServer(maintainSelection = false) {
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

                if (maintainSelection && previousChatId) {
                    // 이전에 선택된 채팅방을 유지
                    const existingRoom = chatRooms.find(room => 
                        room.user_chat_library_id.toString() === previousChatId.toString()
                    );
                    
                    if (existingRoom) {
                        selectChatRoom(existingRoom.user_chat_library_id);
                        console.log('이전 선택 채팅방 유지:', previousChatId);
                    } else if (chatRooms.length > 0) {
                        // 이전 채팅방이 없으면 첫 번째 선택
                        selectChatRoom(chatRooms[0].user_chat_library_id);
                    } else {
                        startNewChat();
                    }
                } else {
                    // 첫 번째 채팅방이 있으면 선택, 없으면 새 채팅 시작
                    if (chatRooms.length > 0) {
                        selectChatRoom(chatRooms[0].user_chat_library_id);
                    } else {
                        startNewChat();
                    }
                }
            } else {
                console.error('채팅방 로드 실패:', data.message || '알 수 없는 오류');
                startNewChat();
            }
        },
        error: function(xhr, status, error) {
            console.error('채팅방 로드 오류:', error);
            startNewChat();
        }
    });
}

//채팅방 목록 렌더링
function renderChatRooms() {
    const chatHistory = document.querySelector('.chat-history');
    chatHistory.innerHTML = '';

    if (currentUser) {
        // 로그인한 사용자의 경우 서버 데이터 사용
        chatRooms.forEach(room => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.dataset.chatId = room.user_chat_library_id;
            chatItem.onclick = () => selectChatRoom(room.user_chat_library_id);

            // 채팅방 제목 처리
            let title = room.title || '새 대화';
//            let dateStr = room.create_at.toISOString();
            let createChat = room.create_at; 
            if (title === '새 대화' && room.create_at) {
                // create_at 기반으로 제목 생성
                const createDate = new Date(room.create_at);
                title = `채팅 ${createDate.toLocaleDateString()}`;
            }

            // 미리보기 텍스트 처리
            const preview = room.preview_text || '새 대화';

            chatItem.innerHTML = `
                <i class="fas fa-comment"></i>
                <div class="chat-info">
                    <div class="chat-title">${title}</div>
                    <div class="chat-preview">${createChat}</div>
                </div>
                <div class="chat-delete-btn" onclick="event.stopPropagation(); deleteChatRoom('${room.user_chat_library_id}')">
                    <i class="fas fa-times"></i>
                </div>
            `;

            chatHistory.appendChild(chatItem);
        });
    } else {
        // 게스트 사용자의 경우 로컬 채팅방 렌더링
        renderLocalChatRooms();
    }
}

// 채팅방 선택
function selectChatRoom(roomId) {
    currentChatId = roomId.toString(); // 문자열로 통일
    
    // 첫 메시지 플래그를 false로 설정 (기존 채팅방이므로)
    setFirstMessageFlag(false);

    // 채팅방 활성화 표시
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => item.classList.remove('active'));

    const selectedItem = Array.from(chatItems).find(item => {
        return item.dataset.chatId.toString() === roomId.toString();
    });

    if (selectedItem) {
        selectedItem.classList.add('active');
        
        // 선택된 채팅방 제목 업데이트
        const chatTitle = selectedItem.querySelector('.chat-title').textContent;
        updateCurrentChatTitle(chatTitle);
        
        console.log('채팅방 선택됨:', roomId);
    } else {
        console.warn('선택할 채팅방을 찾을 수 없음:', roomId);
    }

    // 해당 채팅방의 메시지 로드
    loadChatMessages(roomId);
}

// 새 채팅 시작
function startNewChat() {
    if (currentUser) {
        // 로그인한 사용자의 경우 서버에서 새 채팅방 생성
        createNewChatRoom();
    } else {
        // 로그인하지 않은 사용자의 경우 로컬 채팅 시작
        currentChatId = 'local_' + Date.now().toString();
        clearChat();
        showWelcomeMessage();
        isFirstMessage = true;
        
        // 새 대화 제목 표시
        updateCurrentChatTitle('새 대화');
        
        // 모든 채팅방 비활성화
        const chatItems = document.querySelectorAll('.chat-item');
        chatItems.forEach(item => item.classList.remove('active'));
        
        // 새 로컬 채팅방을 채팅방 목록에 추가하고 선택
        renderLocalChatRooms();
    }
}

//새 채팅방 생성 (서버)
function createNewChatRoom() {
    // 새 채팅방 ID 생성 (임시)
    currentChatId = 'new_' + Math.floor(Math.random() * 2147483647);
    
    // 채팅 화면 초기화
    clearChat();
    showWelcomeMessage();
    isFirstMessage = true;
    
    // 새 대화 제목 표시
    updateCurrentChatTitle('새 대화');
    
    // 모든 채팅방 비활성화
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => item.classList.remove('active'));
    
    console.log('새 채팅방 생성됨 (임시 ID):', currentChatId);
}


// 채팅방 메시지 로드
function loadChatMessages(roomId) {
    if (!currentUser) return;

    $.ajax({
        url: '/ChatHistory/getChatMessages',
        method: 'GET',
        dataType: "JSON",
        data: {
            roomId: roomId
        },
        success: function(data) {
            if (data.success && data.messages && data.messages.length > 0) {
            	
                clearChat();
                showWelcomeMessage();

                // 시간순으로 정렬하여 메시지 표시
                data.messages.forEach(messageData => {
                    // 사용자 질문 표시
                    if (messageData.question_value) {
                        displayMessage(messageData.question_value, true, false, messageData.question_create_at);
                    }

                    // AI 답변 표시
                    if (messageData.answer_value) {
                        displayMessage(messageData.answer_value, false, false, messageData.answer_create_at);
                    }
                });
            } else {
                // 메시지가 없는 경우 환영 메시지만 표시
                clearChat();
                showWelcomeMessage();
            }
        },
        error: function(xhr, status, error) {
            console.error('메시지 로드 오류:', error);
        }
    });
}

// 현재 채팅방 ID 반환
function getCurrentChatId() {
    return currentChatId;
}

// 첫 메시지 여부 확인
function isFirstMessageInChat() {
    return isFirstMessage;
}

// 첫 메시지 플래그 설정
function setFirstMessageFlag(flag) {
    isFirstMessage = flag;
}

// 로컬 채팅방 선택
function selectLocalChatRoom(chatId) {
    if (!chatId) {
        console.error('채팅방 ID가 필요합니다.');
        return;
    }

    currentChatId = chatId;

    // 채팅방 활성화 표시
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => item.classList.remove('active'));

    // 선택된 채팅방 활성화 표시
    const selectedItem = Array.from(chatItems).find(item => {
        return item.dataset.chatId === chatId;
    });

    if (selectedItem) {
        selectedItem.classList.add('active');
        
        // 선택된 채팅방 제목 업데이트
        const chatTitle = selectedItem.querySelector('.chat-title').textContent;
        updateCurrentChatTitle(chatTitle);
    }

    // 해당 채팅방의 메시지 로드
    loadLocalChatMessages(chatId);

    console.log('로컬 채팅방 선택됨:', chatId);
}

// 로컬 채팅방 메시지 로드
function loadLocalChatMessages(chatId) {
    if (!chatId) {
        console.error('채팅방 ID가 필요합니다.');
        return;
    }

    // 로컬 스토리지에서 메시지 히스토리 가져오기
    const savedHistory = localStorage.getItem('campingGPTTempHistory');
    let allMessages = [];

    if (savedHistory) {
        allMessages = JSON.parse(savedHistory);
    }

    // 해당 채팅방의 메시지만 필터링
    const chatMessages = allMessages.filter(message => message.chatId === chatId);

    // 채팅 화면 초기화
    clearChat();
    showWelcomeMessage();

    // 메시지들을 시간순으로 정렬하여 표시
    chatMessages
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .forEach(message => {
            const formattedTime = formatTimestamp(message.timestamp);
            if (message.images && message.images.length > 0) {
                displayMessageWithImages(message.content, message.images, message.sender === 'user', formattedTime);
            } else {
                displayMessage(message.content, message.sender === 'user', false, formattedTime);
            }
        });

    console.log(`로컬 채팅방 ${chatId}의 메시지 ${chatMessages.length}개 로드됨`);
}

// 로컬 메시지 저장
function saveLocalMessage(content, sender, chatId) {
    if (!content || !sender || !chatId) {
        console.error('메시지 내용, 발신자, 채팅방 ID가 모두 필요합니다.');
        return;
    }

    // 메시지 객체 생성
    const message = {
        content: content,
        sender: sender,
        timestamp: new Date().toISOString(),
        chatId: chatId
    };

    // 로컬 스토리지에서 기존 메시지 히스토리 가져오기
    const savedHistory = localStorage.getItem('campingGPTTempHistory');
    let allMessages = [];

    if (savedHistory) {
        allMessages = JSON.parse(savedHistory);
    }

    // 새 메시지 추가
    allMessages.push(message);

    // 로컬 스토리지에 저장
    localStorage.setItem('campingGPTTempHistory', JSON.stringify(allMessages));

    console.log('로컬 메시지 저장됨:', message);
}

// 현재 채팅방 제목 업데이트
function updateCurrentChatTitle(title) {
    const currentChatTitleElement = document.getElementById('currentChatTitle');
    if (currentChatTitleElement) {
        currentChatTitleElement.textContent = title || '새 대화';
    }
    
    console.log('채팅방 제목 업데이트:', title);
}

// 로컬 채팅방 목록 렌더링
function renderLocalChatRooms() {
    const savedHistory = localStorage.getItem('campingGPTTempHistory');
    if (!savedHistory) return;

    const allMessages = JSON.parse(savedHistory);
    const chatIds = [...new Set(allMessages.map(msg => msg.chatId))];

    const chatHistory = document.querySelector('.chat-history');
    chatHistory.innerHTML = '';

    chatIds.forEach(chatId => {
        const chatMessages = allMessages.filter(msg => msg.chatId === chatId);
        const firstUserMessage = chatMessages.find(msg => msg.sender === 'user');
        
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.chatId = chatId;
        chatItem.onclick = () => selectLocalChatRoom(chatId);

        // 첫 번째 사용자 메시지로 제목 생성
        let title = '새 대화';
        if (firstUserMessage) {
            title = firstUserMessage.content.length > 30 
                ? firstUserMessage.content.substring(0, 30) + '...'
                : firstUserMessage.content;
        }

        chatItem.innerHTML = `
            <i class="fas fa-comment"></i>
            <div class="chat-info">
                <div class="chat-title">${title}</div>
                <div class="chat-preview">${chatMessages.length}개 메시지</div>
            </div>
        `;

        chatHistory.appendChild(chatItem);
    });
}

//채팅방 삭제 (서버)
function deleteChatRoom(roomId) {
    if (!confirm('이 채팅방을 삭제하시겠습니까?')) {
        return;
    }

    $.ajax({
        url: '/ChatLibrary/deleteChatRoom',
        method: 'POST',
        dataType: "JSON",
        data: {
            chatRoomId: roomId
        },
        success: function(response) {
            if (response.success) {
                console.log('채팅방 삭제 성공:', response.message);
                alert(response.message);
                // 삭제된 채팅방이 현재 선택된 채팅방인 경우
                if (currentChatId === roomId) {
                    startNewChat();
                }
                
                // 채팅방 목록 새로고침
                loadChatRoomsFromServer();
            } else {
                alert('채팅방 삭제에 실패했습니다: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('채팅방 삭제 오류:', error);
            alert('채팅방 삭제 중 오류가 발생했습니다.');
        }
    });
}
