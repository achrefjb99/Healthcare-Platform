package tn.esprit.apigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient

public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }

    @Bean
    public RouteLocator customRouteLocator(
            RouteLocatorBuilder builder,
            @Value("${user.service.base-url:http://localhost:8096}") String userServiceBaseUrl) {
        return builder.routes()
                .route("appointment-service-openapi", r -> r
                        .path("/swagger-docs/appointment")
                        .filters(f -> f.setPath("/EverCare/v3/api-docs"))
                        .uri("lb://APPOINTMENT-SERVICE"))
                .route("activities-service-openapi", r -> r
                        .path("/swagger-docs/activities")
                        .filters(f -> f.setPath("/v3/api-docs"))
                        .uri("lb://ACTIVITIES-SERVICE"))
                .route("blog-service-openapi", r -> r
                        .path("/swagger-docs/blog")
                        .filters(f -> f.setPath("/v3/api-docs"))
                        .uri("lb://BLOG-SERVICE"))
                .route("dailyme-service-openapi", r -> r
                        .path("/swagger-docs/dailyme")
                        .filters(f -> f.setPath("/v3/api-docs"))
                        .uri("lb://DAILYME-SERVICE"))
                .route("medical-record-service-openapi", r -> r
                        .path("/swagger-docs/medical-record")
                        .filters(f -> f.setPath("/v3/api-docs"))
                        .uri("lb://MEDICAL-RECORD-SERVICE"))
                .route("notification-service-openapi", r -> r
                        .path("/swagger-docs/notification")
                        .filters(f -> f.setPath("/v3/api-docs"))
                        .uri("lb://NOTIFICATION-SERVICE"))
                .route("appointment-service", r -> r
                        .path("/EverCare/appointments/**",
                                "/EverCare/availabilities/**",
                                "/EverCare/consultation-types/**",
                                "/EverCare/medicaments/**",
                                "/EverCare/prescriptions/**")
                        .uri("lb://APPOINTMENT-SERVICE"))
                .route("activities-service", r -> r
                        .path("/EverCare/activities/**",
                                "/EverCare/admin/activities/**")
                        .filters(f -> f.rewritePath("/EverCare/(?<segment>.*)", "/${segment}")) // 👈 add this
                        .uri("lb://ACTIVITIES-SERVICE"))
                .route("communication-service", r -> r
                        .path("/api/calls/**",
                                "/api/conversations/**")
                        .uri("lb://COMMUNICATION-SERVICE"))
                .route("user-service", r -> r
                        .path("/EverCare/auth/**",
                                "/EverCare/users/**",
                                "/EverCare/uploads/**")
                        .uri(userServiceBaseUrl))
                .route("medical-record-service", r -> r
                        .path("/api/medical-records/**")
                        .uri("lb://MEDICAL-RECORD-SERVICE"))
                .route("notification-service", r -> r
                        .path("/EverCare/api/notifications",
                                "/EverCare/api/notifications/**",
                                "/EverCare/ws-notifications/**")
                        .filters(f -> f.rewritePath("/EverCare/(?<segment>.*)", "/${segment}")) // 👈 add this
                        .uri("lb://NOTIFICATION-SERVICE"))
                .route("dailyme-service", r -> r
                        .path(
                                "/api/daily-entries/**",
                                "/api/dailyme-alerts/**",
                                "/api/daily-tasks/**",
                                "/api/journal/**",
                                "/api/insights/**",
                                "/dailyme/uploads/**"
                        )
                        .filters(f -> f.rewritePath("/EverCare/(?<segment>.*)", "/${segment}"))
                        .uri("lb://DAILYME-SERVICE"))

                // 1. Route pour le WebSocket (doit être définie avant les routes HTTP générales)
                .route("communication-websocket", r -> r
                        .path("/ws-chat/**")
                        .uri("lb://COMMUNICATION-SERVICE"))
                 .route("communication-service", r -> r
                                         .path("/communication-service/**")
                                         .filters(f -> f.rewritePath("/communication-service/(?<segment>.*)", "/${segment}"))
                                         .uri("lb://COMMUNICATION-SERVICE"))
.route("blog-service", r -> r
            .path("/EverCare/api/blog/**")
            .filters(f -> f.rewritePath("/EverCare/(?<segment>.*)", "/${segment}"))
            .uri("lb://BLOG-SERVICE"))

        .build();
    }








}
