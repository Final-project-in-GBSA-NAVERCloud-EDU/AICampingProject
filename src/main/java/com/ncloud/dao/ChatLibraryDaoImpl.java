package com.ncloud.dao;

import java.util.List;

import javax.inject.Inject;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import com.ncloud.domain.ChatLibraryVO;
import com.ncloud.domain.UserChatHistoryVO;

@Repository
public class ChatLibraryDaoImpl implements ChatLibraryDao{

	@Inject
	private SqlSession sql;
	
	@Override
	public int insertChatLibrary(ChatLibraryVO vo) throws Exception{
		return sql.insert("chatLibrary.insertChatLibrary", vo);
	}
	
	@Override
	public List<ChatLibraryVO> selectChatRoomById(String userId) {
	    return sql.selectList("chatLibrary.selectChatRoomById", userId);
	}
	
	@Override
	public void updateChatRoomTitle(ChatLibraryVO vo) throws Exception {
		sql.update("chatLibrary.updateChatRoomTitle", vo);
	}
	
	@Override
	public boolean deleteChatRoom(String chatRoomId) throws Exception {
		int result = sql.delete("chatLibrary.deleteChatRoom", chatRoomId);
		
		return result > 0;
	}

	
}
