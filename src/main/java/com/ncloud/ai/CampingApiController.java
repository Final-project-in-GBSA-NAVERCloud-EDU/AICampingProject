package com.ncloud.ai;

import org.springframework.web.bind.annotation.*;
import org.json.JSONObject;
import org.springframework.http.*;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import com.ncloud.common.JsonHndr;

import java.util.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/Api")
public class CampingApiController {

    // AI API 서버 IP 목록 (우선순위대로)
    private static final String[] AI_SERVER_IPS = {
        "http://10.0.1.20:8000/chat",
        "http://10.0.11.20:8080/chat"
//        "http://49.50.131.0:8000/chat",
//        "http://192.168.1.100:8000/chat"  // 필요시 추가 IP
    };

    @RequestMapping(value = "/AiApi", method = RequestMethod.GET)
    public void askAI(HttpServletRequest request, HttpServletResponse response) throws Exception {
        String userMessage = request.getParameter("message");
        
        System.out.println("userMessage : " + userMessage);
        JSONObject json = new JSONObject();
        
        if (userMessage == null || userMessage.trim().isEmpty()) {
            json.put("msg", "메시지가 필요합니다");
            json.put("response", "메시지를 입력해주세요.");
            JsonHndr.print(json, response);
            return;
        }
        
        String aiResponse = null;
        boolean success = false;
        String errorMsg = "";
        
        // 각 서버 IP를 순차적으로 시도
        for (String serverUrl : AI_SERVER_IPS) {
            try {
                System.out.println("AI API 호출 시도: " + serverUrl);
                
                RestTemplate restTemplate = new RestTemplate();
                
                // 타임아웃 설정 (5초)
                restTemplate.getMessageConverters().add(0, new org.springframework.http.converter.StringHttpMessageConverter(java.nio.charset.StandardCharsets.UTF_8));
                
                // GET 방식으로 Python API 호출
                String requestUrl = serverUrl + "?message=" + userMessage;
                
                ResponseEntity<Map> pythonResponse = restTemplate.getForEntity(requestUrl, Map.class);
                
                System.out.println("응답 상태 코드: " + pythonResponse.getStatusCode());
                
                if (pythonResponse.getStatusCode().is2xxSuccessful()) {
                    // Python 응답 파싱
                    Map<String, Object> responseBody = pythonResponse.getBody();
                    if (responseBody != null) {
                        // Python API 응답 구조에 따라 조정
                        aiResponse = (String) responseBody.get("answer");
                        System.out.println("aiResponse : " + aiResponse);
                        if (aiResponse == null) {
                            aiResponse = (String) responseBody.get("response");
                            System.out.println("aiResponse : " + aiResponse);
                        }
                        
                        if (aiResponse != null && !aiResponse.trim().isEmpty()) {
                            success = true;
                            System.out.println("AI 응답 성공: " + serverUrl);
                            break; // 성공하면 루프 종료
                        }
                    }
                } else {
                    System.out.println("HTTP 응답 오류: " + pythonResponse.getStatusCode() + " - " + serverUrl);
                    errorMsg = "HTTP " + pythonResponse.getStatusCode() + " 오류";
                }
                
            } catch (ResourceAccessException e) {
                System.err.println("연결 오류 (" + serverUrl + "): " + e.getMessage());
                errorMsg = "연결 시간 초과 또는 네트워크 오류";
                // 다음 서버로 계속 시도
                continue;
            } catch (Exception e) {
                System.err.println("AI API 호출 오류 (" + serverUrl + "): " + e.getMessage());
                e.printStackTrace();
                errorMsg = "API 호출 중 오류 발생";
                // 다음 서버로 계속 시도
                continue;
            }
        }
        
        // 결과 처리
        if (success && aiResponse != null && !aiResponse.trim().isEmpty()) {
            json.put("msg", "AI 응답성공");
            json.put("response", aiResponse);
        } else {
            json.put("msg", "AI 응답실패");
            json.put("response", "모든 AI 서버에서 응답을 받지 못했습니다. (" + errorMsg + ")");
        }
        
        JsonHndr.print(json, response);
    }
}
