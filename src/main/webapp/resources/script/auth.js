
// 인증 관련 전역 변수
let currentUser = null;

// 인증 관련 초기화
function initializeAuth() {
    // 저장된 사용자 정보 확인
    const savedUser = localStorage.getItem('campingGPTUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        setupLoggedInUser();
    } else {
        setupGuestUser();
    }
}

// 로그인한 사용자 설정
function setupLoggedInUser() {
    updateUserInterface();
    loadChatRoomsFromServer();
}

// 게스트 사용자 설정
function setupGuestUser() {
    updateUserInterface();
    loadLocalChatHistory();
}

// 사용자 인터페이스 업데이트
function updateUserInterface() {
    const userInfo = document.getElementById('userInfo');
    const headerUserMenu = document.getElementById('headerUserMenu');
    
    if (currentUser) {
        // 로그인한 사용자 UI
        userInfo.innerHTML = `
            <div class="user-info">
                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="user-details">
                    <div class="user-name">${currentUser}</div>
                    <div class="user-status">프리미엄</div>
                </div>
            </div>
            <button class="logout-btn" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i>
            </button>
        `;
        
        headerUserMenu.innerHTML = `
            <button class="user-menu-btn" onclick="toggleUserMenu()">
                <i class="fas fa-user-circle"></i>
                <span>${currentUser}</span>
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
        `;
    } else {
        // 게스트 사용자 UI
        userInfo.innerHTML = `
            <div class="guest-info">
                <div class="guest-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="guest-details">
                    <div class="guest-name">게스트</div>
                    <div class="guest-actions">
                        <a href="/login" class="auth-link">로그인</a>
                        <a href="/signup" class="auth-link">회원가입</a>
                    </div>
                </div>
            </div>
        `;
        
        headerUserMenu.innerHTML = `
            <div class="guest-menu">
                <a href="/login" class="auth-btn-header">로그인</a>
                <a href="/signup" class="auth-btn-header">회원가입</a>
            </div>
        `;
    }
}

// 로그인 처리
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) {
        alert('이메일과 비밀번호를 입력해주세요.');
        return;
    }
    
    // 서버로 로그인 요청
    $.ajax({
        url: '/Login/signin',
        method: 'POST',
        dataType: "JSON",
        data: {
            email: email,
            password: password
        },
        success: function (response) {
                currentUser = response.user;
                localStorage.setItem('campingGPTUser', JSON.stringify(currentUser));
                // 로컬 채팅 기록 삭제
                clearLocalChatHistory();
                showAPKDownloadAlert();
                window.location.href = '/chat';
        },
        error: function (xhr, status, error) {
            console.error('로그인 오류:', error);
            alert('로그인 중 오류가 발생했습니다.');
        }
    });
}

// 회원가입 처리
function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const user_id = email.split("@")[0];
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
    // 서버로 회원가입 요청
    $.ajax({
        url: '/Member/signup',
        method: 'POST',
        dataType: "JSON",
        data: {
            name: name,
            email: email,
            password: password,
            user_id: user_id
          
            
        },
        success: function (response) {
                
            alert('회원가입이 완료되었습니다!');
            window.location.href = '/login';
        },
        error: function (xhr, status, error) {
            console.error('회원가입 오류:', error);
            alert('회원가입 중 오류가 발생했습니다.');
        }
    });
}

// 사용자 메뉴 토글
function toggleUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.classList.toggle('open');
    }
}

// 로그아웃
function logout() {
    if (confirm('정말 로그아웃 하시겠습니까?')) {
        currentUser = null;
        localStorage.removeItem('campingGPTUser');
        clearLocalChatHistory();
        window.location.href = 'login.html';
    }
}

// 현재 사용자 정보 반환
function getCurrentUser() {
    return currentUser;
}

// 로컬 채팅 히스토리 삭제
function clearLocalChatHistory() {
    localStorage.removeItem('campingGPTTempHistory');
    localStorage.removeItem('campingGPTLocalRooms');
}

//APK 다운로드 알림 표시
function showAPKDownloadAlert() {
    if (confirm('캠핑GPT 모바일 앱을 다운로드하시겠습니까?\n\n확인을 누르면 APK 파일 다운로드가 시작됩니다.')) {
        downloadAPK();
    }
}

// APK 다운로드 함수
function downloadAPK() {
    const apkPath = '/resources/apk/AiCamping.apk';
    
    // 다운로드 링크 생성
    const link = document.createElement('a');
    link.href = apkPath;
    link.download = 'AiCamping.apk';
    link.style.display = 'none';
    
    // 다운로드 시작
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 다운로드 알림
    alert('APK 다운로드가 시작되었습니다.\n\n다운로드 완료 후 안드로이드 기기에 설치하여 사용하세요.');
}