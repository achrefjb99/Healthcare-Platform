package everCare.appointments;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

@OpenAPIDefinition(
		info = @Info(
				title = "Appointment Service API",
				version = "v1",
				description = "Appointment booking, availability, consultation type, prescription, and medication endpoints."
		),
		servers = @Server(url = "/EverCare", description = "EverCare API Gateway")
)
@EnableFeignClients
@EnableDiscoveryClient
@EnableScheduling
@SpringBootApplication
public class AppointmentServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AppointmentServiceApplication.class, args);
	}

}
