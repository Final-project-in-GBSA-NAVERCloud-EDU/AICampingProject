
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
        
        initializeVideoBackground();
    }
}

//비디오 배경 초기화
function initializeVideoBackground() {
    const video = document.getElementById('authVideo');
    if (video) {
        // 비디오 로드 실패 시 기본 배경으로 대체
        video.addEventListener('error', function() {
            console.log('비디오 로드 실패, 기본 배경으로 대체');
            video.style.display = 'none';
        });

        // 비디오 로드 성공 시
        video.addEventListener('loadeddata', function() {
            console.log('비디오 배경 로드 완료');
        });

        // 자동 재생이 차단된 경우 처리
        video.play().catch(function(error) {
            console.log('자동 재생이 차단됨:', error);
            // 사용자 상호작용 후 재생하도록 이벤트 리스너 추가
            document.addEventListener('click', playVideoOnce, { once: true });
        });
    }
}

// 사용자 클릭 시 비디오 재생
function playVideoOnce() {
    const video = document.getElementById('authVideo');
    if (video) {
        video.play().catch(function(error) {
            console.log('비디오 재생 실패:', error);
        });
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
                downloadAPK();
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
        window.location.href = '/login';
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

//다운로드 APK
function downloadAPK() {
    const link = document.getElementById('apkDownloadLink');
    
    if (!link) {
        alert('다운로드 링크를 찾을 수 없습니다.');
        return;
    }

    if (confirm('캠핑AI 모바일 앱을 다운로드하시겠습니까?\n\n확인을 누르면 APK 파일 다운로드가 시작됩니다.')) {
        link.click();
        alert('APK 다운로드가 시작되었습니다.\n\n다운로드 완료 후 안드로이드 기기에 설치하여 사용하세요.');
    }
}

////브라우저 정책상 autoplay를 위해 muted가 필요함
//window.addEventListener('DOMContentLoaded', () => {
//  const audio = document.getElementById('login-audio');
//  
//  // muted 상태에서 자동 재생 시도
//  audio.play().catch(error => {
//    console.warn("자동 재생이 차단됨:", error);
//    // 사용자가 클릭하면 재생되도록 fallback 처리
//    document.addEventListener('click', () => {
//      audio.muted = false;
//      audio.play();
//    }, { once: true });
//  });
//});

