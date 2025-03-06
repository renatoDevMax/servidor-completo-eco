import { Module } from '@nestjs/common';
import { BdServicesService } from './bd-services.services';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [WhatsAppModule],
  providers: [BdServicesService],
  exports: [BdServicesService],
})
export class BdServicesModule {}
