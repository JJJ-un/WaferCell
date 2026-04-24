package com.wafercell.stock.service.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StockSyncScheduler {
    private final StockDataSyncService stockDataSyncService;
    @EventListener(ApplicationReadyEvent.class)
    public void onStart() {
        log.info("애플리케이션 시작: 초기 주식 데이터 동기화 진행");
        stockDataSyncService.refreshAllStockData();
    }
    @Scheduled(cron = "0 0 * * * *")
    public void hourlyRefresh() {
        log.info("정기 주식 데이터 최신화 스케줄러 실행");
        stockDataSyncService.refreshAllStockData();
    }
}
