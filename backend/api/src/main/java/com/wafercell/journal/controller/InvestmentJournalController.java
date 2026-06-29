package com.wafercell.journal.controller;

import com.wafercell.journal.dto.JournalResponse;
import com.wafercell.journal.dto.JournalSaveRequest;
import com.wafercell.journal.service.InvestmentJournalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 투자 일지 API 엔드포인트를 노출하는 REST 컨트롤러
 */
@RestController
@RequestMapping("/api/journals")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 프론트엔드 연결을 위한 CORS 개방
public class InvestmentJournalController {

    private final InvestmentJournalService journalService;

    /**
     * 신규 투자 일지를 저장합니다.
     */
    @PostMapping
    public ResponseEntity<JournalResponse> saveJournal(@RequestBody JournalSaveRequest request) {
        JournalResponse saved = journalService.saveJournal(request);
        return ResponseEntity.ok(saved);
    }

    /**
     * 모든 종목의 투자 일지 목록을 조회합니다. (My Diary 대시보드용)
     */
    @GetMapping
    public ResponseEntity<List<JournalResponse>> getAllJournals() {
        List<JournalResponse> list = journalService.getAllJournals();
        return ResponseEntity.ok(list);
    }

    /**
     * 특정 종목의 투자 일지 목록을 조회합니다.
     */
    @GetMapping("/{ticker}")
    public ResponseEntity<List<JournalResponse>> getJournalsByTicker(@PathVariable String ticker) {
        List<JournalResponse> list = journalService.getJournalsByTicker(ticker);
        return ResponseEntity.ok(list);
    }

    /**
     * 특정 투자 일지를 삭제합니다.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJournal(@PathVariable Long id) {
        journalService.deleteJournal(id);
        return ResponseEntity.noContent().build();
    }
}
