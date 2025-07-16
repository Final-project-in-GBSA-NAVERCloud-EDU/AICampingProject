package com.ncloud.service;

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
	public int insertChatHistory(UserChatHistoryVO vo) throws Exception{
		return dao.insertChatHistory(vo);
	}
	
}
