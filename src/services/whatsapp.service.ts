import { Injectable } from '@nestjs/common';
import { Client, LocalAuth, Location } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { Subject } from 'rxjs';
import * as puppeteer from 'puppeteer';

@Injectable()
export class WhatsAppService {
  private client: Client;
  private readyPromise: Promise<void>;
  private resolveReady: () => void;
  public qrCode$ = new Subject<string>();
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private isReady = false;

  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      const browser = await puppeteer.launch({
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
        headless: true,
      });

      this.client = new Client({
        authStrategy: new LocalAuth({
          dataPath: process.env.WHATSAPP_DATA_PATH || './whatsapp-auth',
          clientId: 'eco-clean-whatsapp',
        }),
        puppeteer: {
          browserWSEndpoint: browser.wsEndpoint(),
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
        webVersionCache: {
          type: 'none', // Desabilita o cache da versão web
        },
        webVersion: '2.2347.52', // Especifica uma versão fixa do WhatsApp Web
      });

      this.readyPromise = new Promise((resolve) => {
        this.resolveReady = resolve;
      });

      this.setupEventListeners();
      await this.client.initialize().catch((err) => {
        console.error('Erro na inicialização do cliente:', err);
        throw err;
      });
    } catch (error) {
      console.error('Erro na inicialização do cliente:', error);
      this.handleInitializationError(error);
    }
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
      this.isReady = true;
      this.resolveReady();
      this.qrCode$.next(null);
    });

    this.client.on('disconnected', (reason) => {
      console.log('WhatsApp Client desconectado:', reason);
      this.isReady = false;
      this.handleDisconnection();
    });

    this.client.on('auth_failure', (msg) => {
      console.log('Falha na autenticação do WhatsApp:', msg);
      this.isReady = false;
      this.handleAuthFailure();
    });

    this.client.on('loading_screen', (percent, message) => {
      console.log('Carregando WhatsApp:', percent, message);
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
    if (this.isReady) {
      return Promise.resolve();
    }
    return this.readyPromise;
  }

  async sendMessage(to: string, message: string): Promise<void> {
    if (!this.isReady || !this.client) {
      throw new Error('Cliente WhatsApp não está pronto');
    }
    await this.client.sendMessage(to, message);
  }

  async sendLocation(
    to: string,
    latitude: number,
    longitude: number,
  ): Promise<void> {
    if (!this.isReady || !this.client) {
      throw new Error('Cliente WhatsApp não está pronto');
    }
    const location: Location = {
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    };
    await this.client.sendMessage(to, location);
  }

  async isClientReady(): Promise<boolean> {
    return this.isReady;
  }
}
