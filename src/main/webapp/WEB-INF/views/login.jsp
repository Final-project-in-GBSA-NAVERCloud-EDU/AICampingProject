
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ page session="false" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>캠핑AI - 로그인</title>
    <link rel="stylesheet" href="/resources/css/style.css" />
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
<div id="authScreen" class="auth-screen">
        <video id="authVideo" class="auth-video-background" autoplay muted loop>
            <source src="/resources/video/camp.mp4" type="video/mp4">
            <source src="/resources/video/camp.mp4" type="video/mp4">
        </video>
        <div class="auth-video-overlay"></div>
    <div class="auth-container">
        <div class="auth-box">
            <div class="auth-header">
                <div class="logo">
                    <i class="fas fa-campground"></i>
                    <span>캠핑AI</span>
                </div>
                <h2>로그인</h2>
                <p>캠핑 AI 전문가와 대화해보세요</p>
            </div>
			<a id="apkDownloadLink" href="/downloadApk" style="display:none;"></a>
            <form id="loginForm" onsubmit="handleLogin(event)">
                <div class="input-group">
                    <label for="loginEmail">이메일</label>
                    <input type="email" id="loginEmail" required>
                </div>
                <div class="input-group">
                    <label for="loginPassword">비밀번호</label>
                    <input type="password" id="loginPassword" required>
                </div>
                <button type="submit" class="auth-btn">로그인</button>
            </form>

            <div class="auth-footer">
                <p>계정이 없으신가요? <a href="/signup">회원가입</a></p>
                <p><a href="/chat">로그인 없이 시작하기</a></p>
            </div>
        </div>
    </div>
</div>
    <script src="/resources/script/auth.js"></script>
    <script src="/resources/script/main.js"></script>
</body>
</html>
