package com.wafercell.news.service;

import com.wafercell.global.dto.KoreaInvestRawResponse;
import com.wafercell.news.client.KoreaInvestNewsClient;
import com.wafercell.news.dto.NewsDto;
import com.wafercell.news.dto.NewsRaw;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsService {

    private final KoreaInvestNewsClient newsClient;

    public List<NewsDto> getLatestNews(String lastSrno) {
        try {
            KoreaInvestRawResponse<List<NewsRaw>> response = newsClient.getOverseasBreakingNews(lastSrno);
            List<NewsRaw> output = response.getOutput();

            if (output == null) return new ArrayList<>();

            return output.stream().map(item -> {
                List<String> tickers = extractTickers(item);

                return NewsDto.builder()
                        .id(item.getId())
                        .newsOferEntpCode(item.getNewsOferEntpCode())
                        .date(item.getDate())
                        .time(item.getTime())
                        .title(item.getTitle())
                        .source(item.getSource())
                        .tickers(tickers)
                        .build();
            }).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("뉴스 조회 실패: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    private List<String> extractTickers(NewsRaw item) {
        List<String> tickers = new ArrayList<>();
        addIfValid(tickers, item.getIscd1());
        addIfValid(tickers, item.getIscd2());
        addIfValid(tickers, item.getIscd3());
        addIfValid(tickers, item.getIscd4());
        addIfValid(tickers, item.getIscd5());
        addIfValid(tickers, item.getIscd6());
        addIfValid(tickers, item.getIscd7());
        addIfValid(tickers, item.getIscd8());
        addIfValid(tickers, item.getIscd9());
        addIfValid(tickers, item.getIscd10());
        return tickers;
    }

    private void addIfValid(List<String> list, String value) {
        Optional.ofNullable(value)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .ifPresent(list::add);
    }
}
