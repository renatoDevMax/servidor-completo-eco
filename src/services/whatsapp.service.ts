import { Injectable } from '@nestjs/common';
import { Client, LocalAuth, Location } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class WhatsAppService {
  private client: Client;
  private readyPromise: Promise<void>;
  private resolveReady: () => void;

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
    });

    this.readyPromise = new Promise((resolve) => {
      this.resolveReady = resolve;
    });

    this.initialize();
  }

  private initialize() {
    this.client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      console.log('WhatsApp Client está pronto!');
      this.resolveReady();
    });

    this.client.initialize();
  }

  async onReady(): Promise<void> {
    return this.readyPromise;
  }

  async sendMessage(to: string, message: string): Promise<void> {
    await this.client.sendMessage(to, message);
  }

  async sendLocation(
    to: string,
    latitude: number,
    longitude: number,
  ): Promise<void> {
    const location: {
      latitude: string;
      longitude: string;
      description: string;
    } = {
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      description: 'Localização da entrega',
    };
    await this.client.sendMessage(to, location);
  }
}
