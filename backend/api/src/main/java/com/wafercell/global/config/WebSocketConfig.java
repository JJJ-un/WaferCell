package com.wafercell.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * 실시간 주가 데이터 전송을 위한 웹소켓 설정
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 클라이언트가 구독할 채널의 접두사 (ex: /topic/stocks)
        config.enableSimpleBroker("/topic");
        // 클라이언트가 서버로 메시지를 보낼 때 사용하는 접두사 (ex: /app/stock/subscribe)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 프론트엔드 웹소켓 접속 관문 (SockJS 지원 포함)
        registry.addEndpoint("/ws-stomp")
                .setAllowedOriginPatterns("*") // 모든 출처 허용 (개발 단계)
                .withSockJS();
    }
}
