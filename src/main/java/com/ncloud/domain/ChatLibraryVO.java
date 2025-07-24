package com.ncloud.domain;

import java.util.Date;

public class ChatLibraryVO {

	private int user_chat_library_id; 
	private String user_id; 
	private String create_at;
	private String title;
	
	
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
	public String getCreate_at() {
		return create_at;
	}
	public void setCreate_at(String create_at) {
		this.create_at = create_at;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	
	
}
