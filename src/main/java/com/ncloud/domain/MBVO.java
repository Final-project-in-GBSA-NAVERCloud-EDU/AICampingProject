package com.ncloud.domain;

import java.util.Date;

public class MBVO {
    private String user_id;
    private String name;
    private String email;
    private String password;
    private String create_at;
    private String update_at;


    public void setUser_id(String user_id) {
        this.user_id = user_id;
    }

    public void setName(String name) {
        this.name = name;
    }


    public void setEmail(String email) {
        this.email = email;
    }

  
    public void setPassword(String password) {
        this.password = password;
    }


    public void setCreate_at(String create_at) {
        this.create_at = create_at;
    }

    public void setUpdate_at(String update_at) {
        this.update_at = update_at;
    }
}
