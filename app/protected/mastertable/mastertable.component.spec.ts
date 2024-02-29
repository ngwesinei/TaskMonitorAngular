import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MastertableComponent } from './mastertable.component';

describe('MastertableComponent', () => {
  let component: MastertableComponent;
  let fixture: ComponentFixture<MastertableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MastertableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MastertableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
