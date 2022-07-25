package com.mighty.webreport.domain.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AviYieldReportResponse {

    private String operation;

    private String lotNumber;

    private String mainLot;
}
