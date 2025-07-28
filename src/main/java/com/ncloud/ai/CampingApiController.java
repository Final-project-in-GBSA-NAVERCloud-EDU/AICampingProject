package com.ncloud.ai;

import org.springframework.web.bind.annotation.*;
import org.json.JSONObject;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import com.ncloud.common.JsonHndr;

import java.util.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/Api")
public class CampingApiController {

    @RequestMapping(value = "/AiApi", method = RequestMethod.GET)
    public void askAI(HttpServletRequest request, HttpServletResponse response) throws Exception {
        String userMessage = request.getParameter("message");
        
        JSONObject json = new JSONObject();
        
        if (userMessage == null || userMessage.trim().isEmpty()) {
            json.put("msg", "메시지가 필요합니다");
            json.put("response", "메시지를 입력해주세요.");
            JsonHndr.print(json, response);
            return;
        }
        
        try {
            // Python API 호출
            String pythonUrl = "http://10.0.1.20:8000/chat";
            RestTemplate restTemplate = new RestTemplate();

            // GET 방식으로 Python API 호출
            String requestUrl = pythonUrl + "?message=" + java.net.URLEncoder.encode(userMessage, "UTF-8");
            
            ResponseEntity<Map> pythonResponse = restTemplate.getForEntity(requestUrl, Map.class);

            System.out.println("");
            if (pythonResponse.getStatusCode().is2xxSuccessful()) {
                // Python 응답 파싱
                Map<String, Object> responseBody = pythonResponse.getBody();
                String aiResponse = null;
                if (responseBody != null) {
                    // Python API 응답 구조에 따라 조정
                    aiResponse = (String) responseBody.get("answer");
                    if (aiResponse == null) {
                        aiResponse = (String) responseBody.get("response");
                    }
                }
                
                if (aiResponse != null && !aiResponse.trim().isEmpty()) {
                    json.put("msg", "AI 응답성공");
                    json.put("response", aiResponse);
                } else {
                    json.put("msg", "AI 응답실패");
                    json.put("response", "AI로부터 응답을 받지 못했습니다.");
                }
            } else {
                json.put("msg", "AI API 호출 실패");
                json.put("response", "AI 서버에서 오류가 발생했습니다.");
            }

        } catch (Exception e) {
            System.err.println("AI API 호출 오류: " + e.getMessage());
            e.printStackTrace();
            
            json.put("msg", "AI 응답실패");
            json.put("response", "AI 응답 중 오류가 발생했습니다.");
        }
        
        JsonHndr.print(json, response);
    }
}

