package com.wafercell.stock.service.application;

import com.wafercell.stock.dto.response.StockRealtimeResponse;
import com.wafercell.stock.event.StockUpdateEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * 주식 업데이트 이벤트를 구독하여 실시간 웹소켓 메시지를 전송합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StockUpdateHandler {

    private final StockService stockService;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleStockUpdate(StockUpdateEvent event) {
        if (event == null || event.getStockUpdate() == null) return;
        
        // 1. 서비스 계층을 통해 데이터 갱신 및 계산 수행
        StockRealtimeResponse response = stockService.updateStockCache(event.getStockUpdate());
        
        // 2. 계산 성공 시 웹소켓으로 전송
        if (response != null) {
            messagingTemplate.convertAndSend("/topic/stocks", response);
        }
    }
}
