package com.ncloud.service;

import java.util.List;

import javax.inject.Inject;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ncloud.dao.ChatLibraryDao;
import com.ncloud.domain.ChatLibraryVO;
import com.ncloud.domain.UserChatHistoryVO;

@Service
public class ChatLibraryServiceImpl implements ChatLibraryService{

	@Inject
	private ChatLibraryDao dao;
	
	@Override
	public int insertChatLibrary(ChatLibraryVO vo) throws Exception{
		return dao.insertChatLibrary(vo);
	}
	
	@Override
	public List<ChatLibraryVO> selectChatRoomById(String userId) throws Exception {
	    return dao.selectChatRoomById(userId);
	}
	
	@Override
	public void updateChatRoomTitle(ChatLibraryVO vo) throws Exception {
	    dao.updateChatRoomTitle(vo);
	}
	
	@Override
	public boolean deleteChatRoom(String chatRoomId) throws Exception {
		return dao.deleteChatRoom(chatRoomId);
	}
}
