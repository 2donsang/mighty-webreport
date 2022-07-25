package com.mighty.webreport.domain.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovementResponse {
    private String operation;
    private String operationStep;
    private String deviceDesc;
    private String customerDesc;
    private String boh;
    private String eoh;
    private String procIn;
    private String procOut;
    private String loss;
    private String bonus;
    private String cv;
    private String yield;
    private String sumTat;
}
