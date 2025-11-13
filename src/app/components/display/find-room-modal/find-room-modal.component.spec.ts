import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FindRoomModalComponent } from "./find-room-modal.component";

describe("FindRoomModalComponent", () => {
  let component: FindRoomModalComponent;
  let fixture: ComponentFixture<FindRoomModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FindRoomModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FindRoomModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
