package com.ncloud.ai;

import java.util.HashMap;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;

import com.ncloud.common.JsonHndr;

import com.ncloud.domain.MBVO;

import com.ncloud.service.MBService;

@Controller
@RequestMapping("/Member")
public class MBController {
	
	@Inject
	MBService service;
	
	@RequestMapping(value = "/signup")
	public String insertChatLibrary(@ModelAttribute("MBVO") MBVO vo, HttpServletResponse response, HttpServletRequest request) throws Exception {
		String user_id = request.getParameter("user_id");
		String user_name = request.getParameter("name");
		String user_email = request.getParameter("email");
		String user_pwd = request.getParameter("password");
		/*
		 * String create_at = request.getParameter("currentTime"); String update_at =
		 * request.getParameter("currentTime");
		 */
		
				
		vo.setUser_id(user_id);
		vo.setName(user_name);
		vo.setEmail(user_email);
		vo.setPassword(user_pwd);
		/*
		 * vo.setCreate_at(create_at); vo.setUpdate_at(update_at);
		 */
		 
		
		
		int result = service.registerUser(vo);
		
		
		
		return "home";
	}
}
