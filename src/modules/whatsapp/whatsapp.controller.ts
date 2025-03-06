import {
  Controller,
  Post,
  Body,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { WhatsAppService } from './services/whatsapp.service';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Get('status')
  getStatus() {
    const isReady = this.whatsappService.isWhatsAppReady();
    const qrCode = this.whatsappService.getQRCode();

    return {
      status: isReady ? 'connected' : 'disconnected',
      qrCode: qrCode, // Retorna null se já estiver conectado
      message: isReady
        ? 'WhatsApp conectado e pronto para uso'
        : qrCode
          ? 'Escaneie o QR Code para conectar'
          : 'Inicializando conexão...',
    };
  }

  @Post('send-message')
  async sendMessage(@Body('to') to: string, @Body('message') message: string) {
    if (!to || !message) {
      throw new HttpException(
        'Número de telefone e mensagem são obrigatórios',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      await this.whatsappService.sendMessage(to, message);
      return { success: true, message: 'Mensagem enviada com sucesso' };
    } catch (error) {
      throw new HttpException(
        'Erro ao enviar mensagem: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
