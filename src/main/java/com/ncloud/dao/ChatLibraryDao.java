package com.ncloud.dao;

import com.ncloud.domain.ChatLibraryVO;
import com.ncloud.domain.UserChatHistoryVO;

public interface ChatLibraryDao {

	public int insertChatLibrary(ChatLibraryVO vo) throws Exception;
	
	public int insertChatHistory(UserChatHistoryVO vo) throws Exception;
}
