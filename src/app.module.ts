import { Module } from '@nestjs/common';
import { AppGateway } from './gateway/app.gateway';
import { BdServicesModule } from './modules/bd-services/bd-services.module';
import { AppController } from './app.controller';

@Module({
  imports: [BdServicesModule],
  controllers: [AppController],
  providers: [AppGateway],
})
export class AppModule {}
