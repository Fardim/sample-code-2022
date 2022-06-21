
import { AddressDTO } from './address.model';

export class OrganizationDetailsDTO {
  address: AddressDTO;
  billingEmail: string;
  companyName: string;
  contactNumber: string;
  industry: string;
  logo: string;
  website: string;
  userAuth: UserAuth | null;
  id: string;
  mappedRegionId: string;
  link: string;
}
export class Organizations {
  organizations: OrganizationDetailsDTO[];
}

export class UserAuth {
  email: string;
  failedLoginAttempts = 0;
  hasAdminAccess = true;
  isServiceAccount = true;
  status = 'ACTIVE';
  userId: string;
}
