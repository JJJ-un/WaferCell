package com.wafercell.journal.service;

import com.wafercell.journal.dto.JournalResponse;
import com.wafercell.journal.dto.JournalSaveRequest;
import com.wafercell.journal.entity.InvestmentJournal;
import com.wafercell.journal.repository.InvestmentJournalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * InvestmentJournalService 비즈니스 로직에 대한 단위 테스트 클래스
 */
@ExtendWith(MockitoExtension.class)
class InvestmentJournalServiceTest {

    @Mock
    private InvestmentJournalRepository journalRepository;

    @InjectMocks
    private InvestmentJournalService journalService;

    private InvestmentJournal journal;
    private JournalSaveRequest request;

    @BeforeEach
    void setUp() {
        journal = InvestmentJournal.builder()
                .ticker("NVDA")
                .actionType("BUY")
                .price(125.0)
                .quantity(10.0)
                .feeling("GREEDY")
                .notes("추격 매수 진행")
                .journalDate(LocalDate.of(2026, 6, 28))
                .journalTime("15:30")
                .build();

        request = new JournalSaveRequest();
        request.setTicker("NVDA");
        request.setActionType("BUY");
        request.setPrice(125.0);
        request.setQuantity(10.0);
        request.setFeeling("GREEDY");
        request.setNotes("추격 매수 진행");
        request.setJournalDate(LocalDate.of(2026, 6, 28));
        request.setJournalTime("15:30");
    }

    @Test
    @DisplayName("투자 일지 저장 성공 테스트")
    void saveJournalTest() {
        // given
        given(journalRepository.save(any(InvestmentJournal.class))).willReturn(journal);

        // when
        JournalResponse response = journalService.saveJournal(request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getTicker()).isEqualTo("NVDA");
        assertThat(response.getActionType()).isEqualTo("BUY");
        assertThat(response.getPrice()).isEqualTo(125.0);
        assertThat(response.getQuantity()).isEqualTo(10.0);
        assertThat(response.getFeeling()).isEqualTo("GREEDY");
        verify(journalRepository, times(1)).save(any(InvestmentJournal.class));
    }

    @Test
    @DisplayName("특정 종목의 투자 일지 조회 테스트")
    void getJournalsByTickerTest() {
        // given
        given(journalRepository.findByTickerOrderByJournalDateDesc("NVDA")).willReturn(List.of(journal));

        // when
        List<JournalResponse> response = journalService.getJournalsByTicker("NVDA");

        // then
        assertThat(response).isNotEmpty();
        assertThat(response.get(0).getTicker()).isEqualTo("NVDA");
        verify(journalRepository, times(1)).findByTickerOrderByJournalDateDesc("NVDA");
    }

    @Test
    @DisplayName("전체 투자 일지 조회 테스트")
    void getAllJournalsTest() {
        // given
        given(journalRepository.findAllByOrderByJournalDateDesc()).willReturn(List.of(journal));

        // when
        List<JournalResponse> response = journalService.getAllJournals();

        // then
        assertThat(response).isNotEmpty();
        verify(journalRepository, times(1)).findAllByOrderByJournalDateDesc();
    }

    @Test
    @DisplayName("투자 일지 삭제 성공 테스트")
    void deleteJournalTest() {
        // given
        given(journalRepository.findById(1L)).willReturn(Optional.of(journal));

        // when
        journalService.deleteJournal(1L);

        // then
        verify(journalRepository, times(1)).delete(journal);
    }
}
