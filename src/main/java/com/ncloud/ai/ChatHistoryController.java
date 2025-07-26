package com.ncloud.ai;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.ncloud.common.JsonHndr;
import com.ncloud.domain.ChatLibraryVO;
import com.ncloud.domain.UserChatHistoryVO;
import com.ncloud.service.ChatHistoryService;
import com.ncloud.service.ChatLibraryService;

import org.springframework.web.bind.annotation.RequestMethod;


@Controller
@RequestMapping("/ChatHistory")
public class ChatHistoryController {

	@Inject
	ChatHistoryService service;
	
	@RequestMapping(value = "/sendAiMessage", method = RequestMethod.POST)
	public void insertChatLibrary(@ModelAttribute("UserChatHistoryVO") UserChatHistoryVO vo ,HttpServletResponse response, HttpServletRequest request) throws Exception {
		String user_id = request.getParameter("savedUser");
		String selectedChatRoomId = request.getParameter("finalChatRoomId");
		String newChatRoomId = request.getParameter("newChatRoomId");
		String answer_value = request.getParameter("message");
		String currentTime = request.getParameter("currentTime");
				
		String chatId = "";
		if(selectedChatRoomId != null) {
			chatId = selectedChatRoomId;
		}else if(newChatRoomId != null) {
			chatId = newChatRoomId;
		}	
		
		vo.setAnswer_create_at(currentTime);
		vo.setAnswer_value(answer_value);
		vo.setUser_chat_library_id(Integer.parseInt(chatId));
		vo.setUser_id(user_id);
		
		int result = service.updateAimessage(vo);
		
		JSONObject json = new JSONObject();
		if(result == 1) {
			json.put("msg", "AI 응답성공");		
		}else {
			json.put("msg", "AI 응답실패");
		}
		
		JsonHndr.print(json, response);
	}
	
	@RequestMapping(value = "/getChatMessages", method = RequestMethod.GET)
	public void getChatMessages(HttpServletRequest request, HttpServletResponse response) throws Exception {
	    String chatRoomId = request.getParameter("roomId");
	    
	    JSONObject json = new JSONObject();
	    
	    try {
	        if (chatRoomId == null || chatRoomId.trim().isEmpty()) {
	            json.put("success", false);
	            json.put("message", "채팅방 ID가 필요합니다.");
	            JsonHndr.print(json, response);
	            return;
	        }
	        
	        // 채팅방의 메시지 히스토리 조회
	        List<UserChatHistoryVO> messageList = service.getChatMessagesByRoomId(Integer.parseInt(chatRoomId));
	        
	        JSONArray messagesArray = new JSONArray();
	        
	        for (UserChatHistoryVO message : messageList) {
	            JSONObject messageObj = new JSONObject();
	            messageObj.put("question_create_at", message.getAsk_create_at());
	            messageObj.put("question_value", message.getAsk_value());
	            messageObj.put("answer_create_at", message.getAnswer_create_at());
	            messageObj.put("answer_value", message.getAnswer_value());
	            messagesArray.put(messageObj);
	        }
	        	        
	        json.put("success", true);
	        json.put("messages", messagesArray);
	        
	    } catch (NumberFormatException e) {
	        json.put("success", false);
	        json.put("message", "잘못된 채팅방 ID 형식입니다.");
	    } catch (Exception e) {
	        System.err.println("채팅 메시지 조회 오류: " + e.getMessage());
	        e.printStackTrace();
	        
	        json.put("success", false);
	        json.put("message", "채팅 메시지를 불러오는 중 오류가 발생했습니다.");
	    }
	    
	    JsonHndr.print(json, response);
	}
}
