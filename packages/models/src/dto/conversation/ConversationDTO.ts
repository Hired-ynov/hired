import { IsArray, IsUUID, ValidateNested } from 'class-validator';
import { BaseDTO } from '../utils/BaseDTO';
import { OfferDTO } from '../offer/OfferDTO';
import { Type } from 'class-transformer';

export class ConversationDTO extends BaseDTO {
  @IsArray()
  @IsUUID(4, { each: true })
  participantIds: string[];

  @IsUUID()
  offerId: string;

  @ValidateNested()
  @Type(() => OfferDTO)
  offer: OfferDTO;
}
