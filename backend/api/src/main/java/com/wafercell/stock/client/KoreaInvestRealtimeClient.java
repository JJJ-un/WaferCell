package com.wafercell.stock.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wafercell.global.properties.KoreaInvestProperties;
import com.wafercell.stock.dto.StockUpdate;
import com.wafercell.stock.service.StockService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;
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
    private final StockService stockService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private final AtomicBoolean isConnecting = new AtomicBoolean(false);
    private final AtomicBoolean reconnectScheduled = new AtomicBoolean(false);
    
    private WebSocketSession session;

    // 순환 참조 방지를 위해 @Lazy 사용
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
                    // 연결 성공 후 StockService에 알려서 구독 시작
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

    /**
     * 특정 종목 구독 요청
     */
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

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        String payload = message.getPayload();
        
        try {
            if (payload.contains("PINGPONG")) {
                session.sendMessage(new TextMessage(payload));
                return;
            }

            if (!payload.startsWith("0|HDFSCNT0")) return;

            String[] pipeParts = payload.split("\\|");
            if (pipeParts.length < 4) return;

            String dataPart = pipeParts[3];
            String[] subParts = dataPart.split("\\^");

            if (subParts.length > 20) {
                String ticker = subParts[1];      // 종목코드 (SYMB)
                String timestamp = subParts[5];   // 현지시간 (XHMS)
                String highPrice = subParts[9];   // 고가 (HIGH)
                String lowPrice = subParts[10];   // 저가 (LOW)
                String price = subParts[11];      // 현재가 (LAST)
                String rate = subParts[14];       // 등락률 (RATE)
                String volume = subParts[20];     // 누적 거래량 (TVOL)
                
                log.info("⚡ [실시간] {}: {} ({}%) | 고가:{} | 저가:{} | 거래량:{}", 
                        ticker, price, rate, highPrice, lowPrice, volume);

                StockUpdate update = StockUpdate.builder()
                        .ticker(ticker)
                        .price(price)
                        .highPrice(highPrice)
                        .lowPrice(lowPrice)
                        .rate(rate)
                        .volume(volume) 
                        .timestamp(timestamp)
                        .build();

                stockService.updateStockCache(update);
                messagingTemplate.convertAndSend("/topic/stocks", update);
            }
        } catch (Exception e) {
            log.error("데이터 처리 오류: {}", e.getMessage());
        }
    }
}
