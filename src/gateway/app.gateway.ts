import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { BdServicesService } from '../modules/bd-services/bd-services.services'; // Atualize o caminho conforme necessário

@WebSocketGateway()
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger('AppGateway');

  constructor(private readonly bdServicesService: BdServicesService) {}

  afterInit(server: Server) {
    this.logger.log('Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log('Cliente conectado: ' + client.id);
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Cliente desconectado: ' + client.id);
  }

  @SubscribeMessage('Autenticar Usuario')
  async handleAutenticarUsuario(client: Socket, usuario: any) {
    this.logger.log('Um usuário tentando logar...');
    const objetoAutenticate =
      await this.bdServicesService.autenticandoUsuario(usuario);
    this.logger.log('Usuario autenticado, pronto para uso');
    client.emit('Usuario Autenticado', objetoAutenticate.usuarioLogado);
  }

  @SubscribeMessage('Desconectar Usuario')
  handleDesconectarUsuario(client: Socket) {
    client.disconnect();
    this.logger.log('Um usuário abandonou a conexão');
  }

  @SubscribeMessage('Buscar Entregas')
  async handleBuscarEntregas(client: Socket, callBack: Function) {
    const minhasEntregas = await this.bdServicesService.entregasDoDia();
    callBack(minhasEntregas);
  }

  @SubscribeMessage('Atualizar Entrega')
  async handleAtualizarEntrega(client: Socket, entregaUpdate: any) {
    const todasEntregas =
      await this.bdServicesService.atualziandoEntregas(entregaUpdate);
    client.emit('Entregas Atualizadas', todasEntregas);
  }

  // Adicione mais handlers aqui conforme necessário
}
