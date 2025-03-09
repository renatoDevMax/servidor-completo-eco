import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppGateway } from './gateway/app.gateway';
import { BdServicesModule } from './modules/bd-services/bd-services.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';

@Module({
  imports: [BdServicesModule, WhatsAppModule],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
