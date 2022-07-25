package com.mighty.webreport.repository.jdbcrepository;

import com.mighty.webreport.domain.dto.MenuResponse;
import org.springframework.stereotype.Repository;

import java.util.List;


public interface MenuJDBCRepositoryCustom {

    public List<MenuResponse> getMenu(String plant);
}
