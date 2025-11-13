import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UpdateRoomModalComponent } from "./update-room-modal.component";

describe("UpdateRoomModalComponent", () => {
  let component: UpdateRoomModalComponent;
  let fixture: ComponentFixture<UpdateRoomModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateRoomModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateRoomModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
