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
import com.ncloud.service.ChatLibraryService;



@Controller
@RequestMapping("/ChatLibrary")
public class ChatLibraryController {

	@Inject
	ChatLibraryService service;
	
	@RequestMapping(value = "/sendMessage")
	public void insertChatLibrary(@ModelAttribute("ChatLibraryVO") ChatLibraryVO vo, HttpServletResponse response, HttpServletRequest request) throws Exception {
		String user_id = request.getParameter("savedUser");
		String create_at = request.getParameter("currentTime");
				
		vo.setUser_id(user_id);
		vo.setCreate_at(create_at);
		
		int result = service.insertChatLibrary(vo);
		
		
		
	}
}
