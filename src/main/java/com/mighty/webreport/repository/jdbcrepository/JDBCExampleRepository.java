package com.mighty.webreport.repository.jdbcrepository;

import com.mighty.webreport.domain.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;

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

    public List<LotStatusResponse> getLotStatus(String plant, String customer, String lotNumbers, String operations, String devices, String startDate, String endDate, String externalFlag) {
        StringBuilder sql  = new StringBuilder();

//        sql.append("select   get_operation_desc(a.plant,a.operation) as operation,");
//        sql.append("         a.lot_number,");
//        sql.append("         a.main_lot,");
//        sql.append("         decode(a.qty1_unit,'WFS',a.qty1,'PCS',0) as qty1,");
//        sql.append("         a.qty1_unit,");
//        sql.append("         nvl(decode(a.qty2_unit,'PCS',a.qty2),a.qty1) as qty2,");
//        sql.append("         a.qty2_unit,");
//        sql.append("         get_device_desc(a.plant,a.device) as device,");
//        sql.append("         get_customer_name_only(a.plant, a.customer) as customer,");
//        sql.append("         in_hold,hold_note,");
//        sql.append("         in_rework, ");
//        sql.append("         case when process_flag = 'Q' then '대기' ");
//        sql.append("              when process_flag = 'P' then '작업' ");
//        sql.append("              when process_flag = 'S' then '완료대기' ");
//        sql.append("         else '?'   ");
//        sql.append("          end  as process_flag ,");
//        sql.append("       (select attribute_value from asfc_attribute_status where plant = a.plant and lot_number = a.lot_number and attribute_index = 1) as device_ver,");
//        sql.append("       (select attribute_value from asfc_attribute_status where plant = a.plant and lot_number = a.lot_number and attribute_index = 2) as device_attribute,");
//        sql.append("       (select attribute_value from asfc_attribute_status where plant = a.plant and lot_number = a.lot_number and attribute_index = 3) as ship_attribute, ");
//        sql.append("         route, ");
//        sql.append("         to_char(to_date(a.enter_oper_time, 'YYYYMMDDHH24MISS'),'yyyy-mm-dd') enter_oper_time,");
//        sql.append("         b.equipment_id ");
//        sql.append(" from asfc_lot_status a,");
//        sql.append("      asfc_eqplot_status b ");
//        sql.append("where a.plant = :plant ");
//        sql.append("  and a.plant = b.plant(+)");
//        sql.append("  and a.lot_number = b.lot_number(+)");
//        sql.append("  and status <> '99' ");

        sql.append("   SELECT GET_DEVICE_DESC (A.PLANT, A.DEVICE)                                               ");
        sql.append("              AS DEVICE,                                                                    ");
        sql.append("          A.LOT_NUMBER,                                                                     ");
        sql.append("          GET_OPERATION_DESC (A.PLANT, A.OPERATION)                                         ");
        sql.append("              AS OPERATION,                                                                 ");
        sql.append("          (SELECT OPER_SEQ                                                                  ");
        sql.append("             FROM ADM_ROUTE_OPERATION                                                       ");
        sql.append("            WHERE ROUTE = A.ROUTE AND OPERATION = A.OPERATION)                              ");
        sql.append("              AS OPERATION_COUNT,                                                           ");
        sql.append("          (SELECT COUNT (ROUTE)                                                             ");
        sql.append("             FROM ADM_ROUTE_OPERATION                                                       ");
        sql.append("            WHERE ROUTE = A.ROUTE)                                                          ");
        sql.append("              AS ROUTE_COUNT,                                                               ");
        sql.append("          TO_CHAR (TO_DATE (A.ENTER_OPER_TIME, 'YYYYMMDDHH24MISS'),                         ");
        sql.append("                   'yyyy-mm-dd')                                                            ");
        sql.append("              AS ENTER_OPER_TIME,                                                           ");
        sql.append("          DECODE (A.QTY1_UNIT,  'WFS', A.QTY1,  'PCS', 0)                                   ");
        sql.append("              AS QTY1,                                                                      ");
        sql.append("          NVL (DECODE (A.QTY2_UNIT, 'PCS', A.QTY2), A.QTY1)                                 ");
        sql.append("              AS QTY2,                                                                      ");
        sql.append("          GET_CUSTOMER_NAME_ONLY (A.PLANT, A.CUSTOMER)                                      ");
        sql.append("              AS CUSTOMER,                                                                  ");
        sql.append("          CASE                                                                              ");
        sql.append("              WHEN PROCESS_FLAG = 'Q' THEN '대기'                                             ");
        sql.append("              WHEN PROCESS_FLAG = 'P' THEN '작업'                                             ");
        sql.append("              WHEN PROCESS_FLAG = 'S' THEN '완료대기'                                           ");
        sql.append("              ELSE '?'                                                                      ");
        sql.append("          END                                                                               ");
        sql.append("              AS PROCESS_FLAG,                                                              ");
        sql.append("          TO_CHAR (TO_DATE (B.FORECAST_SDATE, 'YYYYMMDDHH24MISS'), 'yyyy-mm-dd')            ");
        sql.append("              AS FORECAST_SDATE,                                                            ");
        sql.append("          TO_CHAR (TO_DATE (B.FORECAST_EDATE, 'YYYYMMDDHH24MISS'), 'yyyy-mm-dd')            ");
        sql.append("              AS FORECAST_EDATE                                                             ");
        sql.append("     FROM ASFC_LOT_STATUS A, ASFC_PROD_PLAN_DATA B                                          ");
        sql.append("    WHERE     A.PLANT = :plant                                                              ");
        sql.append("          AND A.PLANT = B.PLANT                                                             ");
        sql.append("          AND A.LOT_NUMBER = B.PROD_ORDER_NO                                                ");
        sql.append("          AND B.STATUS = 'S'                                                                ");
        sql.append("          AND A.STATUS <> '99'                                                              ");
        sql.append("          AND A.TRANS_TIME BETWEEN :startDate AND :endDate                                  ");

        if (!operations.isEmpty()){
            sql.append("  and ( a.operation IN ( " + operations + " ) ) ");
        }

        if (!devices.isEmpty()){
            sql.append("  and ( a.device IN ( " + devices + " ) ) ");
        }

        if (!lotNumbers.isEmpty()){
            sql.append("   and a.lot_number in ( " + lotNumbers + ") ");
        }

        if (externalFlag.equals("Y")) {
            if (customer != null && !customer.isEmpty()){
                    sql.append(" and a.customer = :customer                          ");
            }else{
                sql.append(" and a.customer = '' ");
            }
        }

        if(!startDate.isEmpty() && !endDate.isEmpty()){
            sql.append(" and a.trans_time between :startDate and :endDate ");
        }

        sql.append(" ORDER BY A.DEVICE DESC, A.LOT_NUMBER                                                       ");

        SqlParameterSource namedParameters = new MapSqlParameterSource()
                .addValue("plant",plant)
                .addValue("customer", customer)
                .addValue("startDate", startDate)
                .addValue("endDate",endDate);

        RowMapper<LotStatusResponse> lotStatusMapper = (rs, rowNum) -> {
          return LotStatusResponse.builder()
                  .device(rs.getString("device"))
                  .lotNumber(rs.getString("lot_number"))
                  .operation(rs.getString("operation"))
                  .operationCount(rs.getString("operation_count"))
                  .routeCount(rs.getString("route_count"))
                  .enterOperTime(rs.getString("enter_oper_time"))
                  .qtyOne(rs.getInt("qty1"))
                  .qtyTwo(rs.getInt("qty2"))
                  .customer(rs.getString("customer"))
                  .processFlag(rs.getString("process_flag"))
                  .startDate(rs.getString("forecast_sdate"))
                  .endDate(rs.getString("forecast_edate"))
                  .build();
        };
        System.out.println(sql.toString());
        return namedParameterJdbcTemplate.query(sql.toString(),namedParameters,lotStatusMapper);
    }

    public List<DeviceResponse> getDevices(String plant, String customer, String externalFlag) {

        StringBuilder sb = new StringBuilder();
        sb.append(" SELECT DISTINCT DEVICE, GET_DEVICE_DESC_ONLY(PLANT, DEVICE) AS DEVICE_DESC  ");
        sb.append(" FROM ASFC_LOT_STATUS                                          ");
        sb.append(" WHERE PLANT = :PLANT                                          ");
        if (externalFlag.equals("Y")) {
            if (customer != null && !customer.isEmpty()) {
                    sb.append(" AND CUSTOMER = :CUSTOMER                          ");
            }else{
                sb.append(" AND CUSTOMER = '' ");
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

    public List<LotNumberResponse> getLotNumbers(String plant, String customer, String externalFlag) {
        StringBuilder sb = new StringBuilder();
        sb.append(" SELECT LOT_NUMBER, CUSTOMER ");
        sb.append("   FROM ASFC_LOT_STATUS      ");
        sb.append("  WHERE PLANT = :PLANT       ");
        if (externalFlag.equals("Y")) {
            if (customer != null && !customer.isEmpty()){
                    sb.append(" AND CUSTOMER = :CUSTOMER                          ");
            }else{
                sb.append(" AND CUSTOMER = '' ");
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

    public List<AviYieldReportResponse> getAviYieldReport(String plant, String customer, String lotNumber,
                                                          String operation, String device, String startDate, String endDate,
                                                          String mapp, String main_lot, String apply_turn, String turn, String ratio) {

        String customermulti = customer;


//        // 조회 조건에 대한 Parameter를 지정
//        String plant = viewcontainer.GetString("plant");
//        String startDate = viewcontainer.GetString("startDate");
//        String endDate = viewcontainer.GetString("endDate");
//        String lotNumber = viewcontainer.GetString("lotnumber");
//        String device = viewcontainer.GetString("device");
//        //String opertype = viewcontainer.GetString("opertype");
//        String operation = viewcontainer.GetString("operation");
//        String turn = viewcontainer.GetStriang("turn");
//        String apply_turn = viewcontainer.GetString("apply_turn");
//        String ratio = viewcontainer.GetString("ratio");
//        String main_lot = viewcontainer.GetString("main_lot");
//        String customer = viewcontainer.GetString("customer");
//        String customermulti=viewcontainer.GetString("customermulti");
//        String mapp = viewcontainer.GetString("mapp");
//
//        DataSet dataSet = GetLossCode(plant, device, operation, lotNumber, customer);
//
//        DataTable codeDataTable = dataSet.Tables["code"];
//        dt1 = codeDataTable;
//        //상단 Loss Code 리스트 뿌리기 시작
//        String fail_list = "";
        String fail_code = "";
//        description = String.Empty;
//        String length = "                                 ";
//        if (codeDataTable.Rows.Count > 0)
//        {
//            code_count = codeDataTable.Rows.Count;
//
//            for (int i = 0; i < codeDataTable.Rows.Count; i++)
//            {
//                fail_list += "'" + codeDataTable.Rows[i]["fail_code"].ToString() + "',";
//
//
//                description += codeDataTable.Rows[i]["description"].ToString().Trim() + length.SubString(0, 33 - (codeDataTable.Rows[i]["description"].ToString().Length > 33 ? 33 : codeDataTable.Rows[i]["description"].ToString().Length));
//
//
//                if (i == 3 || i == 7 || i == 11 || i == 15 || i == 19)
//                {
//                    description += "\n";
//                }
//
//
//1
//            }
//
//            fail_code = fail_list.SubString(0, fail_list.Length - 1);
//        }
//        ////////////////////////끝//////////////////

        //쿼리 생성
        StringBuilder sb = new StringBuilder();

        sb.append("select '' as fail_code_list ,  ");
        sb.append("      to_char(to_date(wf.trans_time,'yyyymmddhh24miss'),'yyyy-mm-dd') TRANS_TIME,                                     ");
        sb.append("       wf.device,                                                                                                      ");
        sb.append("       wf.lot_number,                                                                                                  ");
        sb.append("       wf.main_lot,                                                                                                    ");
        sb.append("       wf.wafer_id,                                                                                                    ");
        sb.append("       to_char(wf.turn) as turn,                                                                                       ");
        sb.append("       to_char(wf.slot_id, '09') slot_id,                                                                              ");
        if (mapp == "False")
        {
            sb.append("        to_char( round( ((wf.qty_testdie-decode(fm.fail_count,null,0,fm.fail_count))/wf.qty_testdie) * 100, 2) )  passrate,                                         ");
        }
        else
            sb.append("        to_char( round( (wf.qty_gooddie/wf.qty_testdie) * 100, 2) )  passrate,                                         ");
        sb.append("       wf.qty_testdie,                                                                                                 ");

        if (mapp == "False")
        {
            sb.append("    (wf.qty_testdie-decode(fm.fail_count,null,0,fm.fail_count)) qty_gooddie,");
            sb.append("    decode(fm.fail_count,null,0,fm.fail_count) qty_faildie");
        }
        else
        {
            sb.append("       wf.qty_gooddie,                                                                                                 ");
            sb.append("       wf.qty_faildie                                                                                                 ");
        }

        sb.append("       ,fc.*                                                                                                            ");
        sb.append("  from (select  a.trans_time,                                                                                             ");
        sb.append("               a.device,                                                                                                 ");
        sb.append("               a.lot_number,                                                                                             ");
        sb.append("               a.main_lot,                                                                                               ");
        sb.append("               wafer_id,                                                                                               ");
        sb.append("               a.slot_id,                                                                                                ");
        sb.append("               a.turn,                                                                                                   ");
        sb.append("               round( (qty_gooddie/qty_testdie) * 100, 2) passrate,                                                    ");
        sb.append("               qty_gooddie,                                                                                            ");
        sb.append("               qty_testdie,                                                                                            ");
        sb.append("               qty_faildie                                                                                             ");
        sb.append("          from tdms_vi_wafer a                                                                                        ");
        sb.append("         where a.plant = :plant                                                                                 ");
        sb.append("           and a.trans_time >= :startDate                                                                              ");
        sb.append("           and a.trans_time <= :endDate                                                                                ");

        if (lotNumber != "")
        {
            sb.append("           and wafer_id in (select nonlot_number from asfc_nonlot_status where plant = :plant ");
            sb.append("                                                  and parent_lot in ("+lotNumber+") ) ");
        }
        if (main_lot != "")
        {
            sb.append("           and a.main_lot =  '" + main_lot + "' ");
        }

        if (device != "")
        {
            sb.append("           and a.device IN (" + device + ")                                                                           ");
        }
        if (operation != "")
        {
            sb.append("           and a.operation = " + operation + "                                                                          ");
        }
        if (apply_turn == "True")
        {
            sb.append("           and a.apply  = 'Y'                                                                                  ");
        }
        else
        {
            if (turn != "")
                sb.append("           and a.turn = " + turn + "                                                                                 ");
        }
        sb.append("           )wf,                                                                                     ");
        sb.append("       (select *                                                                                                       ");
        sb.append("          from (select a.wafer_id,                                                                                     ");
        sb.append("                       decode(c.to_item_1,null,a.fail_code,c.to_item_1) fail_code   ,a.turn                                                                                  ");
        sb.append("                  from tdms_vi_fail_list  a,                                                                           ");
        sb.append("                       tdms_vi_wafer b,                                                                               ");
        sb.append("                       bin_code_mapp c                                                                              ");
        sb.append("                 where a.plant = :plant                                                                               ");
        sb.append("                   and a.plant = b.plant                                                                         ");
        sb.append("                   and b.trans_time >= :startDate                                                                      ");
        sb.append("                   and b.trans_time <= :endDate                                                                        ");
        //            sb.append("                   and a.lot_number  = b.lot_number                                                                    ");
        sb.append("                   and a.wafer_id = b.wafer_id                                                            ");

        sb.append("     and a.plant = c.plant(+)             ");
        sb.append("     and a.fail_code = c.from_item(+)     ");
        sb.append("     and c.object(+) = 'AVI_BINCODE'      ");


        if (customer == "MAGNACHIP" || customer == "SILWORKS")
        {
            sb.append(" and c.customer(+)= '" + customer + "'");
        }
        else
        {
            sb.append(" and c.customer(+)= 'DEFAULT'");
        }

        if (lotNumber != "")
        {
            sb.append("           and b.wafer_id in (select nonlot_number from asfc_nonlot_status where plant = :plant ");
            sb.append("                                                  and parent_lot in ("+lotNumber+") ) ");
        }
        if (device != "")
        {
            sb.append("           and b.device IN (" + device + ")                                                                                 ");
        }
        if (operation != "")
        {
            sb.append("           and b.operation = " + operation + "                                                                           ");
        }

        if (apply_turn == "True")
        {
            sb.append("           and apply  = 'Y'                                                                                  ");
        }
        else
        {
            if (turn != "")
                sb.append("           and turn = " + turn + "                                                                                 ");
        }

        sb.append("                   and a.turn = b.turn                                                                            ");
        sb.append("               )                                                                                                       ");
        sb.append("               pivot                                                                                                   ");
        sb.append("               (                                                                                                       ");
        sb.append("                   count(fail_code)                                                                                    ");
        sb.append("                     for fail_code IN (" + fail_code + ") ");
        sb.append("               )                                                                                                       ");
        sb.append("          ) fc  ,(select b.customer,nonlot_number,device from asfc_nonlot_status b where b.plant = :plant");
        if (lotNumber != "")
            sb.append("                and b.parent_lot in ("+lotNumber+") ");
        sb.append("                  )a");
        if (mapp == "False")
        {
            sb.append("        , ( select a.wafer_id,                                                                                     ");
            sb.append("                       count(fail_code) fail_count ,a.turn                                                                                  ");
            sb.append("                  from tdms_vi_fail_list  a,                                                                           ");
            sb.append("                       tdms_vi_wafer b,                                                                               ");
            sb.append("                       bin_code_mapp c                                                                              ");
            sb.append("                 where a.plant = :plant                                                                               ");
            sb.append("                   and a.plant = b.plant                                                                         ");
            sb.append("                   and b.trans_time >= :startDate                                                                      ");
            sb.append("                   and b.trans_time <= :endDate                                                                        ");
            //            sb.append("                   and a.lot_number  = b.lot_number                                                                    ");
            sb.append("                   and a.wafer_id = b.wafer_id                                                            ");

            sb.append("     and a.plant = c.plant(+)             ");
            sb.append("     and a.fail_code = c.from_item(+)     ");
            sb.append("     and c.object(+) = 'AVI_BINCODE'      ");


            if (customer == "MAGNACHIP" || customer == "SILWORKS")
            {
                sb.append(" and c.customer(+)= '" + customer + "'");
            }
            else
            {
                sb.append(" and c.customer(+)= 'DEFAULT'");
            }

            if (lotNumber != "")
            {
                sb.append("           and b.wafer_id in (select nonlot_number from asfc_nonlot_status where plant = :plant ");
                sb.append("                                                  and parent_lot in ("+lotNumber+") ) ");
            }
            if (device != "")
            {
                sb.append("           and b.device IN (" + device + ")                                                                                 ");
            }
            if (operation != "")
            {
                sb.append("           and b.operation = " + operation + "                                                                           ");
            }

            if (apply_turn == "True")
            {
                sb.append("           and apply  = 'Y'                                                                                  ");
            }
            else
            {
                if (turn != "")
                    sb.append("           and turn = " + turn + "                                                                                 ");
            }

            //15.01.13 불량코드 ' ' 미집계 수정 - 최고봉
            sb.append("        and a.fail_code <> ' '   ");

            sb.append("                   and a.turn = b.turn   group by a.wafer_id,a.turn  )fm                                                                       ");
        }


        sb.append("  where wf.wafer_id = fc.wafer_id(+)                                                                                   ");
        sb.append("    and wf.turn = fc.turn(+)       ");
        sb.append("    and wf.wafer_id = a.nonlot_number (+)");
        //sb.append("    and wf.lot_number= a.lot_number");
        //sb.append("    and (a.plant=:plant or a.from_plant=:plant)");
        if (mapp == "False")
        {
            sb.append("    and wf.wafer_id = fm.wafer_id(+)                                                                                   ");
            sb.append("    and wf.turn = fm.turn(+)       ");
        }

        if (customermulti != "")
        {
            sb.append(" and a.customer in(" + customermulti + ")");
        }
        if (device != "")
        {
            sb.append("           and a.device IN (" + device + ")                                                                           ");
        }
            /*
            if(lotNumber!="")
            {
                sb.append("   and a.lot_number=:lotNumber");
            }*/
        sb.append(" order by  to_char(to_date(wf.trans_time,'yyyymmddhh24miss'),'yyyy-mm-dd') , wf.device, wf.lot_number, wf.wafer_id , slot_id ,wf.turn  ");

        String query = sb.toString();
//
//        // 쿼리에 Parameter에 대한 조회 설정
//        DbHelper dbHelper = new DbHelper();
//        dbHelper.AddParameter("plant", plant);
//        dbHelper.AddParameter("startDate", startDate);
//        dbHelper.AddParameter("endDate", endDate);
//        if (lotNumber != "")
//            dbHelper.AddParameter("lotNumber", lotNumber);

//        // ViewContrainer에 쿼리의 생성 정보
//        DataTable dataTable = dbHelper.ExecuteQuery(query);
//        viewcontainer.GridDataTable = dataTable;
//        dt = dataTable;
//        // ViewContrainer
//        this.SetGridUI(viewcontainer);
//
//        return viewcontainer.DataSet;

        SqlParameterSource sqlParameterSource = new MapSqlParameterSource()
                .addValue("plant", plant)
                .addValue("startDate",startDate)
                .addValue("endDate", endDate)
                .addValue("lotNumber",lotNumber)
                .addValue("customer",customer);

        RowMapper<AviYieldReportResponse> aviYieldReportResponseRowMapper = (rs, rowNum) -> {
                return AviYieldReportResponse.builder()
                        .failCodeList(rs.getString("FAIL_CODE_LIST"))
                    .transTime(rs.getString("TRANS_TIME"))
                    .device(rs.getString("DEVICE"))
                    .lotNumber(rs.getString("LOT_NUMBER"))
                    .mainLot(rs.getString("MAIN_LOT"))
                    .waferId(rs.getString("WAFER_ID"))
                    .turn(rs.getString("TURN"))
                    .slotId(rs.getString("SLOT_ID"))
                    .passRate(rs.getDouble("PASSRATE"))
                    .qtyGoodDie(rs.getInt("QTY_GOODDIE"))
                    .qtyTestDie(rs.getInt("QTY_TESTDIE"))
                    .qtyFailDie(rs.getInt("QTY_FAILDIE"))
                    .build();
        };

        return namedParameterJdbcTemplate.query(query,sqlParameterSource,aviYieldReportResponseRowMapper);
    }

    public List<AviYieldReportResponse> getAviYieldReportNew(String plant, String customer, String lotNumbers,
                                                             String operations, String devices, String startDate,
                                                             String endDate, String externalFlag) {
        StringBuilder sb = new StringBuilder();

        sb.append("   SELECT                                                       ");
//        sb.append("          TRANSTIME,                                            ");
        sb.append(" TO_CHAR(TO_DATE(A.TRANSTIME,'YYYYMMDDHH24MISS'), 'YYYY-MM-DD') TRANSTIME, ");
        sb.append("          GET_DEVICE_DESC(A.PLANT, A.DEVICE) DEVICE,            ");
        sb.append("          A.LOT_NUMBER,                                         ");
        sb.append("          A.HEADER_5      AS WAFER_ID,                          ");
        sb.append("          GET_OPERATION_DESC(A.PLANT, A.OPERATION) OPERATION,   ");
        sb.append("          A.TURN,                                               ");
        sb.append("          A.HEADER_9      AS YIELD,                             ");
        sb.append("          A.HEADER_7      AS TESTCOUNT,                         ");
        sb.append("          A.HEADER_8      AS PASSCOUNT,                         ");
        sb.append("          A.HEADER_10     AS FAILCOUNT                          ");
        sb.append("     FROM TDMS_AVI_INFO A, ASFC_LOT_STATUS B          ");
        sb.append("    WHERE A.PLANT = :plant                                      ");
        sb.append("      AND CNT > 0                                               ");
        sb.append("      AND  A.PLANT = B.PLANT                                      ");
        sb.append("      AND A.LOT_NUMBER = B.LOT_NUMBER                            ");
        sb.append("     AND A.OPERATION IN                                         ");
        sb.append("     (SELECT GROUP_OBJECT                                     ");
        sb.append("           FROM ADM_GROUP_CATEGORY_DATA                       ");
        sb.append("          WHERE PLANT           = :plant                      ");
        sb.append("            AND GROUP_TARGET = 'OPERATION'                    ");
        sb.append("            AND GROUP_INDEX  = 3                              ");
        sb.append("            AND GROUP_VALUE = 'AVI')                        ");
        if(externalFlag.equals("Y")){
            if(customer !=null && !customer.isEmpty()){
                    sb.append("      AND B.CUSTOMER = :customer                                ");
            }else{
                sb.append("      AND B.CUSTOMER = ''                                ");
            }
        }

        if(!devices.isEmpty()){
            sb.append(" AND A.DEVICE IN ("+devices+")                              ");
        }
        if(!operations.isEmpty()){
            sb.append(" AND A.OPERATION IN ("+operations+")                        ");
        }
        if(!lotNumbers.isEmpty()){
            sb.append(" AND A.LOT_NUMBER IN ( "+lotNumbers+")                    ");
        }
        if(!startDate.isEmpty()){
            sb.append(" AND A.TRANSTIME BETWEEN :startDate AND :endDate           ");
        }

        sb.append(" ORDER BY TRANSTIME, TO_NUMBER (CNT)                                       ");



        String query = sb.toString();
        SqlParameterSource sqlParameterSource = new MapSqlParameterSource()
                .addValue("plant", plant)
                .addValue("startDate",startDate)
                .addValue("endDate", endDate)
                .addValue("customer",customer);

        RowMapper<AviYieldReportResponse> aviYieldReportResponseRowMapper = (rs, rowNum) -> {
            return AviYieldReportResponse.builder()
                    .failCodeList("")
                    .transTime(rs.getString("TRANSTIME"))
                    .device(rs.getString("DEVICE"))
                    .lotNumber(rs.getString("LOT_NUMBER"))
                    .mainLot("")
                    .waferId(rs.getString("WAFER_ID"))
                    .operation(rs.getString("OPERATION"))
                    .turn(rs.getString("TURN"))
                    .slotId("")
                    .passRate(rs.getDouble("YIELD"))
                    .qtyGoodDie(rs.getInt("TESTCOUNT"))
                    .qtyTestDie(rs.getInt("PASSCOUNT"))
                    .qtyFailDie(rs.getInt("FAILCOUNT"))
                    .build();
        };

        return namedParameterJdbcTemplate.query(query,sqlParameterSource,aviYieldReportResponseRowMapper);
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
                                                        String device, String start_date, String end_date, String end_date2,
                                                        String externalFlag) {


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

        shift_start =  dateList.get(0).get("shift_start").toString();
        shift_end = shift_start;
        int shiftEnd = Integer.parseInt(shift_end);
        shift_end = String.format("%04d", shiftEnd);
        last_day = dateList.get(dateList.size()-1).get("Natural_Date").toString();


        sb = new StringBuilder();
        //메인쿼리 생성
        sb.append("Select Operation, Operation_Desc                                                                                                 ");
        for (int j = 0; j < dateList.size(); j++)
        {
            sel_day = dateList.get(j).get("Natural_Date").toString();
            sb.append("      ,Sum(\"" + sel_day + "\") as \"" + sel_day + "\"                                                                       ");
        }
        sb.append("      From (");


        for (int i = 0; i < operationList.size(); i++)
        {//공정별로 로우 뽑음.
            sel_oper = operationList.get(i).get("operation").toString();

            if (i != 0)
                sb.append("             Union All                                                                                                   ");

            sb.append("            Select '" + sel_oper + "' as Operation                                                                           ");
            sb.append("            ,Get_Operation_Desc(plant, '" + sel_oper + "') AS Operation_Desc                                                 ");

            for (int j = 0; j < dateList.size(); j++)
            {//날짜별로 칼럼 뽑음.
                sel_natural = dateList.get(j).get("natural_date").toString();
                if (sel_natural != to_day)
                {

                    sb.append("            ,Case When Point_Time = To_Char(To_Date('" + sel_natural + "') +1, 'YYYYMMDD') ||'" + shift_start + "'       ");
                    sb.append("                       Then Sum(nvl(Qty1,0)) Else 0 End as \"" + sel_natural + "\"                                                  ");
                }
                else
                {
                    sb.append("                       , 0 as \"" + sel_day + "\"                                                  ");
                }
            }




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
            if(externalFlag.equals("Y")){
                if(customer !=null && !customer.isEmpty()){
                        sb.append("              And Customer in (" + customer + ")                                                                     ");
                }else{
                    sb.append("              And Customer in ( '' )                                                                     ");
                }
            }
            if (!device.isEmpty())
                sb.append("              And Device in (" + device + ")                                                                         ");
            if(!lotNumber.isEmpty())
            {
                sb.append("              And lot_number  in ("+ lotNumber +")                                                                             ");
            }

            sb.append("            Group by plant, operation,Point_Time, QTY1_UNIT                                                                          ");
            sb.append("             /*" + sel_oper + "*/                                                                                         ");
        }


        //당일 재공부분
        if (to_day.equals(last_day))
        {
            sb.append(" Union All /***** Today Start *****/  ");

            for (int i = 0; i < operationList.size(); i++)
            {//공정별로 로우 뽑음.
                sel_oper = operationList.get(i).get("operation").toString();

                if (i != 0)
                    sb.append("             Union All                                                                                                   ");

                sb.append("            Select '" + sel_oper + "' as Operation                                                                           ");
                sb.append("            ,Get_Operation_Desc(plant, '" + sel_oper + "') AS Operation_Desc                                                 ");

                for (int j = 0; j < dateList.size(); j++)
                {//날짜별로 칼럼 뽑음.
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
                if(externalFlag.equals("Y")){
                    if(customer != null && !customer.isEmpty()){
                            sb.append("              And Customer in (" + customer + ")                                                                     ");
                    }else{
                        sb.append("              And Customer in ('')                                                                     ");
                    }

                }
                if (!device.isEmpty())
                    sb.append("              And Device in (" + device + ")                                                                         ");
                if(!lotNumber.isEmpty())
                    sb.append("              And lot_number in ("+lotNumber+")                                                                               ");

                sb.append("            Group by plant, operation,QTY1_UNIT                                                                           ");
                sb.append("             /*" + sel_oper + "*/   ");
                sb.append("             /***** Today End *****/   ");
            }
        }//당일 조회 끝

        sb.append(" )                                       ");
        sb.append(" Group by Operation, Operation_Desc      ");
        sb.append(" Order by Operation                      ");

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

    public List<ProbeYieldReportResponse> getProbeYieldReport(String plant, String customer, String lotNumbers,
                                                              String operations, String devices, String startDate,
                                                              String endDate, String externalFlag) {

        StringBuilder sb = new StringBuilder();
        sb.append(" SELECT                                                       ");
        sb.append("   TO_CHAR(TO_DATE(A.TRANS_TIME,'YYYYMMDDHH24MISS'),'YYYY-MM-DD') TRANS_TIME ");
//        sb.append("   A.TRANS_TIME                                                                       ");
        sb.append(" , GET_DEVICE_DESC(A.PLANT,A.DEVICE) DEVICE                                      ");
        sb.append(" ,A.LOT_NUMBER                                                                        ");
        sb.append(" ,A.WAFER_ID                                                                          ");
        sb.append(" , GET_OPERATION_DESC_ONLY(A.PLANT,A.OPERATION) OPERATION                             ");
        sb.append(" ,A.TURN                                                                              ");
        sb.append(" ,TRUNC(YIELD,2) AS YIELD                                                             ");
        sb.append(" ,A.TESTCOUNT                                                                         ");
        sb.append(" ,A.PASSCOUNT                                                                         ");
        sb.append(" ,A.FAILCOUNT                                                                         ");
//        sb.append(" ,TO_CHAR(TO_DATE(A.TESTDATE,'YYYYMMDDHH24MISS'),'YYYY-MM-DD') TESTDATE      ");
        sb.append(" ,A.TESTDATE                                                                           ");
        sb.append(" FROM TDMS_PROBE_SPEC_HEADER A, ASFC_LOT_STATUS B   ");
        sb.append(" WHERE A.PLANT = :plant                                       ");
        sb.append("     AND A.PLANT = B.PLANT                                     ");
        sb.append("     AND A.LOT_NUMBER = B.LOT_NUMBER                          ");
        sb.append("     AND A.OPERATION IN                                       ");
        sb.append("     (SELECT GROUP_OBJECT                                     ");
        sb.append("           FROM ADM_GROUP_CATEGORY_DATA                       ");
        sb.append("          WHERE PLANT           = :plant                      ");
        sb.append("            AND GROUP_TARGET = 'OPERATION'                    ");
        sb.append("            AND GROUP_INDEX  = 3                              ");
        sb.append("            AND GROUP_VALUE = 'PTEST')                        ");
        if(externalFlag.equals("Y")){
            if(customer !=null && !customer.isEmpty()){
                    sb.append("     AND B.CUSTOMER = :customer                               ");
            }else{
                sb.append("     AND B.CUSTOMER = ''                               ");
            }
        }
        if(!lotNumbers.isEmpty()){
            sb.append(" AND A.LOT_NUMBER IN ("+lotNumbers+ ")                     ");
        }
        if(!devices.isEmpty()){
            sb.append(" AND A.DEVICE IN ("+devices+")                             ");
        }
        if(!operations.isEmpty()){
            sb.append(" AND A.OPERATION IN ("+operations+")"                       );
        }
        if(!startDate.isEmpty()){
            sb.append(" AND A.TRANS_TIME BETWEEN :startDate AND :endDate            ");
        }


        String query = sb.toString();
        SqlParameterSource sqlParameterSource = new MapSqlParameterSource()
                .addValue("plant",plant)
                .addValue("customer", customer)
                .addValue("startDate",startDate)
                .addValue("endDate",endDate)
                ;

        RowMapper<ProbeYieldReportResponse> probeYieldReportResponseRowMapper = (rs, rowNum) -> {
            return ProbeYieldReportResponse.builder()
                    .transTime(rs.getString("TRANS_TIME"))
                    .device(rs.getString("DEVICE"))
                    .lotNumber(rs.getString("LOT_NUMBER"))
                    .waferId(rs.getString("WAFER_ID"))
                    .operation(rs.getString("OPERATION"))
                    .turn(rs.getString("turn"))
                    .yield(rs.getDouble("YIELD"))
                    .qtyTestDie(rs.getInt("TESTCOUNT"))
                    .qtyGoodDie(rs.getInt("PASSCOUNT"))
                    .qtyFailDie(rs.getInt("FAILCOUNT"))
                    .testDate(rs.getString("TESTDATE"))
                    .build();
        };

        return namedParameterJdbcTemplate.query(query,sqlParameterSource, probeYieldReportResponseRowMapper);
    }

    public List<TotalYieldReportResponse> getTotalYieldReport(String plant, String customer,
                                                              String lotNumbers, String operations, String devices,
                                                              String startDate, String endDate, String externalFlag) {
        StringBuilder sb = new StringBuilder();

        sb.append(" SELECT                                                                                          ");
        sb.append("        (SELECT DESCRIPTION FROM ADM_DEVICE WHERE DEVICE = A.DEVICE) DEVICE,                     ");
        sb.append("        A.LOT_NUMBER,                                                                            ");
        sb.append("        A.WAFER_ID,                                                                              ");
        sb.append("        A.TURN,                                                                                  ");
        sb.append("        A.TOTAL_PROBE,                                                                           ");
        sb.append("        A.PASS_PROBE,                                                                            ");
        sb.append("        A.YIELD_PROBE,                                                                           ");
        sb.append("        A.B2,                                                                                    ");
        sb.append("        A.B3,                                                                                    ");
        sb.append("        A.B4,                                                                                    ");
        sb.append("        A.B5,                                                                                    ");
        sb.append("        A.B6,                                                                                    ");
        sb.append("        A.B7,                                                                                    ");
        sb.append("        A.B8,                                                                                    ");
        sb.append("        A.TOTAL_AVI,                                                                             ");
        sb.append("        A.PASS_AVI,                                                                              ");
        sb.append("        A.YIELD_AVI,                                                                             ");
        sb.append("        TO_CHAR (TO_DATE (C.TRANS_TIME, 'YYYYMMDDHH24MISS'), 'YYYY-MM-DD')    AS SHIPMENT_DATE   ");
        sb.append("   FROM (  SELECT MAX (DEVICE)         AS DEVICE,                                                ");
        sb.append("                  MAX (LOT_NUMBER)     AS LOT_NUMBER,                                            ");
        sb.append("                  WAFER_ID,                                                                      ");
        sb.append("                  TURN,                                                                          ");
        sb.append("                  MAX (TESTCOUNT)      AS TOTAL_PROBE,                                           ");
        sb.append("                  MAX (PASSCOUNT)      AS PASS_PROBE,                                            ");
        sb.append("                  MAX (FAILCOUNT)      AS YIELD_PROBE,                                           ");
        sb.append("                  MAX (B2)             AS B2,                                                    ");
        sb.append("                  MAX (B3)             AS B3,                                                    ");
        sb.append("                  MAX (B4)             AS B4,                                                    ");
        sb.append("                  MAX (B5)             AS B5,                                                    ");
        sb.append("                  MAX (B6)             AS B6,                                                    ");
        sb.append("                  MAX (B7)             AS B7,                                                    ");
        sb.append("                  MAX (B8)             AS B8,                                                    ");
        sb.append("                  MAX (TOTAL_AVI)      AS TOTAL_AVI,                                             ");
        sb.append("                  MAX (PASS_AVI)       AS PASS_AVI,                                              ");
        sb.append("                  MAX (YIELD_AVI)      AS YIELD_AVI,                                             ");
        sb.append("                  MAX (TRANS_TIME)     AS TRANS_TIME                                             ");
        sb.append("             FROM (SELECT DEVICE,                                                                ");
        sb.append("                          LOT_NUMBER,                                                            ");
        sb.append("                          WAFER_ID,                                                              ");
        sb.append("                          OPERATION,                                                             ");
        sb.append("                          TURN,                                                                  ");
        sb.append("                          TESTCOUNT,                                                             ");
        sb.append("                          PASSCOUNT,                                                             ");
        sb.append("                          FAILCOUNT,                                                             ");
        sb.append("                          B2,                                                                    ");
        sb.append("                          B3,                                                                    ");
        sb.append("                          B4,                                                                    ");
        sb.append("                          B5,                                                                    ");
        sb.append("                          B6,                                                                    ");
        sb.append("                          B7,                                                                    ");
        sb.append("                          B8,                                                                    ");
        sb.append("                          ''     AS TOTAL_AVI,                                                   ");
        sb.append("                          ''     AS PASS_AVI,                                                    ");
        sb.append("                          ''     AS YIELD_AVI,                                                   ");
        sb.append("                          TRANS_TIME                                                             ");
        sb.append("                     FROM TDMS_PROBE_SPEC_HEADER                                                 ");
        sb.append("                          WHERE OPERATION IN                                                       ");
        sb.append("                                  (SELECT GROUP_OBJECT                                           ");
        sb.append("                                     FROM ADM_GROUP_CATEGORY_DATA                                ");
        sb.append("                                    WHERE     PLANT = 'SAWNICS'                                  ");
        sb.append("                                          AND GROUP_TARGET = 'OPERATION'                         ");
        sb.append("                                          AND GROUP_VALUE = 'PTEST'                              ");
        sb.append("                                          AND GROUP_INDEX = 3)                                   ");
        sb.append("                   UNION ALL                                                                     ");
        sb.append("                   SELECT DEVICE,                                                                ");
        sb.append("                          LOT_NUMBER,                                                            ");
        sb.append("                          HEADER_5 AS WAFER_ID,                                                  ");
        sb.append("                          OPERATION,                                                             ");
        sb.append("                          TURN,                                                                  ");
        sb.append("                          '' AS TESTCOUNT,                                                       ");
        sb.append("                          '' AS PASSCOUNT,                                                       ");
        sb.append("                          '' AS FAILCOUNT,                                                       ");
        sb.append("                          '' AS B2,                                                              ");
        sb.append("                          '' AS B3,                                                              ");
        sb.append("                          '' AS B4,                                                              ");
        sb.append("                          '' AS B5,                                                              ");
        sb.append("                          '' AS B6,                                                              ");
        sb.append("                          '' AS B7,                                                              ");
        sb.append("                          '' AS B8,                                                              ");
        sb.append("                          HEADER_7 AS TOTAL_AVI,                                                 ");
        sb.append("                          HEADER_8 AS PASS_AVI,                                                  ");
        sb.append("                          HEADER_9 AS YIELD_AVI,                                                 ");
        sb.append("                          TRANSTIME     AS TRANS_TIME                                            ");
        sb.append("                     FROM TDMS_AVI_INFO                                                          ");
        sb.append("                          WHERE OPERATION IN                                                       ");
        sb.append("                                  (SELECT GROUP_OBJECT                                           ");
        sb.append("                                     FROM ADM_GROUP_CATEGORY_DATA                                ");
        sb.append("                                    WHERE     PLANT = 'SAWNICS'                                  ");
        sb.append("                                          AND GROUP_TARGET = 'OPERATION'                         ");
        sb.append("                                          AND GROUP_VALUE = 'AVI'                                ");
        sb.append("                                          AND GROUP_INDEX = 3)                                   ");
        sb.append("                          AND CNT > 0)                                                           ");
        sb.append("         GROUP BY TURN, WAFER_ID                                                                 ");
        sb.append("         ORDER BY WAFER_ID) A,                                                                   ");
        sb.append("        ASFC_LOT_HISTORY  C, ASFC_LOT_STATUS D                                                                      ");
        sb.append("  WHERE     A.LOT_NUMBER = C.LOT_NUMBER(+)                                                       ");
        sb.append("        AND C.TRANSACTION(+) = 'SSHP'                                                            ");
        sb.append("  AND A.LOT_NUMBER = D.LOT_NUMBER                                                                ");

        if(!devices.isEmpty())
        {
            sb.append("             AND A.DEVICE IN ("+devices+")                                                                         ");
            
        }

        if(!lotNumbers.isEmpty())
        {
            sb.append("             AND A.LOT_NUMBER IN ("+lotNumbers+")                                                                    ");
            
        }
        if(!startDate.isEmpty())
        {
            sb.append("             AND A.TRANS_TIME BETWEEN :startDate AND :endDate                                                      ");
            
        }
        if(externalFlag.equals("Y")){
            if(customer !=null && !customer.isEmpty()){
                    sb.append(" AND D.CUSTOMER = :customer   ");
            }else{
                sb.append(" AND D.CUSTOMER = ''   ");
            }
        }
        


        SqlParameterSource sqlParameterSource = new MapSqlParameterSource()
                .addValue("plant",plant)
                .addValue("startDate",startDate)
                .addValue("endDate", endDate)
                .addValue("customer", customer);
                ;

        RowMapper<TotalYieldReportResponse> totalYieldReportResponseRowMapper = (rs, rowNum) -> {
            return TotalYieldReportResponse.builder()
                    .device(rs.getString("DEVICE"))
                    .lotNumber(rs.getString("LOT_NUMBER"))
                    .waferId(rs.getString("WAFER_ID"))
                    .turn(rs.getString("TURN"))
                    .totalProbe(rs.getInt("TOTAL_PROBE"))
                    .passProbe(rs.getInt("PASS_PROBE"))
                    .yieldProbe(rs.getDouble("YIELD_PROBE"))
                    .b2(rs.getString("B2"))
                    .b3(rs.getString("B3"))
                    .b4(rs.getString("B4"))
                    .b5(rs.getString("B5"))
                    .b6(rs.getString("B6"))
                    .b7(rs.getString("B7"))
                    .b8(rs.getString("B8"))
                    .totalAvi(rs.getInt("TOTAL_AVI"))
                    .passAvi(rs.getInt("PASS_AVI"))
                    .yieldAvi(rs.getDouble("YIELD_AVI"))
                    .shipmentDate(rs.getString("SHIPMENT_DATE"))
                    .build();
        };

        List<TotalYieldReportResponse> totalYieldReportResponses = new ArrayList<>();
        try {
            totalYieldReportResponses = namedParameterJdbcTemplate.query(sb.toString(),sqlParameterSource,totalYieldReportResponseRowMapper);
        }catch (Exception ex){
            System.out.println("Error!!" +  ex.getMessage());
            return totalYieldReportResponses;
        }

          return totalYieldReportResponses;
    }
}
