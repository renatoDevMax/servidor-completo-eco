import { Module } from '@nestjs/common';
import { BdServicesService } from './bd-services.services';
import { WhatsAppService } from '../../services/whatsapp.service';

@Module({
  providers: [BdServicesService, WhatsAppService],
  exports: [BdServicesService],
})
export class BdServicesModule {}
