import { Offer, Company } from '@repo/models';

export interface OfferWithCompany extends Offer {
  company: Company;
}
