package com.ncloud.ai;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;

import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@Controller
public class SpeechToTextController {

    // ✅ 하드코딩된 Client ID/Secret
    private final String clientId = "2xhuz460g1";
    private final String clientSecret = "lb2qJ7rp8kGTSIT5n7TC4Ze33ChzNBPgeVsiAqLz";

    @PostMapping("/stt")
    public void speechToText(@RequestParam("file") MultipartFile file, HttpServletResponse response) {
    	
    	JSONObject json = new JSONObject();
        try {
            String language = "Kor";
            String apiURL = "https://naveropenapi.apigw.ntruss.com/recog/v1/stt?lang=" + language;

            URL url = new URL(apiURL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setUseCaches(false);
            conn.setDoOutput(true);
            conn.setDoInput(true);
            conn.setRequestProperty("Content-Type", "application/octet-stream");
            conn.setRequestProperty("X-NCP-APIGW-API-KEY-ID", clientId);
            conn.setRequestProperty("X-NCP-APIGW-API-KEY", clientSecret);

            // 음성 파일 스트림 전송
            OutputStream outputStream = conn.getOutputStream();
            InputStream inputStream = file.getInputStream();
            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }
            outputStream.flush();
            inputStream.close();

            // 응답 처리
            int responseCode = conn.getResponseCode();
            
            BufferedReader br;
            
            StringBuilder result = new StringBuilder();
            String line;
            if (responseCode == 200) {
                br = new BufferedReader(new InputStreamReader(conn.getInputStream(),"UTF-8"));
            	while ((line = br.readLine()) != null){
        			result.append(line);
        			}
        		br.close();
        				
        		JSONObject clovaJson = new JSONObject(result.toString());
        		String recognizedText = clovaJson.optString("text", ""); // 실제 텍스트

                json.put("success", true);
				/* json.put("audioUrl", "/resources/voice/" ); */
	            json.put("message", "STT 생성 완료");
	            json.put("text", recognizedText);
            } else {
                br = new BufferedReader(new InputStreamReader(conn.getErrorStream(),"UTF-8"));
                while((line = br.readLine()) != null) {
                	result.append(line);
                }
                br.close();
                System.out.println("❌ 오류 응답 코드: " + responseCode);
                json.put("success", false);
                json.put("error", result.toString());
            
            }

            // JSON 응답 전송
           
            response.setContentType("application/json; charset=UTF-8");
            response.getWriter().write(json.toString());
            
        } catch (Exception e) {
            e.printStackTrace();
            try {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"error\": \"" + e.getMessage() + "\"}");
            } catch (IOException ignored) {}
        }
    }
}
