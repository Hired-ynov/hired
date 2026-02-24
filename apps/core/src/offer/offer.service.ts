import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OfferEntity } from '@repo/entities';
import { BaseService } from '@repo/nest-service';
import { Repository } from 'typeorm';
import { UserService } from '../users/user.service';
import { CompanyService } from '../company/company.service';

@Injectable()
export class OfferService extends BaseService<OfferEntity> {
  constructor(
    @InjectRepository(OfferEntity)
    private offerRepository: Repository<OfferEntity>,
  ) {
    super(offerRepository);
  }
}
