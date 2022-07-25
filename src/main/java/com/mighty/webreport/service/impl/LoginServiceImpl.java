package com.mighty.webreport.service.impl;

import com.mighty.webreport.domain.dto.AuthenticationDto;
import com.mighty.webreport.domain.dto.MenuResponse;
import com.mighty.webreport.domain.entity.admin.Member;
import com.mighty.webreport.domain.entity.idclass.MenuGroupId;
import com.mighty.webreport.domain.entity.system.MenuGroup;;
import com.mighty.webreport.repository.jdbcrepository.MenuJDBCRepositoryCustom;
import com.mighty.webreport.repository.jparepository.MenuGroupRepository;
import com.mighty.webreport.repository.querydsl.MenuRepositoryCustom;
import com.mighty.webreport.security.AccountContext;
import com.mighty.webreport.security.JwtAuthProvider;
import com.mighty.webreport.service.LoginService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoginServiceImpl implements LoginService {

    private final AuthenticationManager authenticationManager;

    private final JwtAuthProvider provider;

    private final MenuGroupRepository menuGroupRepository;

    private final MenuRepositoryCustom menuRepositoryCustom;

    private final MenuJDBCRepositoryCustom menuJDBCRepositoryCustom;



    @Override
    @Transactional(readOnly = true)
    public HashMap<String,Object> setAuth(AuthenticationDto authenticationDto){
        HashMap<String,Object> hashMap = new HashMap<>();
        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                new UsernamePasswordAuthenticationToken(
                        authenticationDto.getId() + ":" + authenticationDto.getPlant(),
                        authenticationDto.getPassword()
                );

        Authentication authentication = authenticationManager.authenticate(
                usernamePasswordAuthenticationToken
        );

        AccountContext accountContext = (AccountContext) authentication.getPrincipal();
        accountContext.setPlant(authenticationDto.getPlant());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        Member member = accountContext.getMember();

        MenuGroup menuGroup = menuGroupRepository.findById(MenuGroupId.builder()
                .groupId(member.getRole())
                .plant(member.getPlant())
                .moduleId("WEBREPORT")
                .build())
                .orElse(null);

        if(menuGroup==null){
            hashMap.put("isAuth",false);
            return hashMap;
        }

//        List<MenuResponse> menus = setMenuDepth(menuRepositoryCustom.getMenu(accountContext.getPlant()));
        List<MenuResponse> menus = setMenuDepth(menuJDBCRepositoryCustom.getMenu(accountContext.getPlant()));
        String jwt = "Bearer " + provider.createToken(authentication);

        hashMap.put("isAuth",true);
        hashMap.put("menus",menus);
        hashMap.put("token",jwt);
        return hashMap;
    }

    private List<MenuResponse> setMenuDepth(List<MenuResponse> menus){
        List<MenuResponse> newMenus = new ArrayList<>();
        for(int i = 0; i<menus.size();i++){
            if(menus.get(i).getHasChild()=='Y'){
                menus.get(i).setChild(new ArrayList<>());
                newMenus.add(menus.get(i));
            }else{
                //CHILD 레벨의 메뉴가 먼저 노출되는 경우 패스(기준정보에서 상위메뉴만 hide 처리 했을 경우
                if(newMenus.size() ==0) {
                    continue;
                }
                if(menus.get(i).getMenuId().substring(0,2).equals(newMenus.get(newMenus.size()-1).getMenuId())){
                    newMenus.get(newMenus.size()-1).getChild().add(menus.get(i));
                }
            }
        }
        return newMenus;
    }
}
