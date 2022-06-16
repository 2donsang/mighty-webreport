package com.mighty.webreport.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Setter @Getter
@NoArgsConstructor
@AllArgsConstructor
public class ODLDateDto {

    private DateDto dates;

    private List<IdTextDto> operations;

    private List<IdTextDto> devices;

    private List<IdTextDto> lotNumbers;

    public String getLotNumbersString(){
        if(lotNumbers.size()==0){
            return "";
        }
        StringBuilder sb = new StringBuilder();
        for(int i=0; i<lotNumbers.size(); i++){
            sb.append("'");
            sb.append(lotNumbers.get(i).getId());
            if(i==lotNumbers.size()-1){
                sb.append("' ");
            }else {
                sb.append("' ,");
            }
        }
        return sb.toString();
    }

    public String getOperationsString(){
        if(operations.size()==0){
            return "";
        }
        StringBuilder sb = new StringBuilder();
        for(int i=0; i<operations.size(); i++){
            sb.append("'");
            sb.append(operations.get(i).getId());
            if(i==operations.size()-1){
                sb.append("' ");
            }else {
                sb.append("' ,");
            }
        }
        return sb.toString();
    }

    public String getDevicesString(){
        if(devices.size()==0){
            return "";
        }
        StringBuilder sb = new StringBuilder();
        for(int i=0; i<devices.size(); i++){
            sb.append("'");
            sb.append(devices.get(i).getId());
            if(i==devices.size()-1){
                sb.append("' ");
            }else {
                sb.append("' ,");
            }
        }
        return sb.toString();
    }
}
