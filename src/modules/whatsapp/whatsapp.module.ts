import { Module } from '@nestjs/common';
import { WhatsAppService } from './services/whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';

@Module({
  providers: [WhatsAppService],
  exports: [WhatsAppService],
  controllers: [WhatsAppController],
})
export class WhatsAppModule {}
