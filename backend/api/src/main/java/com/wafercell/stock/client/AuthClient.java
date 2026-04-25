package com.wafercell.stock.client;

import com.wafercell.global.properties.KoreaInvestProperties;
import com.wafercell.stock.dto.ApprovalKeyResponse;
import com.wafercell.stock.dto.TokenResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthClient {

    private final KoreaInvestProperties properties;
    private final RestClient restClient = RestClient.create();

    // 토큰 정보를 메모리에 보관 (캐싱)
    private final AtomicReference<String> accessTokenCache = new AtomicReference<>();
    private final AtomicReference<String> approvalKeyCache = new AtomicReference<>();

    /**
     * [API용] 접근 토큰(Access Token) 발급 (캐싱 적용)
     */
    public String getAccessToken() {
        if (accessTokenCache.get() != null) {
            return accessTokenCache.get();
        }

        synchronized (this) {
            if (accessTokenCache.get() != null) return accessTokenCache.get();

            log.info("새로운 Access Token 발급 요청...");
            Map<String, String> body = Map.of(
                    "grant_type", "client_credentials",
                    "appkey", properties.getKey(),
                    "appsecret", properties.getSecret()
            );

            TokenResponse response = restClient.post()
                    .uri(properties.getUrl() + "/oauth2/tokenP")
                    .body(body)
                    .retrieve()
                    .body(TokenResponse.class);

            if (response == null || response.getAccessToken() == null) {
                log.error("Access Token 발급 실패: {}", response);
                throw new RuntimeException("한국투자증권 Access Token 발급 실패");
            }

            accessTokenCache.set(response.getAccessToken());
            return response.getAccessToken();
        }
    }

    /**
     * [웹소켓용] 실시간 접속 승인키(Approval Key) 발급 (캐싱 적용)
     */
    public String getApprovalKey() {
        if (approvalKeyCache.get() != null) {
            return approvalKeyCache.get();
        }

        synchronized (this) {
            if (approvalKeyCache.get() != null) return approvalKeyCache.get();

            log.info("새로운 Approval Key 발급 요청...");
            Map<String, String> body = Map.of(
                    "grant_type", "client_credentials",
                    "appkey", properties.getKey(),
                    "secretkey", properties.getSecret()
            );

            ApprovalKeyResponse response = restClient.post()
                    .uri(properties.getUrl() + "/oauth2/Approval")
                    .body(body)
                    .retrieve()
                    .body(ApprovalKeyResponse.class);

            if (response == null || response.getApprovalKey() == null) {
                log.error("Approval Key 발급 실패: {}", response);
                throw new RuntimeException("한국투자증권 Approval Key 발급 실패");
            }

            approvalKeyCache.set(response.getApprovalKey());
            return response.getApprovalKey();
        }
    }
}
