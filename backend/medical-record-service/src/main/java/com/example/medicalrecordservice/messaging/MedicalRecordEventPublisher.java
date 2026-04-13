package com.example.medicalrecordservice.messaging;

import com.example.medicalrecordservice.config.RabbitMqProperties;
import com.example.medicalrecordservice.dto.UserSummaryDto;
import com.example.medicalrecordservice.entity.MedicalRecord;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class MedicalRecordEventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final RabbitMqProperties rabbitMqProperties;

    public void publishCreated(MedicalRecord record, UserSummaryDto patient) {
        publish("MEDICAL_RECORD_CREATED", record, patient != null ? patient.getEmail() : null);
    }

    public void publishUpdated(MedicalRecord record) {
        publish("MEDICAL_RECORD_UPDATED", record, null);
    }

    public void publishDeleted(MedicalRecord record) {
        publish("MEDICAL_RECORD_DELETED", record, null);
    }

    private void publish(String eventType, MedicalRecord record, String patientEmail) {
        MedicalRecordEvent event = MedicalRecordEvent.builder()
                .eventType(eventType)
                .recordId(record.getId())
                .patientId(record.getPatientId())
                .patientEmail(patientEmail)
                .bloodGroup(record.getBloodGroup())
                .alzheimerStage(record.getAlzheimerStage())
                .occurredAt(LocalDateTime.now().toString())
                .build();

        try {
            rabbitTemplate.convertAndSend(
                    rabbitMqProperties.exchange(),
                    rabbitMqProperties.routingKey(),
                    event
            );
            log.info(
                    "Published medical record event {} for patientId {} and recordId {}",
                    eventType,
                    record.getPatientId(),
                    record.getId()
            );
        } catch (Exception ex) {
            log.error(
                    "Failed to publish medical record event {} for patientId {} and recordId {}",
                    eventType,
                    record.getPatientId(),
                    record.getId(),
                    ex
            );
        }
    }
}
