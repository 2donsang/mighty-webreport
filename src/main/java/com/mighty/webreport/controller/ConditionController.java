package com.mighty.webreport.controller;

import com.mighty.webreport.security.AccountContext;
import com.mighty.webreport.service.ConditionService;
import com.mighty.webreport.service.JDBCExampleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/condition")
public class ConditionController {

    private final ConditionService conditionService;

    private final JDBCExampleService  jdbcExampleService;

    @GetMapping("/customerAndOperationAndDevice")
    public ResponseEntity<?> getCustomerAndOperationAndDevice(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AccountContext accountContext = (AccountContext) authentication.getPrincipal();
        HashMap<String, Object> hashMap = new HashMap<>();
        conditionService.getCustomers(hashMap,accountContext.getPlant());
        conditionService.getOperations(hashMap,accountContext.getPlant());
        conditionService.getDevicesWithCustomers(hashMap, accountContext.getPlant());
        return ResponseEntity.ok(hashMap);
    }

    @GetMapping("/operationAndDeviceAndLotNumber")
    public ResponseEntity<?> getOperationAndDeviceAndLotNumber(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AccountContext accountContext = (AccountContext) authentication.getPrincipal();
        HashMap<String, Object> hashMap = new HashMap<>();
        conditionService.getOperations(hashMap,accountContext.getPlant());
        conditionService.getDevices(hashMap, accountContext.getPlant());
        conditionService.getLotNumbers(hashMap, accountContext.getPlant());
        return ResponseEntity.ok(hashMap);
    }

    @GetMapping("/deviceAndLotNumberAndOperation")
    public ResponseEntity<?> getDeviceAndLotNumberAndOperation(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AccountContext accountContext = (AccountContext) authentication.getPrincipal();
        HashMap<String, Object> hashMap = new HashMap<>();
        //conditionService.getDevices(hashMap, accountContext.getPlant());
        jdbcExampleService.getDevices(hashMap, accountContext.getPlant(), accountContext.getMember().getExpandFieldSix());
        //conditionService.getLotNumbers(hashMap, accountContext.getPlant());
        jdbcExampleService.getLotNumbers(hashMap, accountContext.getPlant(), accountContext.getMember().getExpandFieldSix());
        conditionService.getOperations(hashMap, accountContext.getPlant());

        return ResponseEntity.ok(hashMap);
    }

}
