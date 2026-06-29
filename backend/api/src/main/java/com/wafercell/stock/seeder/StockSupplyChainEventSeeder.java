package com.wafercell.stock.seeder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wafercell.stock.entity.StockSupplyChain;
import com.wafercell.stock.entity.StockSupplyChainEvent;
import com.wafercell.stock.repository.StockSupplyChainEventRepository;
import com.wafercell.stock.repository.StockSupplyChainRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.List;

@Slf4j
@Component
@Order(2) // StockSeeder가 실행되어 stocks 테이블이 구축된 뒤 실행되도록 보장합니다.
@RequiredArgsConstructor
public class StockSupplyChainEventSeeder implements CommandLineRunner {

    private final StockSupplyChainRepository supplyChainRepository;
    private final StockSupplyChainEventRepository eventRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (supplyChainRepository.count() > 0 || eventRepository.count() > 0) {
            log.info("🌱 데이터베이스에 이미 밸류체인 관계사 및 일정 데이터가 존재하므로 시딩을 건너뜁니다.");
            return;
        }

        log.info("🌱 서버 부팅 완료 감지. 외부 JSON 파일을 읽어 밸류체인 관계 및 예정 일정 적재를 시작합니다.");

        try {
            ClassPathResource resource = new ClassPathResource("value-chain-seeds.json");
            try (InputStream inputStream = resource.getInputStream()) {
                SeedData seedData = objectMapper.readValue(inputStream, SeedData.class);

                if (seedData.getChains() != null && !seedData.getChains().isEmpty()) {
                    supplyChainRepository.saveAll(seedData.getChains());
                    log.info("🌱 밸류체인 관계사 데이터 {}건 적재 완료.", seedData.getChains().size());
                }

                if (seedData.getEvents() != null && !seedData.getEvents().isEmpty()) {
                    eventRepository.saveAll(seedData.getEvents());
                    log.info("🌱 다가올 예정 일정 데이터 {}건 적재 완료.", seedData.getEvents().size());
                }
            }
        } catch (Exception e) {
            log.error("💥 value-chain-seeds.json 파일로부터 데이터를 읽고 적재하는 중 치명적 에러 발생: {}", e.getMessage(), e);
        }
    }

    @Data
    private static class SeedData {
        private List<StockSupplyChain> chains;
        private List<StockSupplyChainEvent> events;
    }
}
