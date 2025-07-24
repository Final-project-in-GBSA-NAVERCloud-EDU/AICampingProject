package com.ncloud.ai;

import org.springframework.web.bind.annotation.*;
import org.json.JSONObject;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import com.ncloud.common.JsonHndr;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.*;

@RestController
@RequestMapping("/voice")
public class CloudVoiceController {

	@RequestMapping(value = "/textToSpeech", method = RequestMethod.POST)
	public void textToSpeech(HttpServletRequest request, HttpServletResponse response) throws Exception {
	    String text = request.getParameter("text");
	    
	    JSONObject json = new JSONObject();
	    
	    try {
	        if (text == null || text.trim().isEmpty()) {
	            json.put("success", false);
	            json.put("message", "텍스트가 필요합니다.");
	            JsonHndr.print(json, response);
	            return;
	        }
	        
	        String clientId = "2xhuz460g1";
	        String clientSecret = "lb2qJ7rp8kGTSIT5n7TC4Ze33ChzNBPgeVsiAqLz";
	        
	        String encodedText = URLEncoder.encode(text, "UTF-8");
	        String apiURL = "https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts";
	        
	        URL url = new URL(apiURL);
	        HttpURLConnection con = (HttpURLConnection)url.openConnection();
	        con.setRequestMethod("POST");
	        con.setRequestProperty("X-NCP-APIGW-API-KEY-ID", clientId);
	        con.setRequestProperty("X-NCP-APIGW-API-KEY", clientSecret);
	        con.setDoOutput(true);
	        
	        String postParams = "speaker=nara&volume=0&speed=0&pitch=0&format=mp3&text=" + encodedText;
	        DataOutputStream wr = new DataOutputStream(con.getOutputStream());
	        wr.writeBytes(postParams);
	        wr.flush();
	        wr.close();
	        
	        int responseCode = con.getResponseCode();
	        BufferedReader br;
	        
	        if(responseCode == 200) {
	            InputStream is = con.getInputStream();
	            int read = 0;
	            byte[] bytes = new byte[1024];
	            
	            // 파일명 생성 (타임스탬프 사용)
	            String fileName = "tts_" + System.currentTimeMillis() + ".mp3";
	            String filePath = request.getSession().getServletContext().getRealPath("/resources/audio/") + fileName;
	            
	            // 디렉토리 생성
	            File dir = new File(request.getSession().getServletContext().getRealPath("/resources/audio/"));
	            if (!dir.exists()) {
	                dir.mkdirs();
	            }
	            
	            File f = new File(filePath);
	            f.createNewFile();
	            FileOutputStream outputStream = new FileOutputStream(f);
	            
	            while ((read = is.read(bytes)) != -1) {
	                outputStream.write(bytes, 0, read);
	            }
	            is.close();
	            outputStream.close();
	            
	            json.put("success", true);
	            json.put("audioUrl", "/resources/audio/" + fileName);
	            json.put("message", "TTS 생성 완료");
	            
	        } else {
	            br = new BufferedReader(new InputStreamReader(con.getErrorStream()));
	            String inputLine;
	            StringBuffer errorResponse = new StringBuffer();
	            while ((inputLine = br.readLine()) != null) {
	                errorResponse.append(inputLine);
	            }
	            br.close();
	            
	            json.put("success", false);
	            json.put("message", "TTS 생성 실패: " + errorResponse.toString());
	        }
	        
	    } catch (Exception e) {
	        System.err.println("TTS 생성 오류: " + e.getMessage());
	        e.printStackTrace();
	        
	        json.put("success", false);
	        json.put("message", "TTS 생성 중 오류가 발생했습니다.");
	    }
	    
	    JsonHndr.print(json, response);
	}

}
