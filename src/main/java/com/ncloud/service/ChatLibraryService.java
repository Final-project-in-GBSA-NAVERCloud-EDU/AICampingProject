package com.ncloud.service;

import com.ncloud.domain.ChatLibraryVO;
import com.ncloud.domain.UserChatHistoryVO;

public interface ChatLibraryService {

	public int insertChatLibrary(ChatLibraryVO vo) throws Exception;
	
	public int insertChatHistory(UserChatHistoryVO vo) throws Exception;
}
