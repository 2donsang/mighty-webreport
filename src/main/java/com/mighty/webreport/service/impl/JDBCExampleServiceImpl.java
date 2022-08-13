package com.mighty.webreport.service.impl;

import com.mighty.webreport.domain.dto.*;
import com.mighty.webreport.repository.jdbcrepository.JDBCExampleRepository;
import com.mighty.webreport.security.AccountContext;
import com.mighty.webreport.service.JDBCExampleService;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class JDBCExampleServiceImpl implements JDBCExampleService {

    private final JDBCExampleRepository jdbcExampleRepository;

    @Override
    @Transactional(readOnly = true)
    public void getLotStatus(HashMap<String, Object> hashMap, DLODateDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AccountContext accountContext = (AccountContext) authentication.getPrincipal();
        List<LotStatusResponse> lotStatus = new ArrayList<>();

            List<String> dateList = transStartDate(dto.getDates().getStartDate(), dto.getDates().getEndDate());
            String startDate = dateList.get(0);
            String endDate = dateList.get(1);
            lotStatus = jdbcExampleRepository.getLotStatus(accountContext.getPlant(), accountContext.getMember().getExpandFieldSix(),
                    dto.getLotNumbersString(),
                    dto.getOperationsString(),
                    dto.getDevicesString(),
                    startDate,
                    endDate,
                    accountContext.getMember().getExternalFlag());
        hashMap.put("lotStatus", lotStatus);
    }

    @Override
    @Transactional(readOnly = true)
    public void getDevices(HashMap<String, Object> hashMap, String plant, String customer, String externalFlag) {
        List<DeviceResponse> devices = jdbcExampleRepository.getDevices(plant, customer, externalFlag);
        hashMap.put("devices", devices);
    }

    @Override
    public void getLotNumbers(HashMap<String, Object> hashMap, String plant, String customer, String externalFlag) {
        List<LotNumberResponse> lotNumbers = jdbcExampleRepository.getLotNumbers(plant, customer, externalFlag);
        hashMap.put("lotNumbers", lotNumbers);
    }

    @Override
    @Transactional(readOnly = true)
    public void getAviYieldReport(HashMap<String, Object> hashMap, DLODateDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AccountContext accountContext = (AccountContext) authentication.getPrincipal();
        List<AviYieldReportResponse> aviYieldReport = new ArrayList<>();
        if (accountContext.getMember().getExpandFieldSix() != null) {

            List<String> dateList = transStartDate(dto.getDates().getStartDate(), dto.getDates().getEndDate());
            String startDate = dateList.get(0);
            String endDate = dateList.get(1);
            String customer = "'" +  accountContext.getMember().getExpandFieldSix()+"'" ;

            aviYieldReport = jdbcExampleRepository.getAviYieldReport(accountContext.getPlant(), customer, dto.getLotNumbersString(),
                    dto.getOperationsString(), dto.getDevicesString(), startDate, endDate,
                    "False", "", "False", "", "");
        }

        hashMap.put("aviYieldReport", aviYieldReport);
    }


    @Override
    public void getAviYieldReportNew(HashMap<String, Object> hashMap, DLODateDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AccountContext accountContext = (AccountContext) authentication.getPrincipal();
        List<AviYieldReportResponse> aviYieldReport = new ArrayList<>();

            List<String> dateList = transStartDate(dto.getDates().getStartDate(), dto.getDates().getEndDate());
            String startDate = dateList.get(0);
            String endDate = dateList.get(1);
            String customer = accountContext.getMember().getExpandFieldSix() ;

            aviYieldReport = jdbcExampleRepository.getAviYieldReportNew(accountContext.getPlant(), customer, dto.getLotNumbersString(),
                    dto.getOperationsString(), dto.getDevicesString(), startDate, endDate, accountContext.getMember().getExternalFlag());

        hashMap.put("aviYieldReport", aviYieldReport);
    }
    @Override
    public void getProbeYieldReport(HashMap<String, Object> hashMap, DLODateDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AccountContext accountContext = (AccountContext) authentication.getPrincipal();
        List<ProbeYieldReportResponse> probeYieldReport = new ArrayList<>();

            List<String> dateList = transStartDate(dto.getDates().getStartDate(), dto.getDates().getEndDate());
            String startDate = dateList.get(0);
            String endDate = dateList.get(1);
            String customer = accountContext.getMember().getExpandFieldSix();


            probeYieldReport = jdbcExampleRepository.getProbeYieldReport(accountContext.getPlant(), customer, dto.getLotNumbersString(),
                    dto.getOperationsString(), dto.getDevicesString(), startDate, endDate, accountContext.getMember().getExternalFlag());

        hashMap.put("probeYieldReport", probeYieldReport);
    }
    @Override
    public void getTotalYieldReportNew(HashMap<String, Object> hashMap, DLODateDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AccountContext accountContext = (AccountContext) authentication.getPrincipal();
        List<TotalYieldReportResponse> totalYieldReport = new ArrayList<>();

            List<String> dateList = transStartDate(dto.getDates().getStartDate(), dto.getDates().getEndDate());
            String startDate = dateList.get(0);
            String endDate = dateList.get(1);
            String customer = accountContext.getMember().getExpandFieldSix();

            totalYieldReport = jdbcExampleRepository.getTotalYieldReport(accountContext.getPlant(), customer, dto.getLotNumbersString(),
                    dto.getOperationsString(), dto.getDevicesString(), startDate, endDate, accountContext.getMember().getExternalFlag());

        hashMap.put("totalYieldReport", totalYieldReport);
    }

    @Override
    public void getDailyWipColumnName(HashMap<String, Object> hashMap, DLODateDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AccountContext accountContext = (AccountContext) authentication.getPrincipal();
        List<DailyWipColumnNameResponse> dailyWipColumnName = new ArrayList<>();
        List<String> dateList = transStartDate(dto.getDates().getStartDate(), dto.getDates().getEndDate());

        String selectedDate = dto.getDates().getStartDate();
        int year = Integer.parseInt(selectedDate.substring(0, 4));
        int month = Integer.parseInt(selectedDate.substring(4, 6));

        //월의 첫날 구하기
        String startDate = getMonthFirstDay(year, month);
        //월의 막날 구하기
        String endDate = getMonthLastDay(year, month);


        dailyWipColumnName = jdbcExampleRepository.getDailyWipColumnName(accountContext.getPlant(), "",
                dto.getLotNumbersString(),
                dto.getOperationsString(),
                dto.getDevicesString(), startDate, endDate);


        hashMap.put("dailyWipColumnName", dailyWipColumnName);
    }

    @SneakyThrows
    @Override
    public void getDailyWipTrend(HashMap<String, Object> hashMap, DLODateDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AccountContext accountContext = (AccountContext)authentication.getPrincipal();
        List<DailyWipTrendResponse> dailyWipTrend = new ArrayList<>();

        String selectedDate = dto.getDates().getStartDate();
        int year = Integer.parseInt(selectedDate.substring(0, 4));
        int month = Integer.parseInt(selectedDate.substring(4, 6));

        //월의 첫날 구하기
        String startDate = getMonthFirstDay(year, month);
        //today
        String endDate = dto.getDates().getEndDate().substring(0,8);

        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyyMMdd");
        Date date = simpleDateFormat.parse(endDate);
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.add(Calendar.DATE,1);
        String endDate2 = simpleDateFormat.format(calendar.getTime());
        System.out.println(endDate2);

        String customer =  "'"+accountContext.getMember().getExpandFieldSix()+"'";

        dailyWipTrend = jdbcExampleRepository.getDailyWipTrend(accountContext.getPlant(),customer,
                dto.getLotNumbersString(),
                dto.getOperationsString(),
                dto.getDevicesString(),
                startDate,
                endDate, endDate2,
                accountContext.getMember().getExternalFlag()
                );

        hashMap.put("dailyWipTrend", dailyWipTrend);
    }

    public List<String> transStartDate(String startDate, String endDate) {
        List<String> dateList = new ArrayList<>();
        String transStartDate = startDate.substring(0, 8) + "070000";
        String transEndDate = endDate.substring(0, 8) + "070000";
        dateList.add(transStartDate);
        dateList.add(transEndDate);

        return dateList;
    }

    public String getMonthFirstDay(int year, int month) {
        //월의 첫날 구하기
        Calendar calendar = Calendar.getInstance();
        calendar.set(year, month - 1, 1);
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd");
        String startDate = dateFormat.format(calendar.getTime());

        return startDate;
    }

    public String getMonthLastDay(int year, int month) {
        //월의 막날 구하기
        Calendar calendar = Calendar.getInstance();
        calendar.set(year, month - 1, 1);
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd");

        String monthStr = String.format("%02d", month);
        String endDate = Integer.toString(year) + monthStr + Integer.toString(calendar.getActualMaximum(calendar.DAY_OF_MONTH));
        return endDate;
    }
}
