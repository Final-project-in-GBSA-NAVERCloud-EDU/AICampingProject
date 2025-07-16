package com.ncloud.service;

import javax.inject.Inject;

import org.springframework.stereotype.Service;

import com.ncloud.dao.MBDao;
import com.ncloud.domain.MBVO;

@Service
public class MBServiceImpl implements MBService {

	@Inject
    private MBDao dao;

    @Override
    public int registerUser(MBVO vo) throws Exception {
        return dao.insertUser(vo);
    }
}
