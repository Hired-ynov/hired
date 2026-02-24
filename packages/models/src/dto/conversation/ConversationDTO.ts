import { Type } from 'class-transformer';
import { IsArray, IsUUID, ValidateNested } from 'class-validator';

import { OfferDTO } from '../offer/OfferDTO';
import { BaseDTO } from '../utils/BaseDTO';

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
