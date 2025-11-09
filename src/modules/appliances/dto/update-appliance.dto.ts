import { PartialType } from '@nestjs/mapped-types';
import { CreateApplianceDto } from './create-appliance.dto';

export class UpdateApplianceDto extends PartialType(CreateApplianceDto) {}
