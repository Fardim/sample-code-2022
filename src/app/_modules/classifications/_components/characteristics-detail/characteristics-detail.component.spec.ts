import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacteristicsDetailComponent } from './characteristics-detail.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';

describe('CharacteristicsDetailComponent', () => {
  let component: CharacteristicsDetailComponent;
  let fixture: ComponentFixture<CharacteristicsDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CharacteristicsDetailComponent],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacteristicsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('setSelectedType', () => {
    component.setSelectedType('TEXT');
    expect(component.selectedType).toEqual('TEXT');
  });

  it('setSelectedDimension', () => {
    const dto = {
      uuid: '1',
      description: 'string',
      values: [],
    }
    component.setSelectedDimension(dto);
    expect(component.selectedDimension.uuid).toEqual('1');
  })
});
