import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSetListComponent } from './dataset-list.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatMenuModule } from '@angular/material/menu';
import { SharedModule } from '../../../../../_modules/shared/shared.module';

describe('DataSetListComponent', () => {
  let component: DataSetListComponent;
  let fixture: ComponentFixture<DataSetListComponent>;

  const mockMatDialogOpen = {
    open: jasmine.createSpy('open')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DataSetListComponent],
      imports: [MdoUiLibraryModule, HttpClientTestingModule, MatMenuModule, SharedModule],
      providers: [
        {
          provide: MatDialog,
          useValue: mockMatDialogOpen
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSetListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});