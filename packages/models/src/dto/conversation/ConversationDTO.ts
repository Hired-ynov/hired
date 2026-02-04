import { IsUUID } from 'class-validator';
import { BaseDTO } from '../baseDTO/BaseDTO';
import { OfferDto } from '../offer/OfferDTO';

export class ConversationDTO extends BaseDTO {
  @IsArray()
  @IsUUID({ each: true })
  participantIds: string[];

  @IsUUID()
  offerId: string;

  @ValidateNested()
  @Type(() => OfferDto)
  offer: OfferDto;
}
