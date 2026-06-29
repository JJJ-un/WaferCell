package com.wafercell.stock.service.application;

import com.wafercell.stock.dto.response.StreamResponseDto;
import com.wafercell.stock.entity.StockSupplyChainEvent;
import com.wafercell.stock.repository.StockSupplyChainEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Service
@RequiredArgsConstructor
public class ValueChainStreamService {

    private final StockSupplyChainEventRepository eventRepository;
    
    // 티커별로 연결된 사용자 브라우저의 실시간 통로(SseEmitter) 리스트를 동시성 안전하게 보관합니다.
    private final Map<String, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    /**
     * 특정 종목의 실시간 알림 통로(SseEmitter)를 개설하고, 연결 성공 즉시 예정 일정을 조회하여 보냅니다.
     */
    public SseEmitter createStream(String ticker) {
        String upperTicker = ticker.trim().toUpperCase();
        // 타임아웃은 30분(1800000ms)으로 넉넉하게 설정합니다.
        SseEmitter emitter = new SseEmitter(1800000L);

        emitters.computeIfAbsent(upperTicker, k -> new CopyOnWriteArrayList<>()).add(emitter);
        log.info("🔌 [{}] 종목 실시간 SSE 연결 개설 완료. 현재 연결 수: {}", upperTicker, emitters.get(upperTicker).size());

        // 연결 해제, 타임아웃, 에러 발생 시 메모리 보관함에서 삭제 처리합니다.
        emitter.onCompletion(() -> removeEmitter(upperTicker, emitter));
        emitter.onTimeout(() -> removeEmitter(upperTicker, emitter));
        emitter.onError((ex) -> removeEmitter(upperTicker, emitter));

        // 연결 즉시 데이터베이스(MySQL)에 등록된 사전 예정 일정 목록을 전송(Push)합니다.
        sendInitialCalendarEvents(upperTicker, emitter);

        return emitter;
    }

    /**
     * 현재 화면에서 밸류체인 탭을 활성화하여 실시간 관찰 중인 종목 리스트를 반환합니다.
     */
    public Set<String> getActiveTickers() {
        Set<String> activeTickers = new HashSet<>();
        emitters.forEach((ticker, list) -> {
            if (!list.isEmpty()) {
                activeTickers.add(ticker);
            }
        });
        return activeTickers;
    }

    /**
     * 특정 종목에 속한 모든 관찰 브라우저로 분석 데이터를 실시간 푸시합니다.
     */
    public void pushEvent(String ticker, String eventType, Object data) {
        String upperTicker = ticker.trim().toUpperCase();
        List<SseEmitter> emitterList = emitters.get(upperTicker);
        if (emitterList == null || emitterList.isEmpty()) {
            return;
        }

        log.info("📤 [{}] 종목 실시간 알림 전송 개시. (수신 브라우저 수: {})", upperTicker, emitterList.size());
        List<SseEmitter> deadEmitters = new ArrayList<>();

        for (SseEmitter emitter : emitterList) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventType)
                        .data(data));
            } catch (IOException | IllegalStateException e) {
                deadEmitters.add(emitter); // 에러가 난 끊긴 통로는 삭제 대상 등록
            }
        }

        if (!deadEmitters.isEmpty()) {
            emitterList.removeAll(deadEmitters);
            log.info("🧹 끊어진 SSE 연결 {}개 정리 완료.", deadEmitters.size());
        }
    }

    private void sendInitialCalendarEvents(String ticker, SseEmitter emitter) {
        try {
            // 첫 연결 유지를 위해 더미 연결 수립 이벤트 발송
            emitter.send(SseEmitter.event().name("connect").data("Connected successfully."));

            List<StockSupplyChainEvent> events = eventRepository.findByBaseTickerOrderByEventDateAsc(ticker);
            int calendarCount = 0;
            int impactCount = 0;

            for (StockSupplyChainEvent event : events) {
                String type = event.getEventType();
                
                if ("REALTIME_IMPACT".equals(type)) {
                    // 실시간 분석 카드는 기 저장된 || 구분자를 분리하여 리스트로 복원합니다.
                    List<String> briefingList = Collections.emptyList();
                    if (event.getEstimatedImpact() != null && !event.getEstimatedImpact().isEmpty()) {
                        briefingList = Arrays.asList(event.getEstimatedImpact().split("\\|\\|"));
                    }

                    StreamResponseDto dto = StreamResponseDto.builder()
                            .type("REALTIME_IMPACT")
                            .title(event.getEventName())
                            .date(event.getEventDate())
                            .score(event.getScore())
                            .briefing(briefingList)
                            .build();

                    emitter.send(SseEmitter.event()
                            .name("realtime-impact")
                            .data(dto));
                    impactCount++;
                } else {
                    // 일반 CALENDAR 일정 처리
                    StreamResponseDto dto = StreamResponseDto.builder()
                            .type("CALENDAR")
                            .title(event.getEventName())
                            .date(event.getEventDate())
                            .score(null)
                            .briefing(List.of(event.getEstimatedImpact() != null ? event.getEstimatedImpact() : ""))
                            .build();

                    emitter.send(SseEmitter.event()
                            .name("calendar-event")
                            .data(dto));
                    calendarCount++;
                }
            }
            log.info("📅 [{}] 종목 초기 데이터 발송 완료. (예정 일정: {}건, AI 분석 카드: {}건)", ticker, calendarCount, impactCount);
        } catch (IOException e) {
            log.error("💥 [{}] 종목 초기 데이터 전송 실패", ticker, e);
        }
    }

    private void removeEmitter(String ticker, SseEmitter emitter) {
        List<SseEmitter> list = emitters.get(ticker);
        if (list != null) {
            list.remove(emitter);
            log.info("🔌 [{}] 종목 SSE 연결 해제. 남은 연결 수: {}", ticker, list.size());
            if (list.isEmpty()) {
                emitters.remove(ticker);
            }
        }
    }
}
