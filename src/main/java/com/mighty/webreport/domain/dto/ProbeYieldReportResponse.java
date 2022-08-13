package com.mighty.webreport.domain.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProbeYieldReportResponse {

    private String transTime;

    private String device;

    private String lotNumber;

    private String waferId;

    private String operation;

    private String turn;

    private Double yield;

    private Integer qtyTestDie;

    private Integer qtyGoodDie;

    private Integer qtyFailDie;

    private String testDate;
}
