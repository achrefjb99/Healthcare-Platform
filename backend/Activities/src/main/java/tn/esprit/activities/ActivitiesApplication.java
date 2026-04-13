package tn.esprit.activities;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@OpenAPIDefinition(
		info = @Info(
				title = "Activities Service API",
				version = "v1",
				description = "Activities, recommendations, and back-office activity management endpoints."
		),
		servers = @Server(url = "/EverCare", description = "EverCare API Gateway")
)
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class ActivitiesApplication {

	public static void main(String[] args) {
		SpringApplication.run(ActivitiesApplication.class, args);
	}

}
