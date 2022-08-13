package com.mighty.webreport.repository.jdbcrepository;

import com.mighty.webreport.domain.dto.LotNumberResponse;
import com.mighty.webreport.domain.dto.LotStatusResponse;
import com.mighty.webreport.domain.dto.OperationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class ConditionJDBCRepository {

    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    public List<LotNumberResponse> getLotNumbers(String plant)
    {
        StringBuilder sb = new StringBuilder();
        sb.append(" SELECT   LOT_NUMBER, DEVICE     ");
        sb.append("   FROM ASFC_LOT_STATUS          ");
        sb.append("  WHERE PLANT = :PLANT           ");
        sb.append("  ORDER BY LOT_NUMBER            ");

        SqlParameterSource namedParameters = new MapSqlParameterSource("PLANT",plant);

        RowMapper<LotNumberResponse> lotNumberResponseRowMapper = (rs, rowNum) -> {
            return LotNumberResponse.builder()
                    .id(rs.getString("lot_number"))
                    .text((rs.getString("device")))
                    .build();
        };
        System.out.print(sb.toString());
        return namedParameterJdbcTemplate.query(sb.toString(),namedParameters,lotNumberResponseRowMapper);
    }


    public List<OperationResponse> getAVIOperationList(String plant) {
        StringBuilder sb = new StringBuilder();
        sb.append(" SELECT  OPERATION || ' : ' || SHORT_DESC AS OPERATION_DESC, OPERATION    ");
        sb.append("   FROM ADM_OPERATION                                      ");
        sb.append("  WHERE PLANT = :PLANT                                     ");
        sb.append("        AND OPERATION IN                                   ");
        sb.append("                 (SELECT GROUP_OBJECT                      ");
        sb.append("                    FROM ADM_GROUP_CATEGORY_DATA           ");
        sb.append("                   WHERE     PLANT = :PLANT                ");
        sb.append("                         AND GROUP_TARGET = 'OPERATION'    ");
        sb.append("                         AND GROUP_INDEX = 3               ");
        sb.append("         AND GROUP_VALUE IN ('AVI')                        ");
        sb.append("                  )                                        ");
        sb.append("   ORDER BY OPERATION                                      ");

        SqlParameterSource sqlParameterSource = new MapSqlParameterSource().addValue("PLANT",plant);

        RowMapper<OperationResponse> operationResponseRowMapper = (rs, rowNum) -> {
            return OperationResponse.builder()
                    .operation(rs.getString("OPERATION"))
                    .description(rs.getString("OPERATION_DESC"))
                    .build();


        };
        return namedParameterJdbcTemplate.query(sb.toString(), sqlParameterSource, operationResponseRowMapper);

    }

    public List<OperationResponse> getProbeOperationList(String plant) {
        StringBuilder sb = new StringBuilder();
        sb.append(" SELECT  OPERATION || ' : ' || SHORT_DESC AS OPERATION_DESC, OPERATION    ");
        sb.append("   FROM ADM_OPERATION                                      ");
        sb.append("  WHERE PLANT = :PLANT                                     ");
        sb.append("        AND OPERATION IN                                   ");
        sb.append("                 (SELECT GROUP_OBJECT                      ");
        sb.append("                    FROM ADM_GROUP_CATEGORY_DATA           ");
        sb.append("                   WHERE     PLANT = :PLANT                ");
        sb.append("                         AND GROUP_TARGET = 'OPERATION'    ");
        sb.append("                         AND GROUP_INDEX = 3               ");
        sb.append("         AND GROUP_VALUE IN ('PTEST')                      ");
        sb.append("                  )                                        ");
        sb.append("   ORDER BY OPERATION                                      ");

        SqlParameterSource sqlParameterSource = new MapSqlParameterSource().addValue("PLANT",plant);

        RowMapper<OperationResponse> operationResponseRowMapper = (rs, rowNum) -> {
            return OperationResponse.builder()
                    .operation(rs.getString("OPERATION"))
                    .description(rs.getString("OPERATION_DESC"))
                    .build();


        };
        return namedParameterJdbcTemplate.query(sb.toString(), sqlParameterSource, operationResponseRowMapper);
    }

    public List<OperationResponse> getOperationList(String plant) {
        StringBuilder sb = new StringBuilder();
        sb.append(" SELECT GET_OPERATION_DESC (PLANT, OPERATION) AS OPERATION_DESC, OPERATION ");
        sb.append("     FROM ADM_OPERATION                                                    ");
        sb.append("     WHERE PLANT = :plant                                                  ");
        sb.append(" ORDER BY OPERATION DESC                                                   ");


        SqlParameterSource sqlParameterSource = new MapSqlParameterSource().addValue("plant",plant);

        RowMapper<OperationResponse> operationResponseRowMapper = (rs, rowNum) -> {
            return OperationResponse.builder()
                    .operation(rs.getString("OPERATION"))
                    .description(rs.getString("OPERATION_DESC"))
                    .build();


        };
        return namedParameterJdbcTemplate.query(sb.toString(), sqlParameterSource, operationResponseRowMapper);
    }
}
