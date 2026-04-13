package com.example.medicalrecordservice.messaging;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MedicalRecordEvent {
    private String eventType;
    private String recordId;
    private String patientId;
    private String patientEmail;
    private String bloodGroup;
    private String alzheimerStage;
    private String occurredAt;
}
