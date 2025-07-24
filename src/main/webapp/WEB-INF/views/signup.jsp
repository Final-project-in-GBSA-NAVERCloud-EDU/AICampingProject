
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ page session="false" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>캠핑AI - 회원가입</title>
    <link rel="stylesheet" href="/resources/css/style.css" />
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
    <div class="auth-container">
        <div class="auth-box">
            <div class="auth-header">
                <div class="logo">
                    <i class="fas fa-campground"></i>
                    <span>캠핑AI</span>
                </div>
                <h2>회원가입</h2>
                <p>캠핑 AI 전문가와 대화해보세요</p>
            </div>

            <form id="signupForm" onsubmit="handleSignup(event)">
                <div class="input-group">
                    <label for="signupName">이름</label>
                    <input type="text" id="signupName" required>
                </div>
                <div class="input-group">
                    <label for="signupEmail">이메일</label>
                    <input type="email" id="signupEmail" required>
                </div>
                <div class="input-group">
                    <label for="signupPassword">비밀번호</label>
                    <input type="password" id="signupPassword" required>
                </div>
                <div class="input-group">
                    <label for="confirmPassword">비밀번호 확인</label>
                    <input type="password" id="confirmPassword" required>
                </div>
                <button type="submit" class="auth-btn">회원가입</button>
            </form>

            <div class="auth-footer">
                <p>이미 계정이 있으신가요? <a href="/login">로그인</a></p>
                <p><a href="/chat">로그인 없이 시작하기</a></p>
            </div>
        </div>
    </div>

    <script src="/resources/script/auth.js"></script>
    <script src="/resources/script/main.js"></script>
</body>
</html>
