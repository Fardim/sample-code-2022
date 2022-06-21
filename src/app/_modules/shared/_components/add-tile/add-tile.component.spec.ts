import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTileComponent } from './add-tile.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('AddTileComponent', () => {
  let component: AddTileComponent;
  let fixture: ComponentFixture<AddTileComponent>;
  let htmlNative: HTMLElement;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppMaterialModuleForSpec, RouterTestingModule],
      declarations: [ AddTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTileComponent);
    component = fixture.componentInstance;
    htmlNative = fixture.debugElement.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('showAddNewTitle: title should create', () => {
    component.text = 'Add New Schema';
    fixture.detectChanges();
    expect(htmlNative.getElementsByTagName('h3').length).toEqual(1);
    expect(htmlNative.getElementsByTagName('h3').item(0).textContent).toEqual(component.text);
  });
});
