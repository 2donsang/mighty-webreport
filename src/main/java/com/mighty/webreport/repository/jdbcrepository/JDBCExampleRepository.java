package com.mighty.webreport.repository.jdbcrepository;

import com.mighty.webreport.domain.dto.*;
import com.mighty.webreport.domain.entity.admin.Device;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.jdbc.JdbcTemplateAutoConfiguration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Repository;

import java.security.Security;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class JDBCExampleRepository {

    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;


    @Value("${spring.datasource.url}")
    private String url;

    public List<LotStatusResponse> getLotStatus(String plant, String customer, String lotNumbers, String operations, String devices, String startDate, String endDate) {
        StringBuilder sql  = new StringBuilder();

        sql.append("select   get_operation_desc(a.plant,a.operation) as operation,");
        sql.append("         a.lot_number,");
        sql.append("         a.main_lot,");
        sql.append("         decode(a.qty1_unit,'WFS',a.qty1,'PCS',0) as qty1,");
        sql.append("         a.qty1_unit,");
        sql.append("         nvl(decode(a.qty2_unit,'PCS',a.qty2),a.qty1) as qty2,");
        sql.append("         a.qty2_unit,");
        sql.append("         a.device as device,");
        sql.append("         get_customer_name_only(a.plant, a.customer) as customer,");
        sql.append("         in_hold,hold_note,");
        sql.append("         in_rework, ");
        sql.append("         case when process_flag = 'Q' then '대기' ");
        sql.append("              when process_flag = 'P' then '작업' ");
        sql.append("              when process_flag = 'S' then '완료대기' ");
        sql.append("         else '?'   ");
        sql.append("          end  as process_flag ,");
        sql.append("       (select attribute_value from asfc_attribute_status where plant = a.plant and lot_number = a.lot_number and attribute_index = 1) as device_ver,");
        sql.append("       (select attribute_value from asfc_attribute_status where plant = a.plant and lot_number = a.lot_number and attribute_index = 2) as device_attribute,");
        sql.append("       (select attribute_value from asfc_attribute_status where plant = a.plant and lot_number = a.lot_number and attribute_index = 3) as ship_attribute, ");
        sql.append("         route, ");
        sql.append("         a.enter_oper_time,");
        sql.append("         b.equipment_id ");
        sql.append(" from asfc_lot_status a,");
        sql.append("      asfc_eqplot_status b ");
        sql.append("where a.plant = :plant ");
        sql.append("  and a.plant = b.plant(+)");
        sql.append("  and a.lot_number = b.lot_number(+)");
        sql.append("  and status <> '99' ");

        if (!operations.isEmpty()){
            sql.append("  and ( a.operation IN ( " + operations + " ) ) ");
        }

        if (!devices.isEmpty()){
            sql.append("  and ( a.device IN ( " + devices + " ) ) ");
        }

        if (!lotNumbers.isEmpty()){
            sql.append("   and a.lot_number in ( " + lotNumbers + ") ");
        }

        if(customer != null){
            if(!customer.isEmpty()){
                sql.append(" and a.customer = :customer ");
            }
        }

        if(!startDate.isEmpty() && !endDate.isEmpty()){
            sql.append(" and a.trans_time between :startDate and :endDate ");
        }

        sql.append("order by LENGTH(a.OPERATION), 1,2,3,8,9");

        SqlParameterSource namedParameters = new MapSqlParameterSource()
                .addValue("plant",plant)
                .addValue("customer", customer)
                .addValue("startDate", startDate)
                .addValue("endDate",endDate);

        RowMapper<LotStatusResponse> lotStatusMapper = (rs, rowNum) -> {
          return LotStatusResponse.builder()
                  .operation(rs.getString("operation"))
                  .lotNumber(rs.getString("lot_number"))
                  .mainLot(rs.getString("main_lot"))
                  .qtyOne(rs.getInt("qty1"))
                  .qtyUnitOne(rs.getString("qty1_unit"))
                  .qtyTwo(rs.getInt("qty2"))
                  .qtyUnitTwo(rs.getString("qty2_unit"))
                  .device(rs.getString("device"))
                  .customer(rs.getString("customer"))
                  .inHold(rs.getString("in_hold").charAt(0))
                  .holdNote(rs.getString("hold_note"))
                  .inRework(rs.getString("in_rework").charAt(0))
                  .processFlag(rs.getString("process_flag"))
                  .deviceVer(rs.getString("device_ver"))
                  .deviceAttribute(rs.getString("device_attribute"))
                  .shipAttribute(rs.getString("ship_attribute"))
                  .route(rs.getString("route"))
                  .enterOperTime(rs.getString("enter_oper_time"))
                  .equipmentId(rs.getString("equipment_id"))
                  .build();
        };
        System.out.println(sql.toString());
        return namedParameterJdbcTemplate.query(sql.toString(),namedParameters,lotStatusMapper);
    }

    public List<DeviceResponse> getDevices(String plant, String customer) {

        StringBuilder sb = new StringBuilder();
        sb.append(" SELECT DISTINCT DEVICE, GET_DEVICE_DESC(PLANT, DEVICE) AS DEVICE_DESC  ");
        sb.append(" FROM ASFC_LOT_STATUS                                          ");
        sb.append(" WHERE PLANT = :PLANT                                          ");
        if(customer !=null){
            if(!customer.isEmpty()){
                sb.append(" AND CUSTOMER = :CUSTOMER                                      ");
            }
        }
        SqlParameterSource namedPrameters = new MapSqlParameterSource()
                .addValue("PLANT",plant)
                .addValue("CUSTOMER",customer);

        RowMapper<DeviceResponse> deviceResponseRowMapper = (rs, rowNum) -> {
            return DeviceResponse.builder()
                    .deviceId(rs.getString("DEVICE"))
                    .description(rs.getString("DEVICE_DESC"))
                    .build();
        };
        return namedParameterJdbcTemplate.query(sb.toString(),namedPrameters,deviceResponseRowMapper);
    }

    public List<LotNumberResponse> getLotNumbers(String plant, String customer) {
        StringBuilder sb = new StringBuilder();
        sb.append(" SELECT A.LOT_NUMBER, B.CUSTOMER                     ");
        sb.append(" FROM ASFC_LOT_STATUS  A                             ");
        sb.append(" INNER JOIN ADM_DEVICE_CUSTOMER B                    ");
        sb.append(" ON A.PLANT = B.PLANT AND A.CUSTOMER = B.CUSTOMER    ");
        sb.append(" AND A.DEVICE = B.DEVICE                             ");
        sb.append(" WHERE A.PLANT = :PLANT                              ");
        if(customer != null){
            if(!customer.isEmpty()){
                sb.append(" AND A.CUSTOMER = :CUSTOMER                          ");
            }
        }
        SqlParameterSource sqlParameterSource = new MapSqlParameterSource()
                .addValue("PLANT", plant)
                .addValue("CUSTOMER", customer);

        RowMapper<LotNumberResponse> lotNumberResponseRowMapper = new RowMapper<LotNumberResponse>() {
            @Override
            public LotNumberResponse mapRow(ResultSet rs, int rowNum) throws SQLException {
                return LotNumberResponse.builder()
                        .id(rs.getString("LOT_NUMBER"))
                        .text(rs.getString("CUSTOMER"))
                        .build();
            }
        };
            return  namedParameterJdbcTemplate.query(sb.toString(),sqlParameterSource,lotNumberResponseRowMapper);
    }

    public List<AviYieldReportResponse> getAviYieldReport(String plant, String expandFieldSix, String lotNumbersString, String operationsString, String devicesString, String startDate, String endDate) {
        StringBuilder sql  = new StringBuilder();

        SqlParameterSource sqlParameterSource = new MapSqlParameterSource();

        RowMapper<AviYieldReportResponse> aviYieldReportResponseRowMapper = (rs, rowNum) -> {
            return AviYieldReportResponse.builder().build();
        };

        return namedParameterJdbcTemplate.query(sql.toString(),sqlParameterSource,aviYieldReportResponseRowMapper);
    }

    public List<DailyWipColumnNameResponse> getDailyWipColumnName(String plant, String expandFieldSix, String lotNumbersString, String operationsString, String devicesString, String startDate, String endDate) {
        StringBuilder sql  = new StringBuilder();
        sql.append(" Select Natural_Date                                                             ");
//        sql.append(" ,Substr (Natural_Date, 5, 2) || '-' || Substr (Natural_Date, 7, 2) As Col_Name,  ");
//        sql.append(" B.Shift_1_Start as Shift_Start                                                  ");
        sql.append(" From Sys_Calendar A, Adm_Plant B                                                ");
        sql.append(" Where A.Plant = B.Plant                                                         ");
        sql.append(" And A.Plant = :plant                                                            ");
        sql.append(" And A.Natural_Date Between :startDate And :endDate                              ");
        sql.append(" Order By Day_Seq                                                                ");


        SqlParameterSource sqlParameterSource = new MapSqlParameterSource().addValue("plant",plant)
                .addValue("startDate",startDate)
                .addValue("endDate",endDate);

        RowMapper<DailyWipColumnNameResponse> dailyWipColumnNameResponseRowMapper = (rs, rowNum) -> {
            return DailyWipColumnNameResponse.builder()
                    .naturalDate(rs.getString("Natural_Date"))
//                    .colName(rs.getString("Col_Name"))
//                    .shiftStart(rs.getString("Shift_Start"))
                    .build();
        };

        return namedParameterJdbcTemplate.query(sql.toString(),sqlParameterSource,dailyWipColumnNameResponseRowMapper);
    }

    public List<DailyWipTrendResponse> getDailyWipTrend(String plant, String customer,
                                                        String lotNumber, String operation,
                                                        String device, String start_date, String end_date, String end_date2) {


        //String plant = viewcontainer.GetString("plant");
//        String operation = viewcontainer.GetString("operation");
//        String customer = viewcontainer.GetString("customer");
//        String subtrackid = viewcontainer.GetString("subtrackid");
//        String device_type = viewcontainer.GetString("device_type");
//        String device = viewcontainer.GetString("device");
//        String start_date = viewcontainer.GetString("start_date");
//        String end_date = viewcontainer.GetString("end_date");
//        String end_date2 = viewcontainer.GetString("end_date2");
//        //생산코드 추가 / 20160406 / 김영길
//        String create_code = viewcontainer.GetString("create_code");
//        create_code = create_code.Replace("&", "&&");

        //쿼리반복문에서 쓸 변수
        String sel_oper = "";
        String sel_day = "";
        String sel_natural = "";
        String shift_start = "";
        String shift_end = "";
        String last_day = "";
        Date date = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMdd");
        String to_day = formatter.format(date);

        StringBuilder sb = new StringBuilder();
        //설정한 공정들
        sb.append("SELECT OPERATION AS OPERATION 				");
        sb.append("  FROM ADM_OPERATION			        	    ");
        sb.append(" WHERE PLANT = :plant        				");
        sb.append("   ORDER BY OPERATION				        ");

        SqlParameterSource sqlParameterSource = new MapSqlParameterSource().addValue("plant",plant);
        List<Map<String, Object>> operationList = namedParameterJdbcTemplate.queryForList(sb.toString(),sqlParameterSource);


        //DataTable dtOperation = dbHelper.ExecuteQuery(sb.ToString());

        sb = new StringBuilder();
        sb.append("  Select Natural_Date,                                                            				");
        sb.append("         Substr (Natural_Date, 5, 2) || '-' || Substr (Natural_Date, 7, 2) As Col_Name, 			");
        sb.append("         B.Shift_1_Start as Shift_Start                                           				");
        sb.append("    From Sys_Calendar A, Adm_Plant B                                                             ");
        sb.append("   Where A.Plant = B.Plant    				                                                    ");
        sb.append("     And A.Plant = :plant                                                                        ");
        sb.append("     And A.Natural_Date Between '" + start_date + "' And '" + end_date + "'                     	");
        sb.append("Order By Day_Seq				                                                                    ");


        sqlParameterSource = new MapSqlParameterSource()
                .addValue("plant",plant)
                .addValue("start_date", start_date)
                .addValue("end_date", end_date);

        List<Map<String, Object>> dateList = namedParameterJdbcTemplate.queryForList(sb.toString(),sqlParameterSource);

//        DataTable dtDate = dbHelper.ExecuteQuery(sb.ToString());

//        shift_start = dtDate.Rows[0]["shift_start"].ToString();
//        shift_end = shift_start;
//        shift_end = shift_end.PadLeft(4, '0');
//        last_day = dtDate.Rows[dtDate.Rows.Count - 1]["Natural_Date"].ToString();

        shift_start =  dateList.get(0).get("shift_start").toString();
        shift_end = shift_start;
        int shiftEnd = Integer.parseInt(shift_end);
        shift_end = String.format("%04d", shiftEnd);
        last_day = dateList.get(dateList.size()-1).get("Natural_Date").toString();


        sb = new StringBuilder();
        //메인쿼리 생성
        sb.append("Select Operation, Operation_Desc                                                                                                 ");
//        for (int j = 0; j < dtDate.Rows.Count; j++)
        for (int j = 0; j < dateList.size(); j++)
        {
//            sel_day = dtDate.Rows[j]["Natural_Date"].ToString();
            sel_day = dateList.get(j).get("Natural_Date").toString();
            sb.append("      ,Sum(\"" + sel_day + "\") as \"" + sel_day + "\"                                                                       ");
        }
        sb.append("      From (");


        //for (int i = 0; i < dtOperation.Rows.Count; i++)
        for (int i = 0; i < operationList.size(); i++)
        {//공정별로 로우 뽑음.
            //sel_oper = dtOperation.Rows[i]["operation"].ToString();
            sel_oper = operationList.get(i).get("operation").toString();

            if (i != 0)
                sb.append("             Union All                                                                                                   ");

            sb.append("            Select '" + sel_oper + "' as Operation                                                                           ");
            sb.append("            ,Get_Operation_Desc(plant, '" + sel_oper + "') AS Operation_Desc                                                 ");

//            for (int j = 0; j < dtDate.Rows.Count; j++)
            for (int j = 0; j < dateList.size(); j++)
            {//날짜별로 칼럼 뽑음.
//                sel_natural = dtDate.Rows[j]["natural_date"].ToString();
                sel_natural = dateList.get(j).get("natural_date").toString();
                if (sel_natural != to_day)
                {
                    // 원본코드 MES에서도 주석처리 되어있었음.
                    ////sb.append(",Case When Point_Time = To_Char(To_Date('" + sel_natural + "', 'yyyymmdd') +1, 'YYYYMMDD') ||'" + shift_start + "'");
                    ////sb.append("Then case when QTY1_UNIT = 'PCS' then Sum(nvl(Qty1,0))                      ");
                    ////sb.append("else sum(QTY_UNIT_CONVERT(PLANT, lot_number, QTY1_UNIT, 'PCS', QTY1)) end   ");
                    ////sb.append("Else 0 End as \"" + sel_natural + "\"                                                     ");

                    sb.append("            ,Case When Point_Time = To_Char(To_Date('" + sel_natural + "') +1, 'YYYYMMDD') ||'" + shift_start + "'       ");
                    sb.append("                       Then Sum(nvl(Qty1,0)) Else 0 End as \"" + sel_natural + "\"                                                  ");
                }
                else
                {
                    sb.append("                       , 0 as \"" + sel_day + "\"                                                  ");
                }
            }


//            if(AppMessageBus.ConServer == AppConnectServerType.TestServer)
//                sb.append("             From RPTMIT_SAWNICS.RWR_POINT_WIP                                                                                   ");
//            else
//                sb.append("             From RPTMIT.RWR_POINT_WIP                                                                                   ");

            if(url.contains("61.98.142.166"))
                sb.append("             From RPTMIT_SAWNICS.RWR_POINT_WIP                                                                           ");
            else
                sb.append("             From RPTMIT.RWR_POINT_WIP                                                                                   ");

            sb.append("            Where Plant = '" + plant + "'                                                                                ");
            sb.append("              And Operation = '" + sel_oper + "'                                                                         ");
            sb.append("              And POINT_TIME Between '" + start_date + shift_start + "' And '" + end_date2 + shift_end + "'              ");
            sb.append("              And Qty1 > 0                                                                                               ");
            sb.append("              And SubStr(Point_Time,9,2) <12                                                                             ");
            if (!operation.isEmpty())
                sb.append("              And Operation in (" + operation + ")                                                                   ");
            if (!customer.isEmpty())
                sb.append("              And Customer in (" + customer + ")                                                                     ");
            if (!device.isEmpty())
                sb.append("              And Device in (" + device + ")                                                                         ");
            if(!lotNumber.isEmpty())
            {
                sb.append("              And lot_number  in ("+ lotNumber +")                                                                             ");
            }
//            if (!String.IsNullOrEmpty(device_type))
//                sb.append("              And DEVICE_MTYPE  in  (" + device_type + ")                              ");
//            if (!String.IsNullOrEmpty(subtrackid))
//            {
//                sb.append("             and case when operation in ('9800', '9900')                                                             ");
//                sb.append("                      then get_lot_subcontract(plant, lot_number)                                                    ");
//                sb.append("                      else nvl(subcontract, 'P') end                                                                 ");
//                sb.append("                   in (" + subtrackid + ")                                                                           ");
//            }

            //생산코드 추가 / 20160406 / 김영길 >> MES 원본소스에서도 주석처리 되어있었음.
            ////if (!String.IsNullOrEmpty(create_code))
            ////{
            ////    sb.append("             and create_code in (:createcode)                                                                       ");
            ////}

              //연구개발 OR 양산 분류 검색조건
//            if (!String.IsNullOrEmpty(create_code))
//            {
//                sb.append("             and create_code in (" + create_code + ")                                                                       ");
//            }

            sb.append("            Group by plant, operation,Point_Time, QTY1_UNIT                                                                          ");
            sb.append("             /*" + sel_oper + "*/                                                                                         ");
        }


        //당일 재공부분
        if (to_day.equals(last_day))
        {
            sb.append(" Union All /***** Today Start *****/  ");

            //for (int i = 0; i < dtOperation.Rows.Count; i++)
            for (int i = 0; i < operationList.size(); i++)
            {//공정별로 로우 뽑음.
                //sel_oper = dtOperation.Rows[i]["operation"].ToString();
                sel_oper = operationList.get(i).get("operation").toString();

                if (i != 0)
                    sb.append("             Union All                                                                                                   ");

                sb.append("            Select '" + sel_oper + "' as Operation                                                                           ");
                sb.append("            ,Get_Operation_Desc(plant, '" + sel_oper + "') AS Operation_Desc                                                 ");

//                for (int j = 0; j < dtDate.Rows.Count; j++)
                for (int j = 0; j < dateList.size(); j++)
                {//날짜별로 칼럼 뽑음.
//                    sel_natural = dtDate.Rows[j]["natural_date"].ToString();
                    sel_natural = dateList.get(j).get("natural_date").toString();
                    if (!sel_natural.equals(to_day))
                    {
                        sb.append("                       , 0 as \"" + sel_natural + "\"                                                  ");

                    }
                    else
                    {
                        sb.append("            ,Sum(nvl(Qty1,0))  as \"" + sel_natural + "\"                                                  ");
                    }
                }

                //sb.append("             From rptmit.RWR_WIP_STATUS                                                                                  ");
                sb.append("             From ASFC_LOT_STATUS                                                                                  ");
                sb.append("            Where Plant = '" + plant + "'                                                                                ");
                sb.append("              And Operation = '" + sel_oper + "'                                                                         ");
                //sb.append("              And Trans_time Between '" + last_day + shift_start + "' And '" + end_date2 + shift_end + "'                ");
                sb.append("              And Qty1 > 0                                                                                               ");
                sb.append("              And IN_ACTIVE ='Y'                                                                                               ");
                sb.append("              And STATUS <> '99'                                                                                               ");

                if (!operation.isEmpty())
                    sb.append("              And Operation in (" + operation + ")                                                                   ");
                if (!customer.isEmpty())
                    sb.append("              And Customer in (" + customer + ")                                                                     ");
                if (!device.isEmpty())
                    sb.append("              And Device in (" + device + ")                                                                         ");
                if(!lotNumber.isEmpty())
                    sb.append("              And lot_number in ("+lotNumber+")                                                                               ");
//                if (!String.IsNullOrEmpty(device_type))
//                    sb.append("              And GET_INDEX_DEVICE_TYPE(plant, device, 'BIZ') in  (" + device_type + ")                              ");
//                if (!String.IsNullOrEmpty(subtrackid))
//                {
//                    sb.append("             and case when operation in ('9800', 'LT9900')                                                             ");
//                    sb.append("                      then get_lot_subcontract(plant, lot_number)                                                    ");
//                    sb.append("                      else nvl(subcontract, 'P') end                                                                 ");
//                    sb.append("                   in (" + subtrackid + ")                                                                           ");
//                }

                //생산코드 추가 / 20160406 / 김영길   > MES 원본 소스코드에서도 주석처리되어있었음.
                ////if (!String.IsNullOrEmpty(create_code))
                ////{
                ////    sb.append("             and create_code in (:createcode)                                                                       ");
                ////}

//                if (!String.IsNullOrEmpty(create_code))
//                {
//                    sb.append("             and create_code in (" + create_code + ")                                                                       ");
//                }

                sb.append("            Group by plant, operation,QTY1_UNIT                                                                           ");
                sb.append("             /*" + sel_oper + "*/   ");
                sb.append("             /***** Today End *****/   ");
            }
        }//당일 조회 끝

        sb.append(" )                                       ");
        sb.append(" Group by Operation, Operation_Desc      ");
        sb.append(" Order by Operation                      ");


        //생산코드 추가 / 20160406 / 김영길 >> MES 원본소스코드에서도 주석처리 되어있었음.
        //if (!String.IsNullOrEmpty(create_code))
        //{
        //    dbHelper.AddParameter("createcode", create_code);
        //}


//        DataTable dataTable = dbHelper.ExecuteQuery(sb.ToString());

//        viewcontainer.GridDataTable = dataTable;
//        // ViewContrainer
//        this.SetGridUI(viewcontainer, dtDate);
//        return viewcontainer.DataSet;

        int count = Integer.parseInt(last_day.substring(6));

        RowMapper<DailyWipTrendResponse> dailyWipColumnNameResponseRowMapper = (rs, rowNum) -> {
            ResultSetMetaData meta = rs.getMetaData();
            int colCount = meta.getColumnCount();
            return DailyWipTrendResponse.builder()
                    .operation(rs.getString(1))
                    .operationDesc(rs.getString(2))
                    .day1(colCount >=3 ? rs.getString(3) : null)
                    .day2(colCount >=4 ? rs.getString(4) : null)
                    .day3(colCount >=5 ? rs.getString(5) : null)
                    .day4(colCount >=6 ? rs.getString(6) : null)
                    .day5(colCount >=7 ? rs.getString(7) : null)
                    .day6(colCount >=8 ? rs.getString(8) : null)
                    .day7(colCount >=9 ? rs.getString(9) : null)
                    .day8(colCount >=10 ? rs.getString(10) : null)
                    .day9(colCount >=11 ? rs.getString(11) : null)
                    .day10(colCount >=12 ? rs.getString(12) : null)
                    .day11(colCount >=13 ? rs.getString(13) : null)
                    .day12(colCount >=14 ? rs.getString(14) : null)
                    .day13(colCount >=15 ? rs.getString(15) : null)
                    .day14(colCount >=16 ? rs.getString(16) : null)
                    .day15(colCount >=17 ? rs.getString(17) : null)
                    .day16(colCount >=18 ? rs.getString(18) : null)
                    .day17(colCount >=19 ? rs.getString(19) : null)
                    .day18(colCount >=20 ? rs.getString(20) : null)
                    .day19(colCount >=21 ? rs.getString(21) : null)
                    .day20(colCount >=22 ? rs.getString(22) : null)
                    .day21(colCount >=23 ? rs.getString(23) : null)
                    .day22(colCount >=24 ? rs.getString(24) : null)
                    .day23(colCount >=25 ? rs.getString(25) : null)
                    .day24(colCount >=26 ? rs.getString(26) : null)
                    .day25(colCount >=27 ? rs.getString(27) : null)
                    .day26(colCount >=28 ? rs.getString(28) : null)
                    .day27(colCount >=29 ? rs.getString(29) : null)
                    .day28(colCount >=30 ? rs.getString(30) : null)
                    .day29(colCount >=31 ? rs.getString(31) : null)
                    .day30(colCount >=32 ? rs.getString(32) : null)
                    .day31(colCount >=33 ? rs.getString(33) : null)
                    .build();
        };

        return namedParameterJdbcTemplate.query(sb.toString(),sqlParameterSource,dailyWipColumnNameResponseRowMapper);
    }
}
