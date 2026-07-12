package com.wafercell.journal.service;

import com.wafercell.journal.dto.JournalResponse;
import com.wafercell.journal.dto.JournalSaveRequest;
import com.wafercell.journal.entity.InvestmentJournal;
import com.wafercell.journal.repository.InvestmentJournalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 투자 일지 비즈니스 로직을 처리하는 서비스 클래스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InvestmentJournalService {

    private final InvestmentJournalRepository journalRepository;

    /**
     * 새로운 투자 일지를 작성 및 저장합니다.
     */
    @Transactional
    public JournalResponse saveJournal(JournalSaveRequest request) {
        log.info("💾 [InvestmentJournalService] 일지 저장 개시. ticker: {}, action: {}", request.getTicker(), request.getActionType());
        
        InvestmentJournal journal = InvestmentJournal.builder()
                .ticker(request.getTicker())
                .actionType(request.getActionType())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .feeling(request.getFeeling())
                .notes(request.getNotes())
                .journalDate(request.getJournalDate())
                .journalTime(request.getJournalTime())
                .build();

        InvestmentJournal saved = journalRepository.save(journal);
        return JournalResponse.from(saved);
    }

    /**
     * 특정 종목의 일지 목록을 조회합니다.
     */
    public List<JournalResponse> getJournalsByTicker(String ticker) {
        String cleanTicker = ticker.trim().toUpperCase();
        return journalRepository.findByTickerOrderByJournalDateDesc(cleanTicker).stream()
                .map(JournalResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 전체 종목의 일지 목록을 최신 날짜 역순으로 조회합니다.
     */
    public List<JournalResponse> getAllJournals() {
        return journalRepository.findAllByOrderByJournalDateDesc().stream()
                .map(JournalResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 전체 종목의 일지 목록을 페이징하여 최신 날짜 역순으로 조회합니다.
     */
    public List<JournalResponse> getAllJournalsPaged(org.springframework.data.domain.Pageable pageable) {
        return journalRepository.findAllByOrderByJournalDateDesc(pageable).getContent().stream()
                .map(JournalResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 특정 투자 일지를 삭제합니다.
     */
    @Transactional
    public void deleteJournal(Long id) {
        log.info("🗑️ [InvestmentJournalService] 일지 삭제 개시. id: {}", id);
        InvestmentJournal journal = journalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 투자 일지가 존재하지 않습니다. ID: " + id));
        journalRepository.delete(journal);
    }
}
