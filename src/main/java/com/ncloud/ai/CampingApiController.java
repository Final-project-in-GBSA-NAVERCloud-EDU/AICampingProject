package com.ncloud.ai;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@RestController
@RequestMapping("/Api")
public class CampingApiController {

    @PostMapping("/AiApi")
    public ResponseEntity<Map<String, String>> askAI(@RequestBody Map<String, String> payload) {
        String userMessage = payload.get("message");
        // Python API �샇異�
        String pythonUrl = "http://49.50.131.0:8000/chat";
        RestTemplate restTemplate = new RestTemplate();

        // �슂泥� 諛붾뵒 援ъ꽦
        Map<String, String> pythonRequest = new HashMap<>();
        
        pythonRequest.put("message", userMessage);
        try {
            ResponseEntity<Map> pythonResponse = restTemplate.postForEntity(
                pythonUrl,
                pythonRequest,
                Map.class
            );

            // Python �쓳�떟 �뙆�떛
            String aiResponse = (String) pythonResponse.getBody().get("response");

            // �겢�씪�씠�뼵�듃濡� �쓳�떟 �쟾�떖
            Map<String, String> result = new HashMap<>();
            result.put("response", aiResponse);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("response", "AI �쓳�떟 以� �삤瑜섍� 諛쒖깮�뻽�뒿�땲�떎.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}

