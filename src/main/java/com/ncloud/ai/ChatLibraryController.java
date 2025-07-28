package com.ncloud.ai;

import java.util.ArrayList;
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
@RequestMapping("/ChatLibrary")
public class ChatLibraryController {

	@Inject
	ChatLibraryService service;
	
	@Inject
	ChatHistoryService hservice;
	
	@RequestMapping(value = "/sendMessage", method = RequestMethod.POST)
	public void insertChatLibrary(@ModelAttribute("ChatLibraryVO") ChatLibraryVO vo, HttpServletResponse response, HttpServletRequest request) throws Exception {
	    String user_id = request.getParameter("savedUser");
	    String create_at = request.getParameter("currentTime");
	    String message = request.getParameter("message");
	    String selectedChatRoomId = request.getParameter("selectedChatRoomId");
	    String newChatRoomId = request.getParameter("newChatRoomId");
	    String images = request.getParameter("images");
	    
	    int result = 0;
	    int uResult = 0;
	    boolean isNewChatRoom = false;
	    
	    JSONObject json = new JSONObject();
	    
	    System.out.println("images : " + images);
	    // 새 채팅방 생성 처리
	    if (newChatRoomId != null && !newChatRoomId.trim().isEmpty()) {
	        try {
	            int nChatId = Integer.parseInt(newChatRoomId);
	            vo.setUser_chat_library_id(nChatId);
	            vo.setUser_id(user_id);
	            vo.setCreate_at(create_at);
	            result = service.insertChatLibrary(vo);
	            isNewChatRoom = true;
	            
	            if (result == 1) {
	                // 새 채팅방이 생성되었으므로 이어서 메시지도 저장
	                UserChatHistoryVO uvo = new UserChatHistoryVO();
	                uvo.setUser_chat_library_id(nChatId);
	                uvo.setUser_id(user_id);
	                uvo.setAsk_value(message);
	                uResult = hservice.insertChatHistory(uvo);
	                
	                if (uResult == 1) {
	                    json.put("msg", "새 채팅방 생성 및 메시지 저장 성공");
	                } else {
	                    json.put("msg", "새 채팅방 생성 성공, 메시지 저장 실패");
	                }
	            } else {
	                json.put("msg", "새 채팅방 생성 실패");
	            }
	            
	        } catch (NumberFormatException e) {
	            System.err.println("newChatRoomId가 숫자가 아님: " + newChatRoomId);
	            json.put("msg", "잘못된 채팅방 ID 형식");
	        }
	    }
	    // 기존 채팅방 메시지 저장 처리
	    else if (selectedChatRoomId != null && !selectedChatRoomId.trim().isEmpty()) {
	        try {
	            int sChatId = Integer.parseInt(selectedChatRoomId);
	            UserChatHistoryVO uvo = new UserChatHistoryVO();
	            uvo.setUser_chat_library_id(sChatId);
	            uvo.setUser_id(user_id);
	            uvo.setAsk_value(message);
	            uResult = hservice.insertChatHistory(uvo);
	            
	            if (uResult == 1) {
	                json.put("msg", "기존 채팅방 메시지 저장 성공");
	            } else {
	                json.put("msg", "기존 채팅방 메시지 저장 실패");
	            }
	            
	        } catch (NumberFormatException e) {
	            System.err.println("selectedChatRoomId가 숫자가 아님: " + selectedChatRoomId);
	            json.put("msg", "잘못된 채팅방 ID 형식");
	        }
	    } else {
	        json.put("msg", "채팅방 ID가 제공되지 않음");
	    }
	    
	    JsonHndr.print(json, response);
	}

	
	
	@RequestMapping(value = "/getChatRooms", method = RequestMethod.GET)
	public void getChatRooms(HttpServletRequest request, HttpServletResponse response) throws Exception {
	    String user_id = request.getParameter("user_id");
	    
	    JSONObject json = new JSONObject();
	    
	    try {
	        if (user_id == null || user_id.trim().isEmpty()) {
	            json.put("success", false);
	            json.put("message", "사용자 ID가 필요합니다.");
	            JsonHndr.print(json, response);
	            return;
	        }
	        
	        // 사용자의 채팅방 목록 조회
	        List<ChatLibraryVO> chatRoomList = service.selectChatRoomById(user_id);
	        
	        JSONArray chatRoomsArray = new JSONArray();
	        
	        for (ChatLibraryVO chatRoom : chatRoomList) {
	            JSONObject roomObj = new JSONObject();
	            roomObj.put("user_chat_library_id", chatRoom.getUser_chat_library_id());
	            roomObj.put("user_id", chatRoom.getUser_id());
	            roomObj.put("create_at", chatRoom.getCreate_at());
	            roomObj.put("title", chatRoom.getTitle() != null ? chatRoom.getTitle() : "새 대화");
//	            roomObj.put("preview_text", chatRoom.getPreview_text());
	            chatRoomsArray.put(roomObj);
	        }
	        
	        json.put("success", true);
	        json.put("chatRooms", chatRoomsArray);
	        
	    } catch (Exception e) {
	        System.err.println("채팅방 목록 조회 오류: " + e.getMessage());
	        e.printStackTrace();
	        
	        json.put("success", false);
	        json.put("message", "채팅방 목록을 불러오는 중 오류가 발생했습니다.");
	    }
	    
	    JsonHndr.print(json, response);
	}
	
	
	@RequestMapping(value = "/updateChatRoomTitle", method = RequestMethod.POST)
	public void updateChatRoomTitle(HttpServletRequest request, HttpServletResponse response) throws Exception {
	    String chatRoomId = request.getParameter("chatRoomId");
	    String title = request.getParameter("title");
	    
	    JSONObject json = new JSONObject();
	    
	    try {
	        if (chatRoomId == null || chatRoomId.trim().isEmpty()) {
	            json.put("success", false);
	            json.put("message", "채팅방 ID가 필요합니다.");
	            JsonHndr.print(json, response);
	            return;
	        }
	         
	        if (title == null || title.trim().isEmpty()) {
	            json.put("success", false);
	            json.put("message", "제목이 필요합니다.");
	            JsonHndr.print(json, response);
	            return;
	        }
	        
	        // 채팅방 제목 업데이트
	        ChatLibraryVO chatRoom = new ChatLibraryVO();
	        chatRoom.setUser_chat_library_id(Integer.parseInt(chatRoomId));
	        chatRoom.setTitle(title);
	        
	        service.updateChatRoomTitle(chatRoom);
	        
	        json.put("success", true);
	        json.put("message", "채팅방 제목이 업데이트되었습니다.");
	        json.put("title", title);
	        
	    } catch (Exception e) {
	        System.err.println("채팅방 제목 업데이트 오류: " + e.getMessage());
	        e.printStackTrace();
	        
	        json.put("success", false);
	        json.put("message", "채팅방 제목 업데이트 중 오류가 발생했습니다.");
	    }
	    
	    JsonHndr.print(json, response);
	}
	
	@RequestMapping(value = "/deleteChatRoom", method = RequestMethod.POST)
	public void deleteChatRoom(HttpServletRequest request, HttpServletResponse response) throws Exception {
	    String chatRoomId = request.getParameter("chatRoomId");
	    
	    JSONObject json = new JSONObject();
	    
	    try {
	        if (chatRoomId == null || chatRoomId.trim().isEmpty()) {
	            json.put("success", false);
	            json.put("message", "채팅방 ID가 필요합니다.");
	            JsonHndr.print(json, response);
	            return;
	        }
	        
	        // 채팅방 삭제
	        boolean isDeleted = service.deleteChatRoom(chatRoomId);
	        
	        if (isDeleted) {
	            json.put("success", true);
	            json.put("message", "채팅방이 성공적으로 삭제되었습니다.");
	        } else {
	            json.put("success", false);
	            json.put("message", "채팅방 삭제에 실패했습니다.");
	        }
	        
	    } catch (Exception e) {
	        System.err.println("채팅방 삭제 오류: " + e.getMessage());
	        e.printStackTrace();
	        
	        json.put("success", false);
	        json.put("message", "채팅방 삭제 중 오류가 발생했습니다.");
	    }
	    
	    JsonHndr.print(json, response);
	}
   
}
