package com.wafercell.stock.seeder;

import com.wafercell.stock.entity.Stock;
import com.wafercell.stock.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@Order(1) // StockSeeder가 StockSupplyChainEventSeeder보다 먼저 실행되도록 순서를 지정합니다.
@RequiredArgsConstructor
public class StockSeeder implements CommandLineRunner {

    private final StockRepository stockRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (stockRepository.count() > 0) {
            log.info("🌱 데이터베이스에 이미 종목 데이터가 존재하므로 Stock 시딩을 건너뜁니다.");
            return;
        }

        log.info("🌱 데이터베이스 비어 있음 감지. 기본 반도체 기업 종목 데이터 적재를 시작합니다.");

        List<Stock> defaultStocks = List.of(
            Stock.builder().ticker("NVDA").name("엔비디아").exchange("NAS").sector("팹리스").build(),
            Stock.builder().ticker("AMD").name("AMD").exchange("NAS").sector("팹리스").build(),
            Stock.builder().ticker("AVGO").name("브로드컴").exchange("NAS").sector("팹리스").build(),
            Stock.builder().ticker("QCOM").name("퀄컴").exchange("NAS").sector("팹리스").build(),
            Stock.builder().ticker("ARM").name("ARM").exchange("NAS").sector("IP").build(),
            Stock.builder().ticker("TSM").name("TSMC").exchange("NYS").sector("파운드리").build(),
            Stock.builder().ticker("ASML").name("ASML").exchange("NAS").sector("소부장").build(),
            Stock.builder().ticker("AMAT").name("어플라이드 머티어리얼즈").exchange("NAS").sector("소부장").build(),
            Stock.builder().ticker("LRCX").name("램 리서치").exchange("NAS").sector("소부장").build(),
            Stock.builder().ticker("MU").name("마이크론").exchange("NAS").sector("메모리").build(),
            Stock.builder().ticker("INTC").name("인텔").exchange("NAS").sector("IDM").build()
        );

        stockRepository.saveAll(defaultStocks);
        log.info("🌱 기본 종목 데이터 {}건 적재 완료.", defaultStocks.size());
    }
}
