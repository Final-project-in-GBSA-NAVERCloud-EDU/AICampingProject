package com.ncloud.dao;

import java.util.List;

import com.ncloud.domain.ChatLibraryVO;
import com.ncloud.domain.UserChatHistoryVO;

public interface ChatLibraryDao {

	public int insertChatLibrary(ChatLibraryVO vo) throws Exception;
	
	public List<ChatLibraryVO> selectChatRoomById(String userId) throws Exception;
	
	public void updateChatRoomTitle(ChatLibraryVO vo) throws Exception;
	
	public boolean deleteChatRoom(String chatRoomId) throws Exception;
	
}
