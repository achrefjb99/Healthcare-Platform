package tn.esprit.notification;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@OpenAPIDefinition(
		info = @Info(
				title = "Notification Service API",
				version = "v1",
				description = "Notification delivery and websocket notification endpoints."
		),
		servers = @Server(url = "/EverCare", description = "EverCare API Gateway")
)
@SpringBootApplication
@EnableDiscoveryClient  // Registers this service with Eureka
public class NotificationServiceApplication {
	public static void main(String[] args) {
		SpringApplication.run(NotificationServiceApplication.class, args);
	}
}
