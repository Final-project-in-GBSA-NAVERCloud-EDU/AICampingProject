//TTS 기능
function playTextToSpeech(text, content) {
    console.log('TTS 요청:', text);
    
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