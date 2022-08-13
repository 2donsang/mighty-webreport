package com.mighty.webreport.domain.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TotalYieldReportResponse {

    private String device;
    private String lotNumber;
    private String waferId;
    private String turn;
    private Integer totalProbe;
    private Integer passProbe;
    private Double yieldProbe;
    private String b2;
    private String b3;
    private String b4;
    private String b5;
    private String b6;
    private String b7;
    private String b8;
    private Integer totalAvi;
    private Integer passAvi;
    private Double yieldAvi;
    private String shipmentDate;

}
