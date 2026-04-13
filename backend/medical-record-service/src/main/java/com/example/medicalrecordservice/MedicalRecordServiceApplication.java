package com.example.medicalrecordservice;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@OpenAPIDefinition(
        info = @Info(
                title = "Medical Record Service API",
                version = "v1",
                description = "Medical records, histories, reports, and medical document endpoints."
        ),
        servers = @Server(url = "/", description = "EverCare API Gateway")
)
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class MedicalRecordServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MedicalRecordServiceApplication.class, args);
    }

}
