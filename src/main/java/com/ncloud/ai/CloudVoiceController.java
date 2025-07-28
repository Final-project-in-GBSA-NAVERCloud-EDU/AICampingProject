package com.ncloud.ai;

import org.springframework.web.bind.annotation.*;
import org.json.JSONObject;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.ncloud.common.JsonHndr;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
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

	@RequestMapping(value = "/serveAudio/{filename:.+}", method = RequestMethod.GET)
	public void serveAudioFile(@PathVariable String filename, 
	                          HttpServletRequest request,
	                          HttpServletResponse response) {
	    try {
	        // 모든 가능한 경로에서 파일 찾기
	        String[] possiblePaths = {
	            // 현재 서버의 경로
	            request.getSession().getServletContext().getRealPath("/") + "resources/audio/" + filename,
	            // 하드코딩된 경로 (백업)
	            "/opt/tomcat9/webapps/cicdtest/resources/audio/" + filename
	        };
	        
	        File audioFile = null;
	        String foundPath = null;
	        
	        // 파일이 존재하는 경로 찾기
	        for (String path : possiblePaths) {
	            File file = new File(path);
	            if (file.exists() && file.isFile()) {
	                audioFile = file;
	                foundPath = path;
	                break;
	            }
	        }
	        
	        if (audioFile == null || !audioFile.exists()) {
	            System.err.println("오디오 파일을 찾을 수 없음: " + filename);
	            System.err.println("시도한 경로들:");
	            for (String path : possiblePaths) {
	                System.err.println("  - " + path);
	            }
	            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
	            response.setContentType("application/json");
	            response.getWriter().write("{\"error\": \"Audio file not found\"}");
	            return;
	        }
	        
	        System.out.println("오디오 파일 발견: " + foundPath);
	        
	        // Content-Type 및 헤더 설정
	        response.setContentType("audio/mpeg");
	        response.setContentLength((int) audioFile.length());
	        response.setHeader("Accept-Ranges", "bytes");
	        response.setHeader("Cache-Control", "public, max-age=3600");
	        
	        // CORS 헤더 추가
	        response.setHeader("Access-Control-Allow-Origin", "*");
	        response.setHeader("Access-Control-Allow-Methods", "GET");
	        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
	        
	        // 파일 스트리밍
	        try (FileInputStream fis = new FileInputStream(audioFile);
	             BufferedInputStream bis = new BufferedInputStream(fis);
	             OutputStream os = response.getOutputStream()) {
	            
	            byte[] buffer = new byte[8192];
	            int bytesRead;
	            
	            while ((bytesRead = bis.read(buffer)) != -1) {
	                os.write(buffer, 0, bytesRead);
	            }
	            
	            os.flush();
	        }
	        
	        System.out.println("오디오 파일 전송 완료: " + filename);
	        
	    } catch (FileNotFoundException e) {
	        System.err.println("파일을 찾을 수 없음: " + e.getMessage());
	        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
	        
	    } catch (IOException e) {
	        System.err.println("파일 전송 중 IO 오류: " + e.getMessage());
	        e.printStackTrace();
	        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
	        
	    } catch (Exception e) {
	        System.err.println("파일 서빙 중 예외 발생: " + e.getMessage());
	        e.printStackTrace();
	        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
	    }
	}

	// 기존 textToSpeech 메서드에서 URL 생성 부분만 수정
	@RequestMapping(value = "/textToSpeech", method = RequestMethod.POST)
	public void textToSpeech(HttpServletRequest request, HttpServletResponse response) throws Exception {
	    String text = request.getParameter("text");
	    text = text.replace("<br>", "\n");
	    
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
	        
	        String postParams = "speaker=nes_c_hyeri&volume=0&speed=0&pitch=0&format=mp3&text=" + encodedText;
	        DataOutputStream wr = new DataOutputStream(con.getOutputStream());
	        wr.writeBytes(postParams);
	        wr.flush();
	        wr.close();
	        
	        int responseCode = con.getResponseCode();
	        
	        if(responseCode == 200) {
	            InputStream is = con.getInputStream();
	            int read = 0;
	            byte[] bytes = new byte[1024];
	            
	            // 파일명 생성
	            String fileName = "tts_" + System.currentTimeMillis() + ".mp3";
	            
	            // 웹 애플리케이션의 실제 경로 가져오기
	            String webappPath = request.getSession().getServletContext().getRealPath("/");
	            String audioDir = webappPath + "resources/audio/";
	            String filePath = audioDir + fileName;
	            
	            System.out.println("웹앱 경로: " + webappPath);
	            System.out.println("오디오 디렉토리: " + audioDir);
	            System.out.println("파일 경로: " + filePath);
	            
	            // 디렉토리 생성
	            File dir = new File(audioDir);
	            if (!dir.exists()) {
	                boolean created = dir.mkdirs();
	                System.out.println("디렉토리 생성 결과: " + created);
	            }
	            
	            File f = new File(filePath);
	            f.createNewFile();
	            FileOutputStream outputStream = new FileOutputStream(f);
	            
	            while ((read = is.read(bytes)) != -1) {
	                outputStream.write(bytes, 0, read);
	            }
	            is.close();
	            outputStream.close();
	            
	            // *** 핵심 변경: 컨트롤러를 통한 URL 생성 ***
	            String audioUrl = "/voice/serveAudio/" + fileName;
	            
	            json.put("success", true);
	            json.put("audioUrl", audioUrl);
	            json.put("message", "TTS 생성 완료");
	            
	            System.out.println("생성된 오디오 URL: " + audioUrl);
	            
	        } else {
	            BufferedReader br = new BufferedReader(new InputStreamReader(con.getErrorStream()));
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
	        json.put("message", "TTS 생성 중 오류가 발생했습니다: " + e.getMessage());
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

