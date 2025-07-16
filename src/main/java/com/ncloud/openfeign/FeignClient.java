package com.ncloud.openfeign;

import org.springframework.web.bind.annotation.GetMapping;

@org.springframework.cloud.openfeign.FeignClient(name = "example-service", url = "${example-service.url}")
public interface FeignClient {
	 @GetMapping("/api/resource")
	    String getResource();
}
