package com.ncloud.ai;

import java.util.HashMap;
import java.util.Map;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestMethod;

import com.ncloud.common.JsonHndr;
import com.ncloud.domain.ChatLibraryVO;
import com.ncloud.domain.UserChatHistoryVO;
import com.ncloud.service.ChatLibraryService;



@Controller
@RequestMapping("/ChatLibrary")
public class ChatLibraryController {

	@Inject
	ChatLibraryService service;
	
	@RequestMapping(value = "/sendMessage")
	public void insertChatLibrary(@ModelAttribute("ChatLibraryVO") ChatLibraryVO vo ,HttpServletResponse response, HttpServletRequest request) throws Exception {
		String user_id = request.getParameter("savedUser");
		String create_at = request.getParameter("currentTime");
		String message = request.getParameter("message");
		String selectedChatRoomId = request.getParameter("selectedChatRoomId");
		String newChatRoomId = request.getParameter("newChatRoomId");
		String chatId = "";
		
		if(selectedChatRoomId != null) {
			chatId = selectedChatRoomId;
		}else if(newChatRoomId != null) {
			chatId = newChatRoomId;
		}
		
		vo.setUser_chat_library_id(Integer.parseInt(chatId));
		vo.setUser_id(user_id);
		vo.setCreate_at(create_at);
		int result = service.insertChatLibrary(vo);
		
<<<<<<< HEAD
=======
		UserChatHistoryVO uvo = new UserChatHistoryVO();
		
		uvo.setUser_chat_library_id(Integer.parseInt(chatId));
		uvo.setUser_id(user_id);
		uvo.setAsk_value(message);
		
		int uResult = 0;
		
		if(result == 1) {
			uResult = service.insertChatHistory(uvo);
		}
		
		JSONObject json = new JSONObject();
		if(uResult == 1) {
			json.put("msg", "성공");		
		}else {
			json.put("msg", "실패");
		}
>>>>>>> refs/remotes/orgin/master
		
		
	}
}
