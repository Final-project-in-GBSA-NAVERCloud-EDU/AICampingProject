package com.ncloud.ai;

import org.springframework.web.bind.annotation.*;
import org.json.JSONObject;
import org.springframework.web.multipart.MultipartFile;

import com.ncloud.common.JsonHndr;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;

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

	        // 네이버 클라우드 TTS API 설정
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

	            // 파일명 생성 (타임스탬프 사용)
	            String fileName = "tts_" + System.currentTimeMillis() + ".mp3";

	            // TTS 응답을 바이트 배열로 읽기
	            ByteArrayOutputStream baos = new ByteArrayOutputStream();
	            byte[] buffer = new byte[1024];
	            int read;
	            while ((read = is.read(buffer)) != -1) {
	                baos.write(buffer, 0, read);
	            }
	            byte[] audioData = baos.toByteArray();
	            is.close();
	            baos.close();

	            // 네이버 Object Storage에 업로드
	            String objectStorageUrl = uploadToObjectStorage(audioData, fileName);

	            if (objectStorageUrl != null) {
	                json.put("success", true);
	                json.put("audioUrl", objectStorageUrl);
	                json.put("message", "TTS 생성 및 업로드 완료");
	            } else {
	                json.put("success", false);
	                json.put("message", "Object Storage 업로드 실패");
	            }

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
	        json.put("message", "TTS 생성 중 오류가 발생했습니다.");
	    }

	    JsonHndr.print(json, response);
	}

	private String uploadToObjectStorage(byte[] audioData, String fileName) {
	    try {
	        // 네이버 Object Storage 설정
	        String accessKey = "ncp_iam_BPASKR5hJ6D4xl31g8Sc";
	        String secretKey = "ncp_iam_BPKSKRLPuiSTbyXA6Vjf4jjggc9guDmtai";
	        String endpoint = "https://kr.object.ncloudstorage.com";
	        String bucketName = "camping-voice";

	        // AWS SDK S3 Client 설정 (네이버 클라우드 Object Storage는 S3 호환)
	        BasicAWSCredentials awsCredentials = new BasicAWSCredentials(accessKey, secretKey);
	        AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
	            .withCredentials(new AWSStaticCredentialsProvider(awsCredentials))
	            .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(endpoint, "kr-standard"))
	            .withPathStyleAccessEnabled(true)
	            .build();

	        // S3 업로드 요청 생성
	        ObjectMetadata metadata = new ObjectMetadata();
	        metadata.setContentLength(audioData.length);
	        metadata.setContentType("audio/mpeg");
	        metadata.setCacheControl("public, max-age=86400"); // 24시간 캐시

	        ByteArrayInputStream inputStream = new ByteArrayInputStream(audioData);

	        PutObjectRequest putObjectRequest = new PutObjectRequest(bucketName, fileName, inputStream, metadata);
	        putObjectRequest.setCannedAcl(CannedAccessControlList.PublicRead); // 공개 읽기 권한

	        // 파일 업로드
	        s3Client.putObject(putObjectRequest);

	        // 업로드된 파일의 공개 URL 반환
	        String publicUrl = endpoint + "/" + bucketName + "/" + fileName;

	        System.out.println("Object Storage 업로드 성공: " + publicUrl);

	        return publicUrl;

	    } catch (Exception e) {
	        System.err.println("Object Storage 업로드 오류: " + e.getMessage());
	        e.printStackTrace();
	        return null;
	    }
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

