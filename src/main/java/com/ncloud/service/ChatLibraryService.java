package com.ncloud.service;

import java.util.List;

import com.ncloud.domain.ChatLibraryVO;
import com.ncloud.domain.UserChatHistoryVO;

public interface ChatLibraryService {

	public int insertChatLibrary(ChatLibraryVO vo) throws Exception;
	
	public List<ChatLibraryVO> selectChatRoomById(String userId) throws Exception;
	
	public void updateChatRoomTitle(ChatLibraryVO vo) throws Exception;
	
	public boolean deleteChatRoom(String chatRoomId) throws Exception;
}
