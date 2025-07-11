import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VocabularyAdd } from './vocabulary-add';

describe('VocabularyAdd', () => {
  let component: VocabularyAdd;
  let fixture: ComponentFixture<VocabularyAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VocabularyAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VocabularyAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
