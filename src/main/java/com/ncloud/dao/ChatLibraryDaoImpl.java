package com.ncloud.dao;

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
	public int insertChatHistory(UserChatHistoryVO vo) throws Exception{
		return sql.insert("chatLibrary.insertChatHistory", vo);
	}
	

}
