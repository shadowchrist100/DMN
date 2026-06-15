import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilEdit } from './profil-edit';

describe('ProfilEdit', () => {
  let component: ProfilEdit;
  let fixture: ComponentFixture<ProfilEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
