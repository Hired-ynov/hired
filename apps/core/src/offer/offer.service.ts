import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OfferEntity } from '@repo/entities';
import { BaseService } from '@repo/nest-service';
import { Repository } from 'typeorm';

@Injectable()
export class OfferService extends BaseService<OfferEntity> {
  constructor(
    @InjectRepository(OfferEntity)
    private readonly offerRepository: Repository<OfferEntity>,
  ) {
    super(offerRepository);
  }
}
