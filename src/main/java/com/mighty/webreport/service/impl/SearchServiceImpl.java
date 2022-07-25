package com.mighty.webreport.service.impl;

import com.mighty.webreport.domain.dto.*;
import com.mighty.webreport.repository.jdbcrepository.LbrHistoryJDBCRepository;
import com.mighty.webreport.repository.querydsl.LotStatusRepositoryCustom;
import com.mighty.webreport.security.AccountContext;
import com.mighty.webreport.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final LotStatusRepositoryCustom lotStatusRepositoryCustom;

    private final LbrHistoryJDBCRepository lbrHistoryRepository;

    @Override
    @Transactional(readOnly = true)
    public void getLotStatus(HashMap<String,Object> hashMap , CDODto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AccountContext accountContext = (AccountContext) authentication.getPrincipal();

        List<String> customers = new ArrayList<>();
        List<String> operations = new ArrayList<>();
        List<String> devices = new ArrayList<>();

        for (IdTextDto idTextDto : dto.getCustomers()) {
            customers.add(idTextDto.getId());
        }

        for (IdTextDto idTextDto : dto.getOperations()) {
            operations.add(idTextDto.getId());
        }

        for (IdTextDto idTextDto : dto.getDevices()) {
            devices.add(idTextDto.getId());
        }

        List<LotStatusResponse> lotStatus = lotStatusRepositoryCustom.getLotStatus(
                accountContext.getPlant(),
                customers,
                operations,
                devices);

        hashMap.put("lotStatus",lotStatus);
    }

    @Override
    @Transactional(readOnly = true)
    public void getDefectStatus(HashMap<String, Object> hashMap, ODLDateDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AccountContext accountContext = (AccountContext) authentication.getPrincipal();

        List<DefectResponse> defectStatus = lbrHistoryRepository.getDefectStatus(
                accountContext.getPlant(),
                dto.getDates().getStartDate(),
                dto.getDates().getEndDate(),
                dto.getDevicesString(),
                dto.getOperationsString(),
                dto.getLotNumbersString()
        );

        hashMap.put("defectStatus",defectStatus);
    }

    @Override
    @Transactional(readOnly = true)
    public void getMovementStatus(HashMap<String, Object> hashMap, ODCDateDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AccountContext accountContext = (AccountContext) authentication.getPrincipal();
        String startDay = dto.getDates().getStartDate().substring(0,8);
        String endDay = dto.getDates().getEndDate().substring(0,8);


        List<MovementResponse> movementStatus = lbrHistoryRepository.getMovementStatus(
                accountContext.getPlant(),
                dto.getDates().getStartDate(),
                dto.getDates().getEndDate(),
                startDay,
                endDay,
                dto.getOperationsString(),
                dto.getDevicesString(),
                dto.getCustomersString(),
                accountContext.getId()
        );
        hashMap.put("movementStatus",movementStatus);
    }

}
