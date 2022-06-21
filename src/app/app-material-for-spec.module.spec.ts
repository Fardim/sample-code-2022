import { AppMaterialModuleForSpec } from './app-material-for-spec.module';

describe('AppMaterialModuleForSpec', () => {
  let appMaterialModuleForSpec: AppMaterialModuleForSpec;

  beforeEach(() => {
    appMaterialModuleForSpec = new AppMaterialModuleForSpec();
  });

  it('should create an instance', () => {
    expect(appMaterialModuleForSpec).toBeTruthy();
  });
});
