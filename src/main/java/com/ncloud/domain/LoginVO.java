package com.ncloud.domain;

import java.util.Date;

public class LoginVO {
    private String email;
    private String password;



    public String getEmail() { 
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
 
    public void setPassword(String password) {
        this.password = password;
    }
    public String getPassword() {
		return password;
	}

}
