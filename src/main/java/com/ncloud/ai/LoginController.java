package com.ncloud.ai;

import java.util.HashMap;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.ncloud.common.JsonHndr;

import com.ncloud.domain.LoginVO;
import com.ncloud.service.LoginService;
import com.ncloud.service.LoginService;

@Controller
@RequestMapping("/Login")
public class LoginController {
	
	@Inject
	LoginService service;
	
	@PostMapping(value = "/signin")
	public String insertChatLibrary(@ModelAttribute("LoginVO") LoginVO vo, HttpServletResponse response, HttpServletRequest request) throws Exception {
		String user_email = request.getParameter("user_email");
		String user_pwd = request.getParameter("password");


		vo.setEmail(user_email);
		vo.setPassword(user_pwd);

		
		
		int result = service.checkUser(vo);
		
		// 쿼리 로그 남길수있도록 설정
		// 홈 페이지 
		
		// 리절트 = 1 인경우 
		// 디비에 데이터가 있다는거니까 여기서 쿠키생성
		
		// 리절트 < 0 인경우
		// 그냥 리턴 
		
		
		return "home";
	}
}
