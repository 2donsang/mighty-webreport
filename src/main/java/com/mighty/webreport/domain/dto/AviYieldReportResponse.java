package com.mighty.webreport.domain.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AviYieldReportResponse {

    private String failCodeList;

    private String transTime;

    private String device;

    private String lotNumber;

    private String mainLot;

    private String waferId;

    private String operation;

    private String slotId;

    private String turn;

    private Double passRate;

    private Integer qtyGoodDie;

    private Integer qtyTestDie;

    private Integer qtyFailDie;


}
