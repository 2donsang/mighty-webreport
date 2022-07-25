package com.mighty.webreport.repository.jdbcrepository.Impl;

import com.mighty.webreport.domain.dto.LotNumberResponse;
import com.mighty.webreport.domain.dto.MenuResponse;
import com.mighty.webreport.repository.jdbcrepository.MenuJDBCRepositoryCustom;
import com.querydsl.core.types.QMap;
import com.sun.org.apache.xpath.internal.objects.XString;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class MenuJDBCRepositoryImpl implements MenuJDBCRepositoryCustom {

    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    @Override
    public List<MenuResponse> getMenu(String plant) {

        String webreport = "WEBREPORT";

        StringBuilder sb = new StringBuilder();
        sb.append("   SELECT MENU_ID,                                                          ");
        sb.append("          CASE WHEN B.ACTION_SEQ IS NOT NULL THEN 'Y' ELSE 'N' END          ");
        sb.append("              AS ACTION_SEQ,                                                   ");
        sb.append("          CASE                                                              ");
        sb.append("              WHEN B.ACTION_SEQ IS NOT NULL AND A.MENU_NAME_KOR IS NULL     ");
        sb.append("              THEN                                                          ");
        sb.append("                  B.ACTION_NAME_KOR                                         ");
        sb.append("              ELSE                                                          ");
        sb.append("                  A.MENU_NAME_KOR                                           ");
        sb.append("          END                                                               ");
        sb.append("              AS MENU_NAME_KOR,                                                ");
        sb.append("          CASE                                                              ");
        sb.append("              WHEN B.ACTION_SEQ IS NOT NULL AND A.MENU_NAME_ENG IS NULL     ");
        sb.append("              THEN                                                          ");
        sb.append("                  B.ACTION_NAME_ENG                                         ");
        sb.append("              ELSE                                                          ");
        sb.append("                  A.MENU_NAME_ENG                                           ");
        sb.append("          END                                                               ");
        sb.append("              AS MENU_NAME_ENG,                                                ");
        sb.append("          A.HAS_CHILD,                                                      ");
        sb.append("          A.PARENT_KEY,                                                     ");
        sb.append("          A.DISPLAY_DEPTH,                                                  ");
        sb.append("          B.ACTION_SEQ,                                                     ");
        sb.append("          B.ACTION                                                          ");
        sb.append("     FROM SYS_MENU_STRUCTURE A, SYS_MENU_ACTION B                           ");
        sb.append("    WHERE     A.ACTION_SEQ = B.ACTION_SEQ(+)                                ");
        sb.append("          AND A.PLANT = 'SAWNICS'                                           ");
        sb.append("          AND A.MODULE_ID = :web_report                                      ");
        sb.append("          AND A.VISIBLE_FLAG = 'Y'                                           ");
        sb.append("          AND A.ENABLE_FLAG ='Y'                                             ");
        sb.append(" ORDER BY A.MENU_ID                                                         ");


        /*Map<String,String> map = new HashMap<String,String>();
        map.put(plant,plant);
        map.put(webreport,webreport);

        SqlParameterSource sqlParameterSource = new MapSqlParameterSource(map);*/

        SqlParameterSource namedParameters = new MapSqlParameterSource("web_report", webreport);


        RowMapper<MenuResponse> lotNumberResponseRowMapper = (rs, rowNum) -> {
             return MenuResponse.builder()
                     .menuId(rs.getString("menu_id"))
                     .isActionMenu(rs.getString("action_seq"))
                     .menuNameKor(rs.getString("menu_name_kor"))
                     .menuNameEng(rs.getString("menu_name_eng"))
                     .hasChild(rs.getString("has_child").charAt(0))
                     .parentKey(rs.getString("parent_key"))
                     .displayDepth(rs.getInt("display_depth"))
                     .actionSeq(Integer.getInteger(rs.getString("action_seq")))
                     .action(rs.getString("action"))
                     .build();
        };

        return namedParameterJdbcTemplate.query(sb.toString(), namedParameters, lotNumberResponseRowMapper );
    }
}
