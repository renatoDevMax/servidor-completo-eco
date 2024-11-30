import { Injectable } from '@nestjs/common';
import { Client, LocalAuth, Location } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { Subject } from 'rxjs';

@Injectable()
export class WhatsAppService {
  private client: Client;
  private readyPromise: Promise<void>;
  private resolveReady: () => void;
  public qrCode$ = new Subject<string>();
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: process.env.WHATSAPP_DATA_PATH || './whatsapp-auth',
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
        ],
      },
    });

    this.readyPromise = new Promise((resolve) => {
      this.resolveReady = resolve;
    });

    this.setupEventListeners();
    this.client.initialize().catch(this.handleInitializationError.bind(this));
  }

  private setupEventListeners() {
    this.client.on('qr', (qr) => {
      console.log('Novo QR Code gerado');
      qrcode.generate(qr, { small: true });
      this.qrCode$.next(qr);
    });

    this.client.on('ready', () => {
      console.log('WhatsApp Client está pronto!');
      this.reconnectAttempts = 0;
      this.resolveReady();
      this.qrCode$.next(null);
    });

    this.client.on('disconnected', () => {
      console.log('WhatsApp Client desconectado');
      this.handleDisconnection();
    });

    this.client.on('auth_failure', () => {
      console.log('Falha na autenticação do WhatsApp');
      this.handleAuthFailure();
    });
  }

  private async handleInitializationError(error: Error) {
    console.error('Erro ao inicializar WhatsApp:', error);
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      console.log(`Tentativa de reconexão ${this.reconnectAttempts}...`);
      setTimeout(() => this.initializeClient(), 5000 * this.reconnectAttempts);
    }
  }

  private async handleDisconnection() {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      console.log(`Tentativa de reconexão ${this.reconnectAttempts}...`);
      this.initializeClient();
    }
  }

  private async handleAuthFailure() {
    console.log('Reiniciando cliente após falha de autenticação...');
    this.initializeClient();
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
