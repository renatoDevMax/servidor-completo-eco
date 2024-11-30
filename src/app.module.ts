import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppGateway } from './gateway/app.gateway';
import { BdServicesModule } from './modules/bd-services/bd-services.module';
import { WhatsAppService } from './services/whatsapp.service';

@Module({
  imports: [BdServicesModule],
  controllers: [AppController],
  providers: [AppService, AppGateway, WhatsAppService],
})
export class AppModule {}
