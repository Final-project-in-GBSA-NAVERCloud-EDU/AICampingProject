package com.ncloud.domain;

import java.util.Date;

public class UserChatHistoryVO {

	private String order;
	private int user_chat_library_id;
	private String user_id;
	private String ask_value;
	private String answer_value;
	private String extra_data;
	private String ask_create_at;
	private String answer_create_at;
	
	
	public String getOrder() {
		return order;
	}
	public void setOrder(String order) {
		this.order = order;
	}
	public int getUser_chat_library_id() {
		return user_chat_library_id;
	}
	public void setUser_chat_library_id(int user_chat_library_id) {
		this.user_chat_library_id = user_chat_library_id;
	}
	public String getUser_id() {
		return user_id;
	}
	public void setUser_id(String user_id) {
		this.user_id = user_id;
	}
	public String getAsk_value() {
		return ask_value;
	}
	public void setAsk_value(String ask_value) {
		this.ask_value = ask_value;
	}
	public String getAnswer_value() {
		return answer_value;
	}
	public void setAnswer_value(String answer_value) {
		this.answer_value = answer_value;
	}
	public String getExtra_data() {
		return extra_data;
	}
	public void setExtra_data(String extra_data) {
		this.extra_data = extra_data;
	}
	public String getAsk_create_at() {
		return ask_create_at;
	}
	public void setAsk_create_at(String ask_create_at) {
		this.ask_create_at = ask_create_at;
	}
	public String getAnswer_create_at() {
		return answer_create_at;
	}
	public void setAnswer_create_at(String answer_create_at) {
		this.answer_create_at = answer_create_at;
	}
	
}
