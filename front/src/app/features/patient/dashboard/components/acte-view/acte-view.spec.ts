import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActeView } from './acte-view';

describe('ActeView', () => {
  let component: ActeView;
  let fixture: ComponentFixture<ActeView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActeView],
    }).compileComponents();

    fixture = TestBed.createComponent(ActeView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
