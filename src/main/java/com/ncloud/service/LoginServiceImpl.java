package com.ncloud.service;

import javax.inject.Inject;

import org.springframework.stereotype.Service;

import com.ncloud.dao.LoginDao;
import com.ncloud.domain.LoginVO;

@Service
public class LoginServiceImpl implements LoginService {

	@Inject
    private LoginDao dao;

    @Override
    public int checkUser(LoginVO vo) throws Exception {
    	
        return dao.checkUser(vo);
    }
}
