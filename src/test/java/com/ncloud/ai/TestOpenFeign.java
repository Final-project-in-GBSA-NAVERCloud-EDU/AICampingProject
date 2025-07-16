package com.ncloud.ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients // OpenFeign 활성화
@SpringBootApplication
public class TestOpenFeign {
    public static void main(String[] args) {
        SpringApplication.run(TestOpenFeign.class, args);
    }

}
