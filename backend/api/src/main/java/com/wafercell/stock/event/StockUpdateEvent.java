package com.wafercell.stock.event;

import com.wafercell.stock.dto.response.StockUpdate;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * 실시간 주가 업데이트 정보를 시스템 내부로 전파하기 위한 이벤트
 */
@Getter
public class StockUpdateEvent extends ApplicationEvent {
    private final StockUpdate stockUpdate;

    public StockUpdateEvent(Object source, StockUpdate stockUpdate) {
        super(source);
        this.stockUpdate = stockUpdate;
    }
}
