import { TestBed } from '@angular/core/testing';

import { EndpointsChatService } from './endpoints-chat.service';

describe('EndpointsChatService', () => {
  let service: EndpointsChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndpointsChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getChatMentionList', () => {
    expect(service.getChatMentionList()).toContain(`/mention-user-list`);
  });
});
