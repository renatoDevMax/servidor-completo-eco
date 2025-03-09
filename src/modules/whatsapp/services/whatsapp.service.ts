import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class WhatsAppService implements OnModuleInit {
  private client: Client;
  private isReady: boolean = false;
  private qrCode: string | null = null;
  private qrCodeAscii: string | null = null;
  private readonly logger = new Logger(WhatsAppService.name);

  constructor() {
    this.client = new Client({
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      },
      authStrategy: new LocalAuth({
        clientId: 'ecoclean-client',
        dataPath: '.wwebjs_auth',
      }),
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.client.on('qr', (qr) => {
      this.qrCode = qr;
      qrcode.generate(qr, { small: true }, (qrtext) => {
        this.qrCodeAscii = qrtext;
        this.logger.log(
          'Novo QR Code recebido. Por favor, escaneie com o WhatsApp:',
        );
        this.logger.log(qrtext);
      });
    });

    this.client.on('ready', () => {
      this.isReady = true;
      this.qrCode = null;
      this.qrCodeAscii = null;
      this.logger.log('Cliente WhatsApp está pronto e conectado!');
    });

    this.client.on('authenticated', () => {
      this.logger.log('Cliente WhatsApp autenticado com sucesso!');
    });

    this.client.on('auth_failure', (msg) => {
      this.isReady = false;
      this.logger.error('Falha na autenticação do WhatsApp:', msg);
      this.qrCode = null;
      this.qrCodeAscii = null;
    });

    this.client.on('disconnected', (reason) => {
      this.isReady = false;
      this.logger.warn('Cliente WhatsApp foi desconectado:', reason);
      this.qrCode = null;
      this.qrCodeAscii = null;
    });

    this.client.on('change_state', (state) => {
      this.logger.log('Estado do WhatsApp alterado para:', state);
    });
  }

  async initialize(): Promise<void> {
    try {
      this.logger.log('Inicializando cliente WhatsApp...');
      await this.client.initialize();
    } catch (error) {
      this.logger.error('Erro ao inicializar cliente WhatsApp:', error);
      await this.clearAuthFolder();
      throw error;
    }
  }

  private async clearAuthFolder(): Promise<void> {
    try {
      const fs = require('fs');
      const path = require('path');
      const authPath = path.join(process.cwd(), '.wwebjs_auth');

      if (fs.existsSync(authPath)) {
        fs.rmSync(authPath, { recursive: true, force: true });
        this.logger.log('Pasta de autenticação limpa com sucesso');
      }
    } catch (error) {
      this.logger.error('Erro ao limpar pasta de autenticação:', error);
    }
  }

  async onModuleInit(): Promise<void> {
    await this.initialize();
  }

  public isWhatsAppReady(): boolean {
    return this.isReady;
  }

  public getQRCode(): string | null {
    return this.qrCode;
  }

  public async sendMessage(to: string, message: string): Promise<void> {
    if (!this.isReady) {
      throw new Error(
        'Cliente WhatsApp não está pronto. Aguarde a conexão ou escaneie o QR Code.',
      );
    }

    try {
      const formattedNumber = this.formatPhoneNumber(to);
      await this.client.sendMessage(`${formattedNumber}@c.us`, message);
      this.logger.log(`Mensagem enviada com sucesso para ${formattedNumber}`);
    } catch (error) {
      this.logger.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Remove todos os caracteres não numéricos
    const numbers = phone.replace(/\D/g, '');

    // Verifica se o número tem o formato correto (com ou sem 55)
    if (numbers.length < 10 || numbers.length > 13) {
      throw new Error(
        'Número de telefone inválido. Use o formato: 5541999999999',
      );
    }

    // Se o número não começar com 55, adiciona
    if (!numbers.startsWith('55')) {
      return '55' + numbers;
    }

    return numbers;
  }
}
