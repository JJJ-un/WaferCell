package com.wafercell.ai.controller;

import com.wafercell.ai.dto.AiTextResponse;
import com.wafercell.ai.dto.KeywordRequest;
import com.wafercell.ai.service.StockAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 프론트엔드 로컬 서버와의 연동을 위한 CORS 예외 개방
public class AiController {

    private final StockAiService stockAiService;

    @PostMapping("/stock/{ticker}/keyword")
    public ResponseEntity<AiTextResponse> getAnalysisByKeyword(
            @PathVariable String ticker,
            @RequestBody KeywordRequest request) {
        
        AiTextResponse response = stockAiService.getCustomAnalysis(ticker, request.getKeyword());
        return ResponseEntity.ok(response);
    }
}