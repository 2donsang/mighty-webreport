package com.mighty.webreport.controller;

import com.mighty.webreport.domain.dto.CDODto;
import com.mighty.webreport.domain.dto.DLODateDto;
import com.mighty.webreport.domain.dto.ODCDateDto;
import com.mighty.webreport.domain.dto.ODLDateDto;
import com.mighty.webreport.security.AccountContext;
import com.mighty.webreport.service.SearchService;
import com.mighty.webreport.service.impl.JDBCExampleServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    private final JDBCExampleServiceImpl jdbcExample;

    @PostMapping("/lot-status")
    public ResponseEntity<?> getLotStatus(@RequestBody CDODto dto ){
        HashMap<String,Object> hashMap = new HashMap<>();
        searchService.getLotStatus(hashMap,dto);
        return ResponseEntity.ok(hashMap);
    }

    @PostMapping("/defect-status")
    public ResponseEntity<?> getDefectStatus(@RequestBody ODLDateDto dto ){
        HashMap<String,Object> hashMap = new HashMap<>();
        searchService.getDefectStatus(hashMap,dto);
        return ResponseEntity.ok(hashMap);
    }

    @PostMapping("/movement-status")
    public ResponseEntity<?>getMovementStatus(@RequestBody ODCDateDto dto){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AccountContext accountContext = (AccountContext) authentication.getPrincipal();
        System.out.print("==============="+accountContext.getUsername());
        HashMap<String,Object> hashMap = new HashMap<>();
        searchService.getMovementStatus(hashMap, dto);

        return ResponseEntity.ok(hashMap);
    }
    @PostMapping("/lot-status-two")
    public ResponseEntity<?>geLotStatus(@RequestBody DLODateDto dto){
        HashMap<String,Object> hashMap  = new HashMap<>();
        jdbcExample.getLotStatus(hashMap,dto);
        return ResponseEntity.ok(hashMap);
    }

    @PostMapping("/avi-yield-report")
    public ResponseEntity<?>getAviYieldReport(@RequestBody DLODateDto dto){
        HashMap<String,Object> hashMap = new HashMap<>();
        jdbcExample.getAviYieldReport(hashMap,dto);
        return ResponseEntity.ok(hashMap);
    }
    @PostMapping("/daily-wip-columnName")
    public ResponseEntity<?>getDailyWipColumnName(@RequestBody DLODateDto dto){
        HashMap<String,Object> hashMap = new HashMap<>();
        jdbcExample.getDailyWipColumnName(hashMap,dto);
        return ResponseEntity.ok(hashMap);
    }

    @PostMapping("/daily-wip-trend")
    public ResponseEntity<?>getDailyWiptrend(@RequestBody DLODateDto dto){
        HashMap<String,Object> hashMap = new HashMap<>();
        jdbcExample.getDailyWipTrend(hashMap,dto);
        return ResponseEntity.ok(hashMap);
    }

}
