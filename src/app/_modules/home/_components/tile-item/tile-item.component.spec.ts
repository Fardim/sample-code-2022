import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { TileItemComponent } from './tile-item.component';

describe('TileItemComponent', () => {
  let component: TileItemComponent;
  let fixture: ComponentFixture<TileItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TileItemComponent ],
      imports: [SharedModule, AppMaterialModuleForSpec]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TileItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
