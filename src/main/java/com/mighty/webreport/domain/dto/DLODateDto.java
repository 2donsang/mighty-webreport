package com.mighty.webreport.domain.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class DLODateDto {

    private DateDto dates;
    private List<IdTextDto> devices;

    private List<IdTextDto> lotNumbers;

    private List<IdTextDto> operations;

    private Boolean checkBoxOne;

    private String inputTextOne;

    public String getDevicesString(){
        if(devices.size()==0){
            return "";
        }
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < devices.size(); i++) {
                sb.append("'");
                sb.append(devices.get(i).getId());
                if(i == devices.size()-1){
                    sb.append("' ");
                }else {
                    sb.append("' ,");
                }
            }
        return sb.toString();
    }

    public String getLotNumbersString(){
        if(lotNumbers.size() == 0)
        {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < lotNumbers.size(); i++) {
            sb.append("'");
            sb.append(lotNumbers.get(i).getId());
            if(lotNumbers.size()-1 == i){
                sb.append("' ");
            }else{
                sb.append("',");
            }
        }
        return sb.toString();
    }

    public String getOperationsString(){
        if(operations == null || operations.size() ==0){
            return "";
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < operations.size(); i++) {
            sb.append("'");
            sb.append(operations.get(i).getId());
            if(operations.size()-1 ==i){
                sb.append("'");
            }else{
                sb.append("' ,");
            }
        }
        return sb.toString();
    }

}
