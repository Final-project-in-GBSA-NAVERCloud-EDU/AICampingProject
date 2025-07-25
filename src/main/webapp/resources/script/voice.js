
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