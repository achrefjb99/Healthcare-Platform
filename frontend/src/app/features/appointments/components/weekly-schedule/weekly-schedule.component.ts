import { Component, EventEmitter, Input, Output, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ConsultationType } from '../../models/consultation-type.model';
import { AvailabilityService } from '../../services/availability.service';

export interface TimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  available: boolean;
  selected: boolean;
  type?: ConsultationType;
}

@Component({
  selector: 'app-weekly-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl:"weekly-schedule.component.html"
})
export class WeeklyScheduleComponent implements OnInit {
  @Input() doctorId: string | null = null;
  @Input() consultationTypes: ConsultationType[] = [];
  @Input() consultationDurationMinutes = 20;
  @Output() slotSelected = new EventEmitter<any>();

  currentDate: Date = new Date();
  weekDays: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  weekDates: Date[] = [];
  timeSlots: { time: string; slots: any[] }[] = [];
  loading = false;
  errorMessage = '';

  constructor(private availabilityService: AvailabilityService) {}

  ngOnInit() {
    this.generateWeekDates();
    this.loadWeekAvailability();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['doctorId'] || changes['consultationDurationMinutes']) {
      this.clearSelection();
      if (this.weekDates.length === 0) {
        this.generateWeekDates();
      }
      this.loadWeekAvailability();
    }
  }

  get weekStart(): Date {
    return this.weekDates[0];
  }

  get weekEnd(): Date {
    return this.weekDates[6];
  }

  generateWeekDates() {
    const start = new Date(this.currentDate);
    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diff);

    this.weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      this.weekDates.push(date);
    }
  }

  loadWeekAvailability(): void {
    if (!this.doctorId) {
      this.timeSlots = [];
      this.errorMessage = 'Select a doctor to load real availability.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const requests = this.weekDates.map((date) =>
      this.availabilityService.getAvailableTimeSlots(
        this.doctorId!,
        new Date(date),
        this.consultationDurationMinutes
      )
    );

    forkJoin(requests).subscribe({
      next: (slotsByDate) => {
        const normalizedByDate = new Map<string, string[]>();

        this.weekDates.forEach((date, index) => {
          normalizedByDate.set(
            this.formatDateKey(date),
            (slotsByDate[index] || []).map((slot) => this.normalizeTime(slot))
          );
        });

        const uniqueTimes = Array.from(
          new Set(Array.from(normalizedByDate.values()).flat())
        ).sort((a, b) => a.localeCompare(b));

        this.timeSlots = uniqueTimes.map((time) => ({
          time,
          slots: this.weekDates.map((date) => {
            const availableTimes = normalizedByDate.get(this.formatDateKey(date)) || [];
            return {
              id: `${this.formatDateKey(date)}-${time}`,
              date,
              time,
              available: availableTimes.includes(time),
              selected: false
            };
          })
        }));

        if (uniqueTimes.length === 0) {
          this.errorMessage = 'No available slots were found for this doctor and consultation type this week.';
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading weekly availability:', error);
        this.timeSlots = [];
        this.errorMessage = 'Could not load real availability. Please choose another doctor or try again.';
        this.loading = false;
      }
    });
  }

  clearSelection(): void {
    this.timeSlots.forEach((timeSlot) => {
      timeSlot.slots.forEach((slot) => {
        slot.selected = false;
      });
    });
  }

  selectSlot(slot: any) {
    // Deselect previous slot
    if (this.timeSlots) {
      this.timeSlots.forEach(ts => {
        ts.slots.forEach(s => {
          if (s.selected) {
            s.selected = false;
          }
        });
      });
    }

    slot.selected = true;

    this.slotSelected.emit({
      date: slot.date,
      startTime: slot.time,
      endTime: this.calculateEndTime(slot.time)
    });
  }

  calculateEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    let endMinutes = minutes + this.consultationDurationMinutes;
    let endHours = hours;

    if (endMinutes >= 60) {
      endHours += 1;
      endMinutes -= 60;
    }

    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  previousWeek() {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.generateWeekDates();
    this.clearSelection();
    this.loadWeekAvailability();
  }

  nextWeek() {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.generateWeekDates();
    this.clearSelection();
    this.loadWeekAvailability();
  }

  private normalizeTime(time: string): string {
    const [hours = '00', minutes = '00'] = (time || '').split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  private formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
