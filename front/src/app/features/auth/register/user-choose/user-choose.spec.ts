import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserChoose } from './user-choose';

describe('UserChoose', () => {
  let component: UserChoose;
  let fixture: ComponentFixture<UserChoose>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserChoose],
    }).compileComponents();

    fixture = TestBed.createComponent(UserChoose);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
