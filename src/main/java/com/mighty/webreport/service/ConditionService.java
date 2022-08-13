package com.mighty.webreport.service;

import java.util.HashMap;

public interface ConditionService {
    public void getCustomers( HashMap<String,Object> hashMap , String plant);
    public void getOperations( HashMap<String,Object> hashMap , String plant);

    public void getDevices( HashMap<String,Object> hashMap , String plant);

    public void getDevicesWithCustomers( HashMap<String,Object> hashMap , String plant);

    public void getOperationsNew(HashMap<String,Object> hashMap, String plant);

    public void getLotNumbers( HashMap<String,Object> hashMap, String plant);

    public void getAVIOperations(HashMap<String,Object> hashMap, String plant);

    void getProbeOperations(HashMap<String, Object> hashMap, String plant);
}
