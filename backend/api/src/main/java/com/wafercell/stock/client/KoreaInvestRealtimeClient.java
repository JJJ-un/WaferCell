package com.wafercell.stock.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wafercell.global.properties.KoreaInvestProperties;
import com.wafercell.stock.dto.StockUpdate;
import com.wafercell.stock.service.application.StockService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.handler.WebSocketHandlerDecorator;
import org.springframework.web.util.UriComponentsBuilder;

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
public class KoreaInvestRealtimeClient extends TextWebSocketHandler {

    private final KoreaInvestProperties properties;
    private final AuthClient authClient;
    private final SimpMessagingTemplate messagingTemplate;
    // 이거 메인 서비스 로직인데 알차게 쓰이고 있다.
    private final StockService stockService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private final AtomicBoolean isConnecting = new AtomicBoolean(false);
    private final AtomicBoolean reconnectScheduled = new AtomicBoolean(false);
    
    private WebSocketSession session;

    public KoreaInvestRealtimeClient(KoreaInvestProperties properties, 
                                     AuthClient authClient, 
                                     SimpMessagingTemplate messagingTemplate, 
                                     @Lazy StockService stockService) {
        this.properties = properties;
        this.authClient = authClient;
        this.messagingTemplate = messagingTemplate;
        this.stockService = stockService;
    }

    @PostConstruct
    public void init() {
        connect();
    }

    public void connect() {
        if (session != null && session.isOpen()) return;
        if (!isConnecting.compareAndSet(false, true)) return;

        CompletableFuture.runAsync(() -> {
            try {
                log.info("한국투자증권 실시간 서버 연결 시도...");
                String targetUrl = properties.getWsUrl() != null ? properties.getWsUrl() : properties.getUrl();
                String scheme = targetUrl.contains("21000") || targetUrl.contains("31000") ? "ws" : "wss";
                
                String builtUrl = UriComponentsBuilder.fromHttpUrl(targetUrl.replace("ws://", "http://"))
                        .scheme(scheme)
                        .build()
                        .toUriString();
                
                final String wsUrl = builtUrl.endsWith("/") ? builtUrl.substring(0, builtUrl.length() - 1) : builtUrl;
                
                StandardWebSocketClient client = new StandardWebSocketClient();
                client.execute(this, wsUrl).thenAccept(newSession -> {
                    this.session = newSession;
                    isConnecting.set(false);
                    log.info("✅ 실시간 서버 연결 성공: {}", wsUrl);
                    // 연결 성공 후 모든 종목 구독
                    stockService.subscribeAllStocks();
                }).exceptionally(ex -> {
                    isConnecting.set(false);
                    log.error("❌ 실시간 서버 연결 실패: {}", ex.getMessage());
                    scheduleReconnect();
                    return null;
                });
            } catch (Exception e) {
                isConnecting.set(false);
                log.error("연결 준비 중 오류 발생", e);
                scheduleReconnect();
            }
        });
    }

    private void scheduleReconnect() {
        if (reconnectScheduled.compareAndSet(false, true)) {
            log.info("10초 후 재연결 시도...");
            scheduler.schedule(() -> {
                reconnectScheduled.set(false);
                connect();
            }, 10, TimeUnit.SECONDS);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        log.warn("실시간 서버 연결 종료 (Status: {}).", status);
        this.session = null;
        scheduleReconnect();
    }

    public void subscribe(String exchangeCode, String ticker) {
        if (session == null || !session.isOpen()) {
            log.warn("세션이 닫혀있어 [{}] 구독 요청을 보낼 수 없습니다.", ticker);
            return;
        }

        try {
            String approvalKey = authClient.getApprovalKey();
            String trId = "HDFSCNT0"; 
            String marketCode = (exchangeCode.contains("NAS")) ? "DNAS" : "DNYS";
            String trKey = marketCode + ticker;

            Map<String, Object> request = Map.of(
                "header", Map.of(
                    "approval_key", approvalKey,
                    "custtype", "P",
                    "tr_type", "1",
                    "content-type", "utf-8"
                ),
                "body", Map.of(
                    "input", Map.of("tr_id", trId, "tr_key", trKey)
                )
            );
            
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(request)));
            log.info("📡 [구독요청] {}: {}", trId, trKey);
        } catch (Exception e) {
            log.error("구독 중 오류 발생 ({}): {}", ticker, e.getMessage());
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        this.session = session;
        log.info("웹소켓 연결 확립됨.");
    }

    // 한투 실시간 데이터 규격 관련 상수
    private static final String PINGPONG_PAYLOAD = "PINGPONG";
    private static final String STOCK_TR_ID = "0|HDFSCNT0";

    // 인덱스 상수 (HDFSCNT0 기준)
    private static final int INDEX_TICKER = 1;
    private static final int INDEX_TIMESTAMP = 5;
    private static final int INDEX_HIGH_PRICE = 9;
    private static final int INDEX_LOW_PRICE = 10;
    private static final int INDEX_PRICE = 11;
    private static final int INDEX_RATE = 14;
    private static final int INDEX_VOLUME = 20;
    private static final int INDEX_TRADING_VALUE = 21;
    private static final int INDEX_STRENGTH = 24;
    private static final int MIN_SUBPARTS_LENGTH = 25;

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        String payload = message.getPayload();
        
        try {
            // 1. 하트비트(연결 유지) 처리
            if (isHeartbeat(payload)) {
                handleHeartbeat(session, payload);
                return;
            }

            // 2. 실시간 주가 데이터 여부 확인
            if (!isStockData(payload)) {
                return;
            }

            // 3. 데이터 파싱 및 전파 처리
            processStockData(payload);

        } catch (Exception e) {
            log.error("실시간 데이터 처리 중 오류 발생: {}", e.getMessage(), e);
        }
    }

    private boolean isHeartbeat(String payload) {
        return payload.contains(PINGPONG_PAYLOAD);
    }

    private void handleHeartbeat(WebSocketSession session, String payload) throws Exception {
        session.sendMessage(new TextMessage(payload));
    }

    private boolean isStockData(String payload) {
        return payload.startsWith(STOCK_TR_ID);
    }

    private void processStockData(String payload) {
        String[] pipeParts = payload.split("\\|");
        if (pipeParts.length < 4) return;

        String dataPart = pipeParts[3];
        // 여기까진 한투에서 받아온 실시간 데이터
        String[] subParts = dataPart.split("\\^");

        if (subParts.length < MIN_SUBPARTS_LENGTH) {
            log.warn("유효하지 않은 데이터 길이: {}", subParts.length);
            return;
        }

        // 내부에서 다루기 쉬운 형태로 전환
        StockUpdate update = buildStockUpdate(subParts);

        stockService.updateStockCache(update);
        messagingTemplate.convertAndSend("/topic/stocks", update);
    }

    private StockUpdate buildStockUpdate(String[] subParts) {
        return StockUpdate.builder()
                .ticker(subParts[INDEX_TICKER])
                .price(subParts[INDEX_PRICE])
                .highPrice(subParts[INDEX_HIGH_PRICE])
                .lowPrice(subParts[INDEX_LOW_PRICE])
                .rate(subParts[INDEX_RATE])
                .volume(subParts[INDEX_VOLUME])
                .timestamp(subParts[INDEX_TIMESTAMP])
                .tradingValue(subParts[INDEX_TRADING_VALUE])
                .strength(subParts[INDEX_STRENGTH])
                .build();
    }
}
