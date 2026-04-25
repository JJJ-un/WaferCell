package com.wafercell.stock.service.application;

import com.wafercell.stock.client.KoreaInvestRealtimeClient;
import com.wafercell.stock.entity.Stock;
import com.wafercell.stock.repository.StockRepository;
import com.wafercell.stock.event.RealtimeServerConnectedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 어떤 종목을 실시간으로 구독할지 관리하는 매니저
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StockSubscriptionManager {

    private final StockRepository stockRepository;
    private final KoreaInvestRealtimeClient realtimeClient;

    @EventListener
    public void onRealtimeServerConnected(RealtimeServerConnectedEvent event) {
        log.info("실시간 서버 연결 이벤트 수신 - 전 종목 구독 시작");
        subscribeAllStocks();
    }

    public void subscribeAllStocks() {
        subscribeAllStocks(stockRepository.findAll());
    }

    public void subscribeAllStocks(List<Stock> stocks) {
        stocks.forEach(stock -> 
            realtimeClient.subscribe(stock.getExchange(), stock.getTicker()));
    }
}
