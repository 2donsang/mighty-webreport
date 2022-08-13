package com.mighty.webreport.domain.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LotStatusResponse {

    private String device;
    private String lotNumber;
    private String operation;
    private String operationCount;
    private String routeCount;
    private String enterOperTime;
    private Integer qtyOne;
    private Integer qtyTwo;
    private String customer;
    private String processFlag;
    private String startDate;
    private String endDate;


    private String mainLot;
    private String qtyUnitOne;
    private String qtyUnitTwo;
    private Character inHold;
    private String holdNote;
    private Character inRework;
    private String deviceVer;
    private String deviceAttribute;
    private String shipAttribute;
    private String route;
    private String equipmentId;
}
