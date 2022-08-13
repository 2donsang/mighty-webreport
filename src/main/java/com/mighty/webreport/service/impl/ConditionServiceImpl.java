package com.mighty.webreport.service.impl;

import com.mighty.webreport.domain.dto.*;
import com.mighty.webreport.domain.entity.admin.Customer;
import com.mighty.webreport.domain.entity.admin.Operation;
import com.mighty.webreport.repository.jdbcrepository.ConditionJDBCRepository;
import com.mighty.webreport.repository.jdbcrepository.JDBCExampleRepository;
import com.mighty.webreport.repository.jparepository.CustomerRepository;
import com.mighty.webreport.repository.jparepository.OperationRepository;
import com.mighty.webreport.repository.querydsl.DeviceRepositoryCustom;
import com.mighty.webreport.service.ConditionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConditionServiceImpl implements ConditionService {

    private final CustomerRepository customerRepository;

    private final OperationRepository operationRepository;

    private final DeviceRepositoryCustom deviceRepositoryCustom;

    private final JDBCExampleRepository jdbcExampleRepository;

    private final ConditionJDBCRepository conditionJDBCRepository;

    @Override
    @Transactional(readOnly = true)
    public void getCustomers(HashMap<String, Object> hashMap, String plant) {
        List<Customer> customers = customerRepository.findAllByPlant(plant);
        List<CustomerDto> customerDtoS = new ArrayList<>();
        for(Customer customer : customers ) {
            customerDtoS.add(customer.toDTO());
        }
        hashMap.put("customers",customerDtoS);
    }

    @Override
    @Transactional(readOnly = true)
    public void getOperations(HashMap<String, Object> hashMap, String plant) {
        List<OperationResponse> operations = operationRepository.getOperationList(plant);
        hashMap.put("operations",operations);
    }

    @Override
    @Transactional(readOnly = true)
    public void getDevices(HashMap<String, Object> hashMap, String plant) {
        List<DeviceResponse> devices = deviceRepositoryCustom.getDevice(plant);
        hashMap.put("devices",devices);
    }

    @Override
    @Transactional(readOnly = true)
    public void getDevicesWithCustomers(HashMap<String, Object> hashMap, String plant) {
        List<DeviceResponse> devices = deviceRepositoryCustom.getDeviceWithCustomers(plant);
        hashMap.put("devices",devices);
    }

    @Override
    @Transactional(readOnly = true)
    public void getLotNumbers(HashMap<String, Object> hashMap, String plant) {
        List<LotNumberResponse> lotNumbers =conditionJDBCRepository.getLotNumbers(plant);
        hashMap.put("lotNumbers",lotNumbers);
    }
    @Override
    public void getOperationsNew(HashMap<String, Object> hashMap, String plant) {
        List<OperationResponse> operations = conditionJDBCRepository.getOperationList(plant);
        hashMap.put("operations",operations);
    }

    @Override
    public void getAVIOperations(HashMap<String, Object> hashMap, String plant) {
        List<OperationResponse> operations = conditionJDBCRepository.getAVIOperationList(plant);
        hashMap.put("operations",operations);
    }

    @Override
    public void getProbeOperations(HashMap<String, Object> hashMap, String plant) {
        List<OperationResponse> operations = conditionJDBCRepository.getProbeOperationList(plant);
        hashMap.put("operations",operations);
    }

}
