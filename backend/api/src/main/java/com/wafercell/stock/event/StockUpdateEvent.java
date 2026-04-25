package com.wafercell.stock.event;

import com.wafercell.stock.dto.StockUpdate;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class StockUpdateEvent extends ApplicationEvent {
    private final StockUpdate stockUpdate;

    public StockUpdateEvent(Object source, StockUpdate stockUpdate) {
        super(source);
        this.stockUpdate = stockUpdate;
    }
}
