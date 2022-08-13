package com.mighty.webreport.service;

import com.mighty.webreport.domain.dto.DLODateDto;

import java.util.HashMap;

public interface JDBCExampleService {
    public void getLotStatus(HashMap<String,Object> hashMap, DLODateDto dto);

    public void getDevices(HashMap<String,Object> hashMap , String plant, String customer, String externalFlag);

    void getLotNumbers(HashMap<String, Object> hashMap, String plant, String customer, String externalFlag);

    void getAviYieldReport(HashMap<String, Object> hashMap, DLODateDto dto);

    void getDailyWipColumnName(HashMap<String, Object> hashMap, DLODateDto dto);

    void getDailyWipTrend(HashMap<String, Object> hashMap, DLODateDto dto);

    void getProbeYieldReport(HashMap<String, Object> hashMap, DLODateDto dto);

    void getAviYieldReportNew(HashMap<String, Object> hashMap, DLODateDto dto);

    void getTotalYieldReportNew(HashMap<String, Object> hashMap, DLODateDto dto);
}
