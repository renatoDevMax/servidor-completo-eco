import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { WhatsAppService } from './services/whatsapp.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  @Get()
  @Render('index')
  async getHello() {
    return {
      message: this.appService.getHello(),
      qrCode: await new Promise((resolve) => {
        const subscription = this.whatsappService.qrCode$.subscribe((qr) => {
          subscription.unsubscribe();
          resolve(qr);
        });
      }),
    };
  }
}
