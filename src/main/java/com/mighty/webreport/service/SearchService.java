package com.mighty.webreport.service;

import com.mighty.webreport.domain.dto.CDODto;
import com.mighty.webreport.domain.dto.ODCDateDto;
import com.mighty.webreport.domain.dto.ODLDateDto;

import java.util.HashMap;

public interface SearchService {

    public void getLotStatus(HashMap<String,Object> hashMap , CDODto dto);

    public void getDefectStatus(HashMap<String,Object> hashMap , ODLDateDto dto);

    public void getMovementStatus(HashMap<String, Object> hashMap, ODCDateDto dto);
}
