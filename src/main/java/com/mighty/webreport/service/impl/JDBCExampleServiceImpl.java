package com.mighty.webreport.service.impl;

import com.mighty.webreport.domain.dto.*;
import com.mighty.webreport.repository.jdbcrepository.JDBCExampleRepository;
import com.mighty.webreport.security.AccountContext;
import com.mighty.webreport.service.JDBCExampleService;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.apache.catalina.core.ApplicationContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContextAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Security;
import java.sql.Array;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
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
        if (accountContext.getMember().getExpandFieldSix() != null) {

            List<String> dateList = transStartDate(dto.getDates().getStartDate(), dto.getDates().getEndDate());
            String startDate = dateList.get(0);
            String endDate = dateList.get(1);
            lotStatus = jdbcExampleRepository.getLotStatus(accountContext.getPlant(), accountContext.getMember().getExpandFieldSix(),
                    dto.getLotNumbersString(),
                    dto.getOperationsString(),
                    dto.getDevicesString(),
                    startDate,
                    endDate);
        }
        hashMap.put("lotStatus", lotStatus);
    }

    @Override
    @Transactional(readOnly = true)
    public void getDevices(HashMap<String, Object> hashMap, String plant, String customer) {
        List<DeviceResponse> devices = jdbcExampleRepository.getDevices(plant, customer);
        hashMap.put("devices", devices);
    }

    @Override
    public void getLotNumbers(HashMap<String, Object> hashMap, String plant, String customer) {
        List<LotNumberResponse> lotNumbers = jdbcExampleRepository.getLotNumbers(plant, customer);
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
            aviYieldReport = jdbcExampleRepository.getAviYieldReport(accountContext.getPlant(), accountContext.getMember().getExpandFieldSix(),
                    dto.getLotNumbersString(),
                    dto.getOperationsString(),
                    dto.getDevicesString(),
                    startDate,
                    endDate);
        }

        hashMap.put("aviYieldReport", aviYieldReport);
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
        if (accountContext.getMember().getExpandFieldSix() != null) {

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

//        String customer =  "'" + accountContext.getMember().getExpandFieldSix() + "'";
          String customer = "";
        dailyWipTrend = jdbcExampleRepository.getDailyWipTrend(accountContext.getPlant(),customer,
                dto.getLotNumbersString(),
                dto.getOperationsString(),
                dto.getDevicesString(),
                startDate,
                endDate, endDate2);
        }

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
