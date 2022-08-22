package com.mighty.webreport.service.impl;

import com.mighty.webreport.domain.dto.AuthenticationDto;
import com.mighty.webreport.domain.dto.MenuResponse;
import com.mighty.webreport.domain.entity.admin.AuthorityRole;
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
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
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

        //메뉴 그룹 잘못 가져오는 것을 수정함.(권한그룹이 아닌 해당 권한그룹의 메뉴권한으로)
        //groupId를 member의 rolID가 아닌 ADM_AUTHORITY_ROLE테이블에서 ROL_ID =member.getRole()인 MES_MENU_GROUP으로 넣도록 수정 2022.08.16 by 2donsang
        String mesMenugroup = menuJDBCRepositoryCustom.getMenuGroup(accountContext.getPlant(), member.getRole());
        String moduleId = "WEBREPORT";
        MenuGroup menuGroup = menuGroupRepository.findById(MenuGroupId.builder()
                //.groupId(member.getRole())
                .groupId(mesMenugroup)
                .plant(member.getPlant())
                .moduleId(moduleId)
                .build())
                .orElse(null);

        if(menuGroup==null){
            hashMap.put("isAuth",false);
            return hashMap;
        }

//        List<MenuResponse> menus = setMenuDepth(menuRepositoryCustom.getMenu(accountContext.getPlant()));
        List<MenuResponse> menus = setMenuDepth(menuJDBCRepositoryCustom.getMenu((accountContext.getPlant()), moduleId, mesMenugroup));
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

                // 처음 시작에서 CHILD 레벨의 메뉴가 먼저 나타나는 경우 패스(자식 메뉴가 리스트에 있어도 상위메뉴가 Hide 처리되면 패스)
                //쿼리가  권한으로 조회되면서 사실상 필요없는 로직..2022.08.16 by 2donsang
                if(newMenus.size() ==0) {
                    continue;
                }
                //부모메뉴의 MenuId(01)와 자식메뉴의 MenuID(ex 01-01) 앞 2자리 비교해서 일치하는것 그 자식으로 Add
                if(menus.get(i).getMenuId().substring(0,2).equals(newMenus.get(newMenus.size()-1).getMenuId())){
                    newMenus.get(newMenus.size()-1).getChild().add(menus.get(i));
                }
            }
        }
        return newMenus;
    }
}
