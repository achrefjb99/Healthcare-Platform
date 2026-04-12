import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { Patient, UserService } from '../../../../core/services/user.service';
import {
  AssessmentReport,
  MedicalRecordResponse,
} from '../../../medical-folder/interfaces/medical-folder';
import { MedicalFolderService } from '../../../medical-folder/services/medical-folder.service';

interface AdminReportRow extends AssessmentReport {
  patientId: string;
  patientName: string;
  patientEmail: string;
  recordId: string;
  recordArchived: boolean;
  needsAttention: boolean;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit {
  reports: AdminReportRow[] = [];
  visibleReports: AdminReportRow[] = [];

  isLoading = false;
  errorMessage = '';
  query = '';
  stageFilter = '';
  alertsOnly = false;

  constructor(
    private readonly medicalFolderService: MedicalFolderService,
    private readonly userService: UserService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  get totalReports(): number {
    return this.reports.length;
  }

  get totalPatients(): number {
    return new Set(this.reports.map((report) => report.patientId)).size;
  }

  get alertReportsCount(): number {
    return this.reports.filter((report) => report.needsAttention).length;
  }

  get archivedReportsCount(): number {
    return this.reports.filter((report) => report.recordArchived).length;
  }

  onQueryChange(value: string): void {
    this.query = value;
    this.applyFilters();
  }

  onStageChange(value: string): void {
    this.stageFilter = value;
    this.applyFilters();
  }

  toggleAlertsOnly(): void {
    this.alertsOnly = !this.alertsOnly;
    this.applyFilters();
  }

  openRecord(report: AdminReportRow): void {
    void this.router.navigate(['/medical-folder', report.recordId]);
  }

  private loadReports(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      records: this.medicalFolderService.getAllMedicalRecords(),
      patients: this.userService.getPatients().pipe(catchError(() => of([] as Patient[]))),
    }).subscribe({
      next: ({ records, patients }) => {
        if (!records.length) {
          this.reports = [];
          this.visibleReports = [];
          this.isLoading = false;
          return;
        }

        const patientMap = new Map(patients.map((patient) => [patient.userId, patient]));
        const reportRequests = records.map((record) =>
          this.medicalFolderService.getReports(record.id).pipe(
            catchError(() => of([] as AssessmentReport[])),
          ),
        );

        forkJoin(reportRequests).subscribe({
          next: (reportGroups) => {
            this.reports = this.buildReportRows(records, reportGroups, patientMap);
            this.applyFilters();
            this.isLoading = false;
          },
          error: (error) => {
            this.errorMessage = this.extractErrorMessage(
              error,
              'Impossible de charger la liste des rapports medicaux.',
            );
            this.isLoading = false;
          },
        });
      },
      error: (error) => {
        this.errorMessage = this.extractErrorMessage(
          error,
          'Impossible de charger le contexte des dossiers medicaux.',
        );
        this.isLoading = false;
      },
    });
  }

  private buildReportRows(
    records: MedicalRecordResponse[],
    reportGroups: AssessmentReport[][],
    patientMap: Map<string, Patient>,
  ): AdminReportRow[] {
    return records
      .flatMap((record, index) =>
        reportGroups[index].map((report) => {
          const patient = patientMap.get(record.patientId);
          const numericScore = Number(report.score);
          const needsAttention =
            report.stage === 'LATE' || (!Number.isNaN(numericScore) && numericScore < 40);

          return {
            ...report,
            patientId: record.patientId,
            patientName: patient?.name || record.patientId,
            patientEmail: patient?.email || '',
            recordId: record.id,
            recordArchived: !!record.archived,
            needsAttention,
          };
        }),
      )
      .sort((a, b) =>
        `${b.assessmentDate}-${b.createdAt ?? ''}`.localeCompare(`${a.assessmentDate}-${a.createdAt ?? ''}`),
      );
  }

  private applyFilters(): void {
    const normalizedQuery = this.query.trim().toLowerCase();

    this.visibleReports = this.reports.filter((report) => {
      if (this.alertsOnly && !report.needsAttention) {
        return false;
      }

      if (this.stageFilter && report.stage !== this.stageFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        report.patientName,
        report.patientEmail,
        report.patientId,
        report.reportType,
        report.stage,
        report.recommendation,
        report.summary,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }

  private extractErrorMessage(error: unknown, fallbackMessage: string): string {
    const backendError = error as {
      error?: { message?: string } | string;
      message?: string;
    };

    if (typeof backendError.error === 'string' && backendError.error.trim()) {
      return backendError.error;
    }

    if (backendError.error && typeof backendError.error !== 'string' && backendError.error.message) {
      return backendError.error.message;
    }

    return backendError.message || fallbackMessage;
  }
}
