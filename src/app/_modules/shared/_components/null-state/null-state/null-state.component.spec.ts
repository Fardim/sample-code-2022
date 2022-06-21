import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { NullStateComponent } from './null-state.component';

describe('NullStateComponent', () => {
  let component: NullStateComponent;
  let fixture: ComponentFixture<NullStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NullStateComponent ],
      imports: [ AppMaterialModuleForSpec ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NullStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
  });

  it('should emit action click', () => {
    spyOn(component.action, 'emit');
    component.emitAction();
    expect(component.action.emit).toHaveBeenCalled()
  });

});
