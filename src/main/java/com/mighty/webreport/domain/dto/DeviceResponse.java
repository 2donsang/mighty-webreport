package com.mighty.webreport.domain.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceResponse {

    private String deviceId;

    private String description;

    private String customer;

}
