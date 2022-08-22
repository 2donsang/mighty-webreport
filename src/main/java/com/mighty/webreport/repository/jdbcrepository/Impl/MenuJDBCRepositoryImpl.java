package com.mighty.webreport.repository.jdbcrepository.Impl;

import com.mighty.webreport.domain.dto.MenuResponse;
import com.mighty.webreport.repository.jdbcrepository.MenuJDBCRepositoryCustom;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class MenuJDBCRepositoryImpl implements MenuJDBCRepositoryCustom {

    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    @Override
    public List<MenuResponse> getMenu(String plant, String module_id, String menu_role)  {

        String webreport = "WEBREPORT";

        StringBuilder sb = new StringBuilder();
        //region 권한적용 안한 쿼리
//        sb.append("   SELECT MENU_ID,                                                          ");
//        sb.append("          CASE WHEN B.ACTION_SEQ IS NOT NULL THEN 'Y' ELSE 'N' END          ");
//        sb.append("              AS ACTION_SEQ,                                                   ");
//        sb.append("          CASE                                                              ");
//        sb.append("              WHEN B.ACTION_SEQ IS NOT NULL AND A.MENU_NAME_KOR IS NULL     ");
//        sb.append("              THEN                                                          ");
//        sb.append("                  B.ACTION_NAME_KOR                                         ");
//        sb.append("              ELSE                                                          ");
//        sb.append("                  A.MENU_NAME_KOR                                           ");
//        sb.append("          END                                                               ");
//        sb.append("              AS MENU_NAME_KOR,                                                ");
//        sb.append("          CASE                                                              ");
//        sb.append("              WHEN B.ACTION_SEQ IS NOT NULL AND A.MENU_NAME_ENG IS NULL     ");
//        sb.append("              THEN                                                          ");
//        sb.append("                  B.ACTION_NAME_ENG                                         ");
//        sb.append("              ELSE                                                          ");
//        sb.append("                  A.MENU_NAME_ENG                                           ");
//        sb.append("          END                                                               ");
//        sb.append("              AS MENU_NAME_ENG,                                                ");
//        sb.append("          A.HAS_CHILD,                                                      ");
//        sb.append("          A.PARENT_KEY,                                                     ");
//        sb.append("          A.DISPLAY_DEPTH,                                                  ");
//        sb.append("          B.ACTION_SEQ,                                                     ");
//        sb.append("          B.ACTION                                                          ");
//        sb.append("     FROM SYS_MENU_STRUCTURE A, SYS_MENU_ACTION B                           ");
//        sb.append("    WHERE     A.ACTION_SEQ = B.ACTION_SEQ(+)                                ");
//        sb.append("          AND A.PLANT = 'SAWNICS'                                           ");
//        sb.append("          AND A.MODULE_ID = :web_report                                      ");
//        sb.append("          AND A.VISIBLE_FLAG = 'Y'                                           ");
//        sb.append("          AND A.ENABLE_FLAG ='Y'                                             ");
//        sb.append(" ORDER BY A.MENU_ID                                                         ");
    //endregion

//      권한으로 메뉴 조회되도록 수정 2022.08.16 by 2donsang
        sb.append("  SELECT 'N'                                                                 ");
        sb.append("             AS SELECTOPER,                                                  ");
        sb.append("         B.PLANT,                                                            ");
        sb.append("         B.MENU_ID,                                                          ");
        sb.append("         CASE WHEN C.ACTION_SEQ IS NOT NULL THEN 'Y' ELSE 'N' END            ");
        sb.append("             AS ACTION_SEQ,                                                  ");
        sb.append("         CASE                                                                ");
        sb.append("             WHEN C.ACTION_SEQ IS NOT NULL AND B.MENU_NAME_KOR IS NULL       ");
        sb.append("             THEN                                                            ");
        sb.append("                 C.ACTION_NAME_KOR                                           ");
        sb.append("             ELSE                                                            ");
        sb.append("                 B.MENU_NAME_KOR                                             ");
        sb.append("         END                                                                 ");
        sb.append("             AS MENU_NAME_KOR,                                               ");
        sb.append("         CASE                                                                ");
        sb.append("             WHEN C.ACTION_SEQ IS NOT NULL AND B.MENU_NAME_ENG IS NULL       ");
        sb.append("             THEN                                                            ");
        sb.append("                 C.ACTION_NAME_ENG                                           ");
        sb.append("             ELSE                                                            ");
        sb.append("                 B.MENU_NAME_ENG                                             ");
        sb.append("         END                                                                 ");
        sb.append("             AS MENU_NAME_ENG,                                               ");
        sb.append("         B.HAS_CHILD,                                                        ");
        sb.append("         B.PARENT_KEY,                                                       ");
        sb.append("         B.DISPLAY_DEPTH,                                                    ");
        sb.append("         C.ACTION_SEQ,                                                       ");
        sb.append("         C.ACTION                                                            ");
        sb.append("    FROM (SELECT ROLE,                                                       ");
        sb.append("                 ROLE_DESC,                                                  ");
        sb.append("                 ROLE_TYPE,                                                  ");
        sb.append("                 PLANT,                                                      ");
        sb.append("                 ROLE_ITEM_SEQ,                                              ");
        sb.append("                 ROLE_ITEM_DESC,                                             ");
        sb.append("                 MODULE_ID                                                   ");
        sb.append("            FROM V$MENU_AUTHORITY                                            ");
        sb.append("           WHERE ROLE = :menu_role) A,                                       ");
        sb.append("         SYS_MENU_STRUCTURE B,                                               ");
        sb.append("         SYS_MENU_ACTION   C                                                 ");
        sb.append("   WHERE     B.PLANT = :plant                                                ");
        sb.append("         AND B.MODULE_ID = :module_id                                        ");
        sb.append("         AND B.MODULE_ID = A.MODULE_ID                                       ");
        sb.append("         AND B.PLANT = A.PLANT                                               ");
        sb.append("         AND B.GROUP_ID = 'SYS_COMMON'                                       ");
        sb.append("         AND B.MENU_ID = A.ROLE_ITEM_SEQ                                     ");
        sb.append("         AND B.ACTION_SEQ = C.ACTION_SEQ(+)                                  ");
        sb.append("         AND B.VISIBLE_FLAG = 'Y'                                            ");
        sb.append("         AND B.ENABLE_FLAG ='Y'                                              ");
        sb.append("ORDER BY MENU_ID                                                             ");

        SqlParameterSource namedParameters = new MapSqlParameterSource()
                .addValue("plant",plant)
                .addValue("menu_role",menu_role)
                .addValue("module_id",module_id);


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

    @Override
    public String getMenuGroup(String plant, String roleId) {

        StringBuilder sb = new StringBuilder(new String());
        sb.append(" SELECT *                                    ");
        sb.append(" FROM ADM_AUTHORITY_ROLE                     ");
        sb.append(" WHERE PLANT = :plant AND ROLE_ID = :roloId  ");

        SqlParameterSource sqlParameterSource = new MapSqlParameterSource()
                .addValue("plant",plant)
                .addValue("roloId", roleId);


        List<Map<String,Object>> menuIdList = namedParameterJdbcTemplate.queryForList(sb.toString(),sqlParameterSource);
        return menuIdList.get(0).get("mes_menu_group").toString();
    }
}
