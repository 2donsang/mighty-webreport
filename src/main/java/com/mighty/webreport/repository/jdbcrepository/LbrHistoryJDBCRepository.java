package com.mighty.webreport.repository.jdbcrepository;

import com.mighty.webreport.domain.dto.DefectResponse;
import com.mighty.webreport.domain.dto.IdTextDto;
import com.mighty.webreport.domain.dto.MovementResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class LbrHistoryJDBCRepository {

    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    public List<DefectResponse> getDefectStatus(String plant, String startDate, String endDate, String devices, String operations, String lotNumbers){
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT c.device || ' : ' || c.description as device,");
        sql.append("       d.operation || ' : ' || d.short_desc as operation,");
        sql.append("       b.run_number,");
        sql.append("       a.lot_number,");
        sql.append("       SUM(a.lbr_qty1 - nvl(t.expand_field5, 0)) total_lbr_qty");
        sql.append("     , SUM(case when a.lbr_type = 'L' then a.lbr_qty1 else 0 end) loss_scrap_qty");
        sql.append("     , SUM(case when a.lbr_type = 'P' then a.lbr_qty1 else 0 end) loss_repair_qty");
        sql.append("     , sum(decode(ora_hash(nvl(code_group1, get_loss_group(a.plant, a.operation, a.lbr_code, 'CODE_GROUP1')) || nvl(code_group2, get_loss_group(a.plant, a.operation, a.lbr_code, 'CODE_GROUP2')) ||  a.lbr_code), '3008454055', lbr_qty1, 0)) as M1Scratch");
        sql.append("     , sum(decode(ora_hash(nvl(code_group1, get_loss_group(a.plant, a.operation, a.lbr_code, 'CODE_GROUP1')) || nvl(code_group2, get_loss_group(a.plant, a.operation, a.lbr_code, 'CODE_GROUP2')) ||  a.lbr_code), '2356725865', lbr_qty1, 0)) as Crack");
        sql.append("     , sum(decode(ora_hash(nvl(code_group1, get_loss_group(a.plant, a.operation, a.lbr_code, 'CODE_GROUP1')) || nvl(code_group2, get_loss_group(a.plant, a.operation, a.lbr_code, 'CODE_GROUP2')) ||  a.lbr_code), '3766372494', lbr_qty1, 0)) as Chip");
        sql.append("     , sum(decode(ora_hash(nvl(code_group1, get_loss_group(a.plant, a.operation, a.lbr_code, 'CODE_GROUP1')) || nvl(code_group2, get_loss_group(a.plant, a.operation, a.lbr_code, 'CODE_GROUP2')) ||  a.lbr_code), '1176977116', lbr_qty1, 0)) as Scratch");
        sql.append(" from asfc_lbr_history a , asfc_lot_status b , adm_device c, adm_operation d,");
        sql.append("      (select a.operation, b.plant, b.table_name, b.code_name, b.code_group1, b.code_group2, b.code_group3");
        sql.append("         from adm_operation a, adm_user_code_data b");
        sql.append("        where a.plant = b.plant");
        sql.append("          and a.loss_table = b.table_name) e");
        sql.append("     , asfc_retest_history t");
        sql.append(" where a.plant = :plant");
        sql.append("   and a.plant = c.plant");
        sql.append("   and a.plant = d.plant");
        sql.append("   and a.operation = d.operation");
        sql.append("   and a.plant = e.plant(+)");
        sql.append("   and a.lbr_code = e.code_name(+)");
        sql.append("   and a.operation = e.operation(+)");
        sql.append("   and a.device = c.device");
        sql.append("   and a.lot_number = b.lot_number");
        sql.append("   and a.lbr_type in ('L', 'P')");
        sql.append("   and a.lot_number = t.lot_number(+)");
        sql.append("   and a.trans_time = t.trans_time(+)");
        sql.append("   and a.transaction = t.transaction(+)");
        sql.append("   and a.lbr_code = t.retest_code(+)");
        sql.append("   and case when t.lot_number is null then a.lbr_qty1");
        sql.append("            else t.qty1_new - t.qty1_old - nvl(t.expand_field5, 0)");
        sql.append("            end > 0");
        sql.append("   and a.trans_time >= :startDate");
        sql.append("   and a.trans_time <  :endDate");
        sql.append("   and b.create_code in ('MASS-PROD','REPAIR','RET_SHIP1','RET_SHIP2')");

        if (!operations.isEmpty()){
            sql.append("  and ( d.operation IN ( " + operations + " ) ) ");
        }

        if (!devices.isEmpty()){
            sql.append("  and ( c.device IN ( " + devices + " ) ) ");
        }

        if (!lotNumbers.isEmpty()){
            sql.append("   and a.lot_number in ( " + lotNumbers + ") ");
        }

        sql.append(" group by a.plant, c.device, c.description,  d.operation, d.short_desc  ,a.lot_number  ,b.run_number");
        sql.append(" order by 1,2,3,4");

        SqlParameterSource namedParameters = new MapSqlParameterSource()
                .addValue("plant",plant)
                .addValue("startDate",startDate)
                .addValue("endDate",endDate);

        RowMapper<DefectResponse> lotStatusMapper = (rs, rowNum) -> {
            return DefectResponse.builder()
                    .device(rs.getString("device"))
                    .operation(rs.getString("operation"))
                    .lotNumber(rs.getString("lot_number"))
                    .totalLbrQty(rs.getInt("total_lbr_qty"))
                    .lossScrapQty(rs.getInt("loss_scrap_qty"))
                    .lossRepairQty(rs.getInt("loss_repair_qty"))
                    .m1Scratch(rs.getInt("M1Scratch"))
                    .crack(rs.getInt("Crack"))
                    .chip(rs.getInt("Chip"))
                    .scratch(rs.getInt("Scratch"))
                    .build();
        };

        return namedParameterJdbcTemplate.query(sql.toString(),namedParameters,lotStatusMapper);
    }

    public List<MovementResponse> getMovementStatus(String plant, String startDate, String endDate, String startDay, String endDay, String operationsString, String devicesString, String customersString, String userId) {

        StringBuilder sb =new StringBuilder();

    /*    sb.append(" select decode(operation, 'LT9900', '재고', '재공') as wip_stock,                                                                                                        ");
        sb.append("        operation,                                                                                                                                                    ");
        sb.append("        get_operation_desc (plant, operation) as operation_step,                                                                                                      ");
        sb.append("        device,                                                                                                                                                       ");
        sb.append("        device_desc,                                                                                                                                                  ");
        sb.append("        customer,                                                                                                                                                     ");
        sb.append("        customer_desc,                                                                                                                                                ");
        sb.append("        boh,                                                                                                                                                          ");
        sb.append("        eoh,                                                                                                                                                          ");
        sb.append("        proc_in,                                                                                                                                                      ");
        sb.append("        out_in_qty,                                                                                                                                                   ");
        sb.append("        proc_out,                                                                                                                                                     ");
        sb.append("        loss,                                                                                                                                                         ");
        sb.append("        bonus,                                                                                                                                                        ");
        sb.append("        cv,                                                                                                                                                           ");
        sb.append("        repair,                                                                                                                                                       ");
        sb.append("        instant_repair,                                                                                                                                               ");
        sb.append("        simple_measure,                                                                                                                                               ");
        sb.append("        pseudo_loss,                                                                                                                                                  ");
        sb.append("        t_tat,                                                                                                                                                        ");
        sb.append("        case when proc_in = 0 then 0                                                                                                                                  ");
        sb.append("             else decode(out_in_qty, 0, 0, round(((proc_out) / (proc_in)) * 100, 2))                                                                                  ");
        sb.append("        end as yield,                                                                                                                                                 ");
        sb.append("        decode (proc_out, 0, 0, round (t_tat / proc_out, 2)) as tat,                                                                                                  ");
        sb.append("        t_tat as sumtat                                                                                                                                               ");
        sb.append("   from (select plant,                                                                                                                                                ");
        sb.append("                operation,                                                                                                                                            ");
        sb.append("                device,                                                                                                                                               ");
        sb.append("                customer,                                                                                                                                             ");
        sb.append("                get_device_desc (plant, device) as device_desc,                                                                                                       ");
        sb.append("                get_customer_name_only (plant, customer) as customer_desc,                                                                                            ");
        sb.append("                sum (wip) as wip,                                                                                                                                     ");
        sb.append("                sum (boh) as boh,                                                                                                                                     ");
        sb.append("                sum (proc_out) + sum (loss) + sum (cv) + sum (repair) - sum (bonus) as proc_in,                                                                       ");
        sb.append("                sum (proc_out) as proc_out,                                                                                                                           ");
        sb.append("                sum (loss) as loss,                                                                                                                                   ");
        sb.append("                sum (bonus) as bonus,                                                                                                                                 ");
        sb.append("                sum (cv) as cv,                                                                                                                                       ");
        sb.append("                sum (repair) as repair,                                                                                                                               ");
        sb.append("                sum (instant_repair) as instant_repair,                                                                                                               ");
        sb.append("                sum (simple_measure) as simple_measure,                                                                                                               ");
        sb.append("                sum (pseudo_loss) as pseudo_loss,                                                                                                                     ");
        sb.append("                sum (eoh) as eoh,                                                                                                                                     ");
        sb.append("                sum (t_tat) as t_tat,                                                                                                                                 ");
        sb.append("                sum (out_in_qty) as out_in_qty                                                                                                                        ");
        sb.append("           from ((select plant,                                                                                                                                       ");
        sb.append("                         operation,                                                                                                                                   ");
        sb.append("                         device,                                                                                                                                      ");
        sb.append("                         customer,                                                                                                                                    ");
        sb.append("                         sum (wip_count) as wip,                                                                                                                      ");
        sb.append("                         sum (boh_qty1) as boh,                                                                                                                       ");
        sb.append("                         sum (oper_out_in_qty1 + rwk_out_qty1) as proc_in,                                                                                            ");
        sb.append("                         sum (oper_out_qty1) as proc_out,                                                                                                             ");
        sb.append("                         sum (loss_qty1 - repair_qty1) as loss,                                                                                                       ");
        sb.append("                         sum (bonus_qty1) as bonus,                                                                                                                   ");
        sb.append("                         sum (cv_qty1) as cv,                                                                                                                         ");
        sb.append("                         0 as repair,                                                                                                                                 ");
        sb.append("                         0 as instant_repair,                                                                                                                         ");
        sb.append("                         0 as simple_measure,                                                                                                                         ");
        sb.append("                         0 as pseudo_loss,                                                                                                                            ");
        sb.append("                         0 as eoh,                                                                                                                                    ");
        sb.append("                         sum (total_tat) as t_tat,                                                                                                                    ");
        sb.append("                         sum (oper_out_in_qty1) as out_in_qty                                                                                                         ");
        sb.append("                    from rptmit_sawnics.rws_day_lot a                                                                                                                 ");
        sb.append("                   where plant = :plant                                                                                                                               ");
        sb.append("                     and sum_day between :startDay and :endDay                                                                                                    ");
        sb.append("                   group by plant,                                                                                                                                    ");
        sb.append("                            operation,                                                                                                                                ");
        sb.append("                            device,                                                                                                                                   ");
        sb.append("                            customer)                                                                                                                                 ");
        sb.append("                   union all                                                                                                                                          ");
        sb.append("                 (select a.plant,                                                                                                                                     ");
        sb.append("                         a.operation,                                                                                                                                 ");
        sb.append("                         a.device,                                                                                                                                    ");
        sb.append("                         b.customer,                                                                                                                                  ");
        sb.append("                         0 as wip,                                                                                                                                    ");
        sb.append("                         0 as boh,                                                                                                                                    ");
        sb.append("                         0 as proc_in,                                                                                                                                ");
        sb.append("                         0 as proc_out,                                                                                                                               ");
        sb.append("                         0 as loss,                                                                                                                                   ");
        sb.append("                         0 as bonus,                                                                                                                                  ");
        sb.append("                         0 as cv,                                                                                                                                     ");
        sb.append("                         sum (case when a.lbr_type = 'P' then a.lbr_qty1                                                                                              ");
        sb.append("                                   else 0 end) as repair,                                                                                                             ");
        sb.append("                         sum (case when a.lbr_type = 'T' and a.lbr_code <> 'PSL001' and nvl(t.expand_flag1, 'I') = 'R' then a.lbr_qty1 - nvl(t.expand_field5, 0)      ");
        sb.append("                                   else 0 end) as instant_repair,                                                                                                     ");
        sb.append("                         sum (case when a.lbr_type = 'T' and a.lbr_code <> 'PSL001' and nvl(t.expand_flag1, 'I') = 'I' then a.lbr_qty1                                ");
        sb.append("                                   else 0 end) as simple_measure,                                                                                                     ");
        sb.append("                         sum (case when a.lbr_type = 'T' and a.lbr_code = 'PSL001' then a.lbr_qty1                                                                    ");
        sb.append("                                   else 0 end) as pseudo_loss,                                                                                                        ");
        sb.append("                         0 as eoh,                                                                                                                                    ");
        sb.append("                         0 as t_tat,                                                                                                                                  ");
        sb.append("                         0 as out_in_qty                                                                                                                              ");
        sb.append("                    from asfc_lbr_history a                                                                                                                           ");
        sb.append("                       , asfc_lot_history b                                                                                                                           ");
        sb.append("                       , asfc_retest_history t                                                                                                                        ");
        sb.append("                   where a.plant = :plant                                                                                                                             ");
        sb.append("                     and a.trans_time between :startDate and :endDate                                                                                   ");
        sb.append("                     and a.lbr_type in ('P', 'T')                                                                                                                     ");
        sb.append("                     and a.lot_number = b.lot_number                                                                                                                  ");
        sb.append("                     and a.trans_time = b.trans_time                                                                                                                  ");
        sb.append("                     and a.transaction = b.transaction                                                                                                                ");
        sb.append("                     and a.lot_number = t.lot_number(+)                                                                                                               ");
        sb.append("                     and a.trans_time = t.trans_time(+)                                                                                                               ");
        sb.append("                     and a.transaction = t.transaction(+)                                                                                                             ");
        sb.append("                     and a.lbr_code = t.retest_code(+)                                                                                                                ");
        sb.append("                     and case when t.lot_number is null then a.lbr_qty1                                                                                               ");
        sb.append("                              else t.qty1_new - t.qty1_old - nvl(t.expand_field5, 0)                                                                                  ");
        sb.append("                              end > 0                                                                                                                                 ");
        sb.append("                   group by a.plant,                                                                                                                                  ");
        sb.append("                            a.operation,                                                                                                                              ");
        sb.append("                            a.device,                                                                                                                                 ");
        sb.append("                            b.customer)                                                                                                                               ");
        sb.append("                   union all                                                                                                                                          ");
        sb.append("                 (select a.plant,                                                                                                                                     ");
        sb.append("                         a.operation,                                                                                                                                 ");
        sb.append("                         a.device,                                                                                                                                    ");
        sb.append("                         a.customer,                                                                                                                                  ");
        sb.append("                         0 AS wip,                                                                                                                                    ");
        sb.append("                         0 AS boh,                                                                                                                                    ");
        sb.append("                         0 AS proc_in,                                                                                                                                ");
        sb.append("                         0 AS proc_out,                                                                                                                               ");
        sb.append("                         0 AS loss,                                                                                                                                   ");
        sb.append("                         0 AS bonus,                                                                                                                                  ");
        sb.append("                         0 AS CV,                                                                                                                                     ");
        sb.append("                         0 AS repair,                                                                                                                                 ");
        sb.append("                         0 AS instant_repair,                                                                                                                         ");
        sb.append("                         0 AS simple_measure,                                                                                                                         ");
        sb.append("                         0 AS pseudo_loss,                                                                                                                            ");
        sb.append("                         sum(a.qty1) AS eoh,                                                                                                                          ");
        sb.append("                         0 AS t_tat,                                                                                                                                  ");
        sb.append("                         0 AS out_in_qty                                                                                                                              ");
        sb.append("                    from rptmit_sawnics.rwr_wip_status a                                                                                                              ");
        sb.append("                   where plant = :plant                                                                                                                               ");
        sb.append("                   group by plant,                                                                                                                                    ");
        sb.append("                            operation,                                                                                                                                ");
        sb.append("                            device,                                                                                                                                   ");
        sb.append("                            customer                                                                                                                                  ");
        sb.append("                 )                                                                                                                                                    ");
        sb.append("                )                                                                                                                                                     ");
        sb.append("          group by plant,                                                                                                                                             ");
        sb.append("                   operation,                                                                                                                                         ");
        sb.append("                   device,                                                                                                                                            ");
        sb.append("                   get_device_desc(plant, device),                                                                                                                    ");
        sb.append("                   customer,                                                                                                                                          ");
        sb.append("                   get_customer_name_only(plant, customer)                                                                                                            ");
        sb.append("        )                                                                                                                                                             ");
        sb.append("  where (boh + proc_in + out_in_qty + proc_out + eoh + repair + instant_repair + simple_measure + pseudo_loss + cv) <> 0                                              ");
        sb.append("    and operation in (select operation                                                                                                                                ");
        sb.append("                        from adm_operation                                                                                                                            ");
        sb.append("                       where plant = :plant and intransit <> 'Y'                                                                                                      ");
        sb.append("                      )                                                                                                                                               ");
        if(!operationsString.isEmpty())
        {
            sb.append("    and operation in ("+operationsString+")                                                                                                                                         ");
        }

        if(!devicesString.isEmpty())
        {
            sb.append("    and device in ("+devicesString+")                                                                                                                                       ");
        }
        if(!customersString.isEmpty())
        {
            sb.append("    and customer in ("+customersString+")                                                                                                                                        ");
        }
        sb.append("  order by get_operation_num(:plant, operation), 3,4,5                                                                                                              "); */




        sb.append(" WITH                                                                                         ");
        sb.append("     a1                                                                                       ");
        sb.append("     AS                                                                                       ");
        sb.append("         (SELECT plant                                                                        ");
        sb.append("            FROM (SELECT ROWNUM AS row_no, plant FROM asfc_lot_history)                       ");
        sb.append("           WHERE row_no < 100),                                                               ");
        sb.append("     a2                                                                                       ");
        sb.append("     AS                                                                                       ");
        sb.append("         (SELECT plant                                                                        ");
        sb.append("            FROM (SELECT ROWNUM AS row_no, plant FROM asfc_lot_history)                       ");
        sb.append("           WHERE row_no < 100),                                                               ");
        sb.append("     b                                                                                        ");
        sb.append("     AS                                                                                       ");
        sb.append("         (SELECT '재공'                                 AS wip_stock,                           ");
        sb.append("                 'TESTOPER'                               AS operation,                       ");
        sb.append("                 'TESTOPER : 테스트공정'             AS operation_step,                           ");
        sb.append("                 'TESTDEV'                                AS device,                          ");
        sb.append("                 'TESTDEV : 테스트제품'              AS device_desc,                              ");
        sb.append("                 'SAWNICS'                                AS customer,                        ");
        sb.append("                 'SAWNICS'                                AS customer_desc,                   ");
        sb.append("                 0                                        AS boh,                             ");
        sb.append("                 1000                                     AS eoh,                             ");
        sb.append("                 TRUNC (DBMS_RANDOM.VALUE (1, 10))        AS proc_in,                         ");
        sb.append("                 TRUNC (DBMS_RANDOM.VALUE (1, 10))        AS out_in_qty,                      ");
        sb.append("                 TRUNC (DBMS_RANDOM.VALUE (1, 10))        AS proc_out,                        ");
        sb.append("                 0                                        AS loss,                            ");
        sb.append("                 0                                        AS bonus,                           ");
        sb.append("                 0                                        AS CV,                              ");
        sb.append("                 0                                        AS repair,                          ");
        sb.append("                 0                                        AS instant_repair,                  ");
        sb.append("                 0                                        AS simple_measure,                  ");
        sb.append("                 0                                        AS pseudo_loss,                     ");
        sb.append("                 0                                        AS t_tat,                           ");
        sb.append("                 TRUNC (DBMS_RANDOM.VALUE (1, 10), 2)     AS yield,                           ");
        sb.append("                 0                                        AS tat,                             ");
        sb.append("                 0                                        AS sumtat                           ");
        sb.append("            FROM DUAL)                                                                        ");
        sb.append(" SELECT b.wip_stock,                                                                          ");
        sb.append("        b.operation,                                                                          ");
        sb.append("        b.operation_step,                                                                     ");
        sb.append("        b.device,                                                                             ");
        sb.append("        b.device_desc,                                                                        ");
        sb.append("        b.customer,                                                                           ");
        sb.append("        b.customer_desc,                                                                      ");
        sb.append("        b.boh,                                                                                ");
        sb.append("        b.eoh,                                                                                ");
        sb.append("        b.proc_in,                                                                            ");
        sb.append("        b.out_in_qty,                                                                         ");
        sb.append("        b.proc_out,                                                                           ");
        sb.append("        b.loss,                                                                               ");
        sb.append("        b.bonus,                                                                              ");
        sb.append("        b.repair,                                                                             ");
        sb.append("        b.instant_repair,                                                                     ");
        sb.append("        b.simple_measure,                                                                     ");
        sb.append("        b.pseudo_loss,                                                                        ");
        sb.append("        b.t_tat,                                                                              ");
        sb.append("        b.yield,                                                                              ");
        sb.append("        b.tat,                                                                                ");
        sb.append("        b.sumtat                                                                              ");
        sb.append("   FROM a1, a2, b                                                                             ");
        sb.append("  WHERE a1.plant = b.customer AND a2.plant = b.customer                                       ");



        SqlParameterSource namedParameters = new MapSqlParameterSource()
                .addValue("startDate",startDate)
                .addValue("endDate",endDate)
                .addValue("startDay",startDay)
                .addValue("endDay",endDay)
                .addValue("plant",plant);

/*
        RowMapper<MovementResponse> movementMapper = (rs, rowNum) ->{
            return MovementResponse.builder()
                    .operation(rs.getString("operation"))
                    .operationStep(rs.getString("operation_step"))
                    .deviceDesc(rs.getString("device_desc"))
                    .customerDesc(rs.getString("customer_desc"))
                    .boh(rs.getString("boh"))
                    .eoh(rs.getString("eoh"))
                    .procIn(rs.getString("proc_in"))
                    .procOut(rs.getString("proc_out"))
                    .loss(rs.getString("loss"))
                    .bonus(rs.getString("bonus"))
                    .cv(rs.getString("cv"))
                    .yield(rs.getString("yield"))
                    .sumTat(rs.getString("sumtat"))
                    .build();
        };
*/
        RowMapper<MovementResponse> movementMapper = (rs, rowNum) ->{
            return MovementResponse.builder()
                    .operation(rs.getString("operation"))
                    .operationStep(rs.getString("operation_step"))
                    .deviceDesc(rs.getString("device_desc"))
                    .customerDesc(rs.getString("customer_desc"))
                    .boh(rs.getString("boh"))
                    .eoh(rs.getString("eoh"))
                    .procIn(rs.getString("proc_in"))
                    .procOut(rs.getString("proc_out"))
                    .loss(rs.getString("loss"))
                    .bonus(rs.getString("bonus"))
                    .cv(rs.getString("repair"))
                    .yield(rs.getString("yield"))
                    .sumTat(rs.getString("sumtat"))
                    .build();
        };



        return namedParameterJdbcTemplate.query(sb.toString(), namedParameters,movementMapper);
    }
}
