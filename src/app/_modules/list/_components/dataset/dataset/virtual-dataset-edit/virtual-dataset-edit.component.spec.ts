import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { VirtualDatasetEditComponent } from './virtual-dataset-edit.component';
import { MatMenuHarness } from '@angular/material/menu/testing';

describe('VirtualDatasetEditComponent', () => {
  let component: VirtualDatasetEditComponent;
  let fixture: ComponentFixture<VirtualDatasetEditComponent>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [VirtualDatasetEditComponent],
      imports: [AppMaterialModuleForSpec, SharedModule],
    });
    fixture = TestBed.createComponent(VirtualDatasetEditComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('can load instance', () => {
    expect(component).toBeTruthy();
  });

  it(`dmlTypes has default value`, () => {
    expect(component.dmlTypes).toEqual([`Join`, `Transformation`]);
  });

  // test scenario: MAL-785-10
  it('should be able to see first join step named Join 1', async () => {
    // const tabButton = fixture.debugElement.query(By.css('.add-tab'));
    // tabButton.triggerEventHandler('click', {});
    // await fixture.whenStable();

    const seriesMenu = await loader.getHarness(MatMenuHarness.with({ selector: '.add-button' }));

    expect(seriesMenu).toBeDefined();

    await seriesMenu.open();

    const items = await seriesMenu.getItems();

    expect(items.length).toBe(2);

    let eventValue;

    component.dmlTypeSelectionChange.subscribe((event) => eventValue = event);

    await items[0]?.click(); // Join 1

    expect(eventValue).toEqual('Join');
  });
});


