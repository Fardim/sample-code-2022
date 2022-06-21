import { TestBed } from '@angular/core/testing';
import { EndpointsRoleService } from '../_endpoints/endpoints-role.service';

describe('EndpointsRuleService', () => {
    let service: EndpointsRoleService;

    beforeEach(() => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(EndpointsRoleService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });
});
