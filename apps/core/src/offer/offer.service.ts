import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Company,
  Offer,
  User,
  UserDTO,
  OfferDTO,
  UpdateOfferDTO,
} from '@repo/models';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { CompanyEntity } from '../company/entities/company.entity';
import { OfferEntity } from './entities/offer.entity';

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(OfferEntity)
    private offerRepository: Repository<OfferEntity>,
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<Company>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async create(offer: OfferEntity, userDto: UserDTO): Promise<OfferEntity> {
    const userId =
      (userDto as UserDTO & { sub?: number }).sub?.toString() || userDto.id;
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    const company = await this.companyRepository.findOne({
      where: { id: user?.companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    offer.companyId = company?.id;
    offer.company = company;
    const savedOffer = await this.offerRepository.save(offer);
    return savedOffer;
  }

  async findAll(): Promise<Offer[]> {
    const offers = await this.offerRepository.find({
      relations: ['company'],
    });
    return offers;
  }

  async findByCompanyId(companyId: string): Promise<Offer[]> {
    const offers = await this.offerRepository.find({
      where: { companyId },
      relations: ['company'],
    });
    return offers;
  }

  async findOne(id: number): Promise<Offer | null> {
    const offer = await this.offerRepository.findOne({
      where: { id: id.toString() },
      relations: ['company'],
    });
    return offer;
  }
  async update(
    id: number,
    updateOfferDto: UpdateOfferDTO,
  ): Promise<Offer | null> {
    const existingOffer = await this.offerRepository.findOneBy({
      id: id.toString(),
    });
    if (!existingOffer) {
      throw new NotFoundException('Offer not found');
    }

    await this.offerRepository.update(id, {
      ...updateOfferDto,
      updatedAt: new Date(),
    });

    const updatedOffer = await this.offerRepository.findOne({
      where: { id: id.toString() },
      relations: ['company'],
    });

    return updatedOffer;
  }

  async remove(id: number): Promise<void> {
    const offer = await this.offerRepository.findOneBy({
      id: id.toString(),
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    await this.offerRepository.delete(id);
  }
}
