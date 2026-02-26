import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@repo/nest-service';
import { Repository } from 'typeorm';
import { OfferEntity } from '@repo/entities';

@Injectable()
export class OfferService extends BaseService<OfferEntity> {
  constructor(
    @InjectRepository(OfferEntity)
    private offerRepository: Repository<OfferEntity>,
  ) {
    super(offerRepository);
  }
}
