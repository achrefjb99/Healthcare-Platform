import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { ReportsComponent } from './reports.component';
import { MedicalFolderService } from '../../../medical-folder/services/medical-folder.service';
import { UserService } from '../../../../core/services/user.service';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportsComponent],
      imports: [CommonModule, FormsModule],
      providers: [
        {
          provide: MedicalFolderService,
          useValue: {
            getAllMedicalRecords: () => of([]),
            getReports: () => of([]),
          },
        },
        {
          provide: UserService,
          useValue: {
            getPatients: () => of([]),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
