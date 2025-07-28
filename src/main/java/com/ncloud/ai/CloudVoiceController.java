package com.ncloud.ai;

import org.springframework.web.bind.annotation.*;
import org.json.JSONObject;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.ncloud.common.JsonHndr;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
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
	    text = text.replace("<br>", "\n"); // 또는 공백으로
	    
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
	        //이밑에 speaker이 음성모델 선택임 볼륨 음성크기 5는1.5배크개 -5는 0.5배 스피드 음성속도 10은2배느리게 -5는 2배빠르게  피치 음높낮이 5가 1.2배 높은음 -5가 0.8배 낮은음
	        String postParams = "speaker=nes_c_hyeri&volume=0&speed=0&pitch=0&format=mp3&text=" + encodedText;
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
	            
	            System.out.println("filePath : " + filePath);
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
	            json.put("audioUrl", "http://final-lb-107508807-f470e9e7c18c.kr.lb.naverncp.com/resources/audio/" + fileName);
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
	

	// ✅ 하드코딩된 Client ID/Secret
	private final String clientId = "2xhuz460g1";
	private final String clientSecret = "lb2qJ7rp8kGTSIT5n7TC4Ze33ChzNBPgeVsiAqLz";

	@PostMapping("/speechToText")
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
				br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
				while ((line = br.readLine()) != null) {
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
				br = new BufferedReader(new InputStreamReader(conn.getErrorStream(), "UTF-8"));
				while ((line = br.readLine()) != null) {
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
			} catch (IOException ignored) {
			}
		}
	}
}

