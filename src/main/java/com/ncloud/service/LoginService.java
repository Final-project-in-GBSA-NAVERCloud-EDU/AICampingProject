package com.ncloud.service;

import com.ncloud.domain.LoginVO;


public interface LoginService {
    public int checkUser(LoginVO vo) throws Exception;
    
}
