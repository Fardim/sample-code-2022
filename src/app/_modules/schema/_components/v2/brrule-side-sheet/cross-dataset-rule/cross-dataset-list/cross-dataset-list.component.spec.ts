import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossDatasetListComponent } from './cross-dataset-list.component';

describe('CrossDatasetListComponent', () => {
  let component: CrossDatasetListComponent;
  let fixture: ComponentFixture<CrossDatasetListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrossDatasetListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrossDatasetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
