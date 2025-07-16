package com.ncloud.dao;

import javax.inject.Inject;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import com.ncloud.domain.LoginVO;
@Repository
public class LoginDaoImpl implements LoginDao {
	@Inject
    private SqlSession sqlSession;

    @Override
    public int checkUser(LoginVO vo) throws Exception {
        return sqlSession.insert("loginMapper.checkUser", vo);
    }
}
