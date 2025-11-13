import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomInfoModalComponent } from './room-info-modal.component';

describe('RoomInfoModalComponent', () => {
  let component: RoomInfoModalComponent;
  let fixture: ComponentFixture<RoomInfoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomInfoModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomInfoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
