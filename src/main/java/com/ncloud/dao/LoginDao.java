package com.ncloud.dao;

import com.ncloud.domain.LoginVO;

public interface LoginDao {
    public int checkUser(LoginVO vo) throws Exception;
}
