package com.ncloud.ai;

import org.springframework.web.bind.annotation.*;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.ncloud.common.JsonHndr;

import javax.servlet.ServletContext;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.*;

import java.io.*;
import java.net.*;
import java.nio.file.Paths;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.http.Part;

import org.json.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@RestController
@MultipartConfig
@RequestMapping("/voice")
public class CloudVoiceController {

	 @Autowired
	 private ServletContext servletContext;
	 
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
	            HttpURLConnection con = (HttpURLConnection) url.openConnection();
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

	            if (responseCode == 200) {
	                InputStream is = con.getInputStream();
	                int read;
	                byte[] bytes = new byte[1024];

	                String fileName = "tts_" + System.currentTimeMillis() + ".mp3";
	                String realDir = request.getSession().getServletContext().getRealPath("/resources/audio/");
	                String filePath = realDir + fileName;

	                File dir = new File(realDir);
	                if (!dir.exists()) dir.mkdirs();

	                File file = new File(filePath);
	                FileOutputStream outputStream = new FileOutputStream(file);

	                while ((read = is.read(bytes)) != -1) {
	                    outputStream.write(bytes, 0, read);
	                }

	                is.close();
	                outputStream.close();

	                // 📡 다른 서버로도 파일 복제
	                String thisServerIp = request.getLocalAddr(); // 현재 서버 IP
	                String targetServerIp = thisServerIp.equals("10.0.1.6") ? "10.0.11.6" : "10.0.1.6";
	                String targetUrl = "http://" + targetServerIp + ":8080/uploadAudio";

	                try {
	                    String boundary = Long.toHexString(System.currentTimeMillis());
	                    HttpURLConnection uploadCon = (HttpURLConnection) new URL(targetUrl).openConnection();
	                    uploadCon.setDoOutput(true);
	                    uploadCon.setRequestMethod("POST");
	                    uploadCon.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

	                    try (
	                        OutputStream output = uploadCon.getOutputStream();
	                        PrintWriter writer = new PrintWriter(new OutputStreamWriter(output, "UTF-8"), true);
	                        FileInputStream fis = new FileInputStream(file);
	                    ) {
	                        writer.append("--").append(boundary).append("\r\n");
	                        writer.append("Content-Disposition: form-data; name=\"file\"; filename=\"").append(fileName).append("\"\r\n");
	                        writer.append("Content-Type: audio/mpeg\r\n\r\n").flush();

	                        byte[] buffer = new byte[1024];
	                        int bytesRead;
	                        while ((bytesRead = fis.read(buffer)) != -1) {
	                            output.write(buffer, 0, bytesRead);
	                        }
	                        output.flush();

	                        writer.append("\r\n").flush();
	                        writer.append("--").append(boundary).append("--").append("\r\n").flush();
	                    }

	                    int uploadResponse = uploadCon.getResponseCode();
	                    if (uploadResponse == 200) {
	                        System.out.println("✅ 복제 성공: " + targetServerIp);
	                    } else {
	                        System.err.println("❌ 복제 실패: 응답 코드 " + uploadResponse);
	                    }
	                } catch (Exception e) {
	                    System.err.println("📛 복제 중 오류: " + e.getMessage());
	                }

	                json.put("success", true);
	                json.put("audioUrl", "/resources/audio/" + fileName);
	                json.put("message", "TTS 생성 완료");

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
	            e.printStackTrace();
	            json.put("success", false);
	            json.put("message", "TTS 생성 중 오류 발생: " + e.getMessage());
	        }

	        JsonHndr.print(json, response);
	    }

	

	    @RequestMapping(value = "/uploadAudio", method = RequestMethod.POST)
	    public void uploadAudio(@RequestParam("file") MultipartFile file, HttpServletResponse response) throws Exception {
	        String fileName = file.getOriginalFilename();
	        String realPath = servletContext.getRealPath("/resources/audio/");

	        File dir = new File(realPath);
	        if (!dir.exists()) dir.mkdirs();

	        File dest = new File(realPath + fileName);
	        file.transferTo(dest);

	        JSONObject json = new JSONObject();
	        json.put("success", true);
	        json.put("message", "파일 저장 완료");
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

