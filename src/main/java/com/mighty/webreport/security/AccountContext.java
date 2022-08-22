package com.mighty.webreport.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mighty.webreport.domain.entity.admin.AuthorityRole;
import com.mighty.webreport.domain.entity.admin.Member;
import lombok.EqualsAndHashCode;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@EqualsAndHashCode(of = {"id"})
public class AccountContext implements UserDetails {

    private String id;

    private String name;

    private String plant;

    @JsonIgnore
    private String password;

    private Collection<? extends  GrantedAuthority> authorities;

    private Member member;

    public AccountContext(Member member){
        List<GrantedAuthority> authorityList = new ArrayList<>();
        authorityList.add(new SimpleGrantedAuthority(member.getRole()));

        this.id = member.getUserId();
        this.name = member.getUserName();
        this.plant = member.getPlant();
        this.password = member.getPasswordMD5();
        this.authorities = authorityList;
        this.member = member;

    }

    public void setPlant(String plant) {
        this.plant = plant;
    }

    public String getId(){
        return this.id;
    }

    public String getPlant() { return this.plant; }

    public Member getMember() { return this.member; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return this.authorities;
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.name;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
