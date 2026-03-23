package com.wafercell.global.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "koreainvest.api") // YAML의 'koreainvest.api' 하위 설정을 읽어옵니다.
public class KoreaInvestProperties {
    private String key;
    private String secret;
    private String url;
    private int wsPort = 9443; // 기본값 9443
}