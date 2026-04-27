package com.wafercell.stock.service.application;

import com.wafercell.stock.event.StockUpdateEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StockUpdateHandler {

    private final StockService stockService;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleStockUpdate(StockUpdateEvent event) {
        stockService.updateStockCache(event.getStockUpdate());
        messagingTemplate.convertAndSend("/topic/stocks", event.getStockUpdate());
    }
}
