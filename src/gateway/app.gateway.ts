import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { BdServicesService } from '../modules/bd-services/bd-services.services';
import { entregasTipo } from 'src/types/entregasTypes';
import { clientesTipo } from 'src/types/clientesType';

@WebSocketGateway({
  cors: {
    origin: '*', // Substitua pelo domínio do seu aplicativo Next.js
    credentials: true,
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger('AppGateway');

  constructor(private readonly bdServicesService: BdServicesService) {}

  /**Verficando as conexões com o usuário */
  afterInit(server: Server) {
    this.logger.log('Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log('Cliente conectado: ' + client.id);
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Cliente desconectado: ' + client.id);
  }

  /**Processos pertinentes ao usuário */

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
  async handleBuscarEntregas(client: Socket) {
    const minhasEntregas = await this.bdServicesService.entregasDoDia();
    console.log(
      `Entregas do dia resgatadas: ${minhasEntregas.length} entregas`,
    );
    client.emit('Atualizando entregas', minhasEntregas);
  }

  @SubscribeMessage('Buscar Clientes')
  async handleBuscarClientes(client: Socket) {
    const todosClientes = await this.bdServicesService.meusClientes();
    client.emit('Atualizando clientes', todosClientes);
  }

  @SubscribeMessage('Criar Entrega')
  async handleGerarEntrega(client: Socket, entregaNova: entregasTipo) {
    const entregasDoDia =
      await this.bdServicesService.criandoEntrega(entregaNova);
    const minhasEntregas = await this.bdServicesService.entregasDoDia();
    client.emit('Atualizando entregas', minhasEntregas);
  }

  @SubscribeMessage('Atualizar Entrega')
  async handleAtualizarEntrega(client: Socket, entregaUpdate: entregasTipo) {
    const todasEntregas =
      await this.bdServicesService.atualziandoEntregas(entregaUpdate);
    client.emit('Atualizando entregas', todasEntregas);
  }

  @SubscribeMessage('Deletar Entrega')
  async handleDeletarEntrega(client: Socket, entregaDelete: entregasTipo) {
    const todasEntregas =
      await this.bdServicesService.deletarEntrega(entregaDelete);
    client.emit('Atualizando entregas', todasEntregas);
  }

  @SubscribeMessage('Buscar Entregas Relatorio')
  async handleEntregasRelatorio(client: Socket) {
    const todasEntregasRel =
      await this.bdServicesService.todasEntregasRelatorio();
    client.emit('Atualizando entregas relatorio', todasEntregasRel);
  }

  @SubscribeMessage('Criar Cliente')
  async handleCriandoCliente(client: Socket, clienteRecebido: clientesTipo) {
    const todosClientes =
      await this.bdServicesService.criandoCliente(clienteRecebido);
    client.emit('Atualizando clientes', todosClientes);
  }

  @SubscribeMessage('Atualizar Cliente')
  async handleAtualizarCliente(client: Socket, clienteRecebido: clientesTipo) {
    const todosClientes =
      await this.bdServicesService.atualizandoCliente(clienteRecebido);
    client.emit('Atualizando clientes', todosClientes);
  }

  @SubscribeMessage('Deletar Cliente')
  async handleDeletarCliente(client: Socket, clienteRecebido: clientesTipo) {
    const todosClientes =
      await this.bdServicesService.deletandoCliente(clienteRecebido);
    client.emit('Atualizando clientes', todosClientes);
  }

  @SubscribeMessage('solicitar-usuarios')
  async handleSolicitarUsuarios(client: Socket) {
    const todosClientes = await this.bdServicesService.todosUsuariosBanco();
    client.emit('todos-usuarios', todosClientes);
  }

  // @SubscribeMessage('Mensagem Chegada Cliente')
  // handleMensagemChegadaCliente(client: Socket, dadosMensagem: any) {
  //   this.bdServicesService.enviandoMensagem(dadosMensagem);
  // }

  // @SubscribeMessage('Localizacao Entrega')
  // handleLocalizacaoEntrega(client: Socket, dadosObj: any) {
  //   this.bdServicesService.localzacaoEntrega(
  //     dadosObj.entrega,
  //     dadosObj.dadosMensagem,
  //   );
  // }

  // Adicione mais handlers aqui conforme necessário
}
