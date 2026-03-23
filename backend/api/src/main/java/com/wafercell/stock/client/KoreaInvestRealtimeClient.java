package com.wafercell.stock.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wafercell.global.properties.KoreaInvestProperties;
import com.wafercell.stock.dto.StockUpdate;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * 한국투자증권 실시간 웹소켓 서버와 연결하여 주가 변동을 중계하는 클라이언트
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KoreaInvestRealtimeClient extends TextWebSocketHandler {

    private final KoreaInvestProperties properties;
    private final AuthClient authClient;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private final AtomicBoolean isConnecting = new AtomicBoolean(false);
    private final AtomicBoolean reconnectScheduled = new AtomicBoolean(false);
    
    private WebSocketSession session;

    @PostConstruct
    public void init() {
        connect();
    }

    /**
     * 실시간 서버에 연결을 시도합니다. (중복 연결 방지 로직 포함)
     */
    public void connect() {
        if (session != null && session.isOpen()) {
            return;
        }

        if (!isConnecting.compareAndSet(false, true)) {
            log.info("이미 실시간 서버 연결 시도가 진행 중입니다.");
            return;
        }

        CompletableFuture.runAsync(() -> {
            try {
                log.info("한국투자증권 실시간 서버 연결 시도...");
                String wsUrl = properties.getUrl().replace("https://", "wss://") + ":" + properties.getWsPort();
                
                StandardWebSocketClient client = new StandardWebSocketClient();
                client.execute(this, wsUrl).thenAccept(newSession -> {
                    this.session = newSession;
                    isConnecting.set(false);
                    log.info("한국투자증권 실시간 서버 연결 성공: {}", wsUrl);
                }).exceptionally(ex -> {
                    isConnecting.set(false);
                    log.error("한국투자증권 실시간 서버 연결 실패: {}", ex.getMessage());
                    scheduleReconnect();
                    return null;
                });
            } catch (Exception e) {
                isConnecting.set(false);
                log.error("실시간 연결 준비 중 오류 발생", e);
                scheduleReconnect();
            }
        });
    }

    /**
     * 10초 후 재연결을 예약합니다. (중복 예약 방지)
     */
    private void scheduleReconnect() {
        if (reconnectScheduled.compareAndSet(false, true)) {
            log.info("10초 후 재연결을 시도합니다...");
            scheduler.schedule(() -> {
                reconnectScheduled.set(false);
                connect();
            }, 10, TimeUnit.SECONDS);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        log.warn("한국투자증권 실시간 서버 연결 종료 (Status: {}).", status);
        this.session = null;
        scheduleReconnect();
    }

    public void subscribe(String exchangeCode, String ticker) {
        if (session == null || !session.isOpen()) return;

        try {
            String approvalKey = authClient.getApprovalKey();
            Map<String, Object> request = Map.of(
                "header", Map.of(
                    "approval_key", approvalKey,
                    "custtype", "P",
                    "tr_type", "1",
                    "content-type", "utf-8"
                ),
                "body", Map.of(
                    "input", Map.of(
                        "tr_id", "H0GDFS0",
                        "tr_key", exchangeCode + ticker
                    )
                )
            );
            
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(request)));
            log.info("실시간 구독 요청 전송: {} {}", exchangeCode, ticker);
        } catch (Exception e) {
            log.error("구독 요청 중 오류 발생", e);
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        this.session = session;
        // 연결 직후 주요 종목 자동 구독 예시
        subscribe("NAS", "NVDA");
        subscribe("NAS", "AMD");
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        String payload = message.getPayload();
        
        try {
            // KIS 데이터는 실시간 체결 데이터인 경우 '0|' 또는 '1|'로 시작합니다.
            if (!payload.startsWith("0|") && !payload.startsWith("1|")) {
                log.debug("KIS 제어 메시지 또는 기타 응답: {}", payload);
                return;
            }

            String[] parts = payload.split("\\|");
            
            // 해외주식 실시간 체결 데이터 (TR_ID: H0GDFS0) 확인
            if (parts.length > 10 && "H0GDFS0".equals(parts[1])) {
                String rawSymbol = parts[3]; // 예: NASNVDA
                String price = parts[4];     // 현재가
                String rate = parts[5];      // 등락률
                String volume = parts[9];    // 누적 거래량
                String time = parts[10];     // 현지 시간

                String ticker = extractTicker(rawSymbol);

                StockUpdate update = StockUpdate.builder()
                        .ticker(ticker)
                        .price(price)
                        .rate(rate)
                        .volume(volume)
                        .timestamp(time)
                        .build();

                // 종목별 개별 채널로 라우팅 (/topic/stocks/NVDA)
                String destination = "/topic/stocks/" + ticker;
                messagingTemplate.convertAndSend(destination, update);
                
                log.debug("실시간 데이터 라우팅: {} -> {}", ticker, price);
            }
        } catch (Exception e) {
            log.error("메시지 파싱 및 라우팅 중 오류 발생: payload={}", payload, e);
        }
    }

    private String extractTicker(String rawSymbol) {
        if (rawSymbol.length() > 3 && (rawSymbol.startsWith("NAS") || rawSymbol.startsWith("NYS") || rawSymbol.startsWith("AMS"))) {
            return rawSymbol.substring(3);
        }
        return rawSymbol;
    }
}
