package tn.esprit.dailymeservice;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@OpenAPIDefinition(
        info = @Info(
                title = "DailyMe Service API",
                version = "v1",
                description = "Daily entries, tasks, alerts, journal, and patient insight endpoints."
        ),
        servers = @Server(url = "/", description = "EverCare API Gateway")
)
@SpringBootApplication
@EnableDiscoveryClient
public class DailymeServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DailymeServiceApplication.class, args);
    }
}
