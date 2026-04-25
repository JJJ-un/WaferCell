package com.wafercell.stock.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class RealtimeServerConnectedEvent extends ApplicationEvent {
    public RealtimeServerConnectedEvent(Object source) {
        super(source);
    }
}
