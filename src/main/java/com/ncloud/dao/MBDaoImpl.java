package com.ncloud.dao;

import javax.inject.Inject;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import com.ncloud.domain.MBVO;
@Repository
public class MBDaoImpl implements MBDao {
	@Inject
    private SqlSession sqlSession;

    @Override
    public int insertUser(MBVO vo) throws Exception {
        return sqlSession.insert("mBMapper.insertUser", vo);
    }
}
