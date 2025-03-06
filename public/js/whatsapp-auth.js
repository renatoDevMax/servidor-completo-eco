// Inicializa a conexão socket
const socket = io();

const sendTestMessage = async (event) => {
  event.preventDefault();
  const phone = document.getElementById('phone').value;
  const message = document.getElementById('message').value;
  const responseDiv = document.getElementById('responseMessage');

  // Envia a mensagem via socket
  socket.emit('Enviar Mensagem', {
    contato: phone,
    mensagem: message,
  });

  // Limpa as mensagens anteriores
  responseDiv.className = 'response-message';
  responseDiv.textContent = 'Enviando mensagem...';
};

// Ouve a resposta de sucesso
socket.on('Mensagem Enviada', (response) => {
  const responseDiv = document.getElementById('responseMessage');
  responseDiv.textContent = 'Mensagem enviada com sucesso!';
  responseDiv.className = 'response-message response-success';
  document.getElementById('messageForm').reset();
});

// Ouve erros
socket.on('Erro Mensagem', (error) => {
  const responseDiv = document.getElementById('responseMessage');
  responseDiv.textContent =
    'Erro: ' + (error.error || 'Não foi possível enviar a mensagem');
  responseDiv.className = 'response-message response-error';
});

const checkStatus = async () => {
  try {
    const response = await fetch('/whatsapp/status');
    const data = await response.json();

    const statusDiv = document.getElementById('status');
    const loadingDiv = document.getElementById('loading');
    const qrcodeDiv = document.getElementById('qrcode');
    const instructionsDiv = document.getElementById('instructions');
    const testFormDiv = document.getElementById('testForm');

    statusDiv.textContent = data.message;
    const statusClass =
      'status-container ' +
      (data.status === 'connected'
        ? 'status-connected'
        : data.qrCode
          ? 'status-disconnected'
          : 'status-connecting');
    statusDiv.className = statusClass;

    loadingDiv.className =
      data.qrCode || data.status === 'connected' ? 'loading hidden' : 'loading';
    testFormDiv.className =
      data.status === 'connected' ? 'test-form' : 'test-form hidden';

    if (data.qrCode) {
      qrcodeDiv.innerHTML = '';
      qrcodeDiv.className = '';
      instructionsDiv.className = '';

      new QRCode(qrcodeDiv, {
        text: data.qrCode,
        width: 256,
        height: 256,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H,
      });
    } else {
      qrcodeDiv.innerHTML = '';
      qrcodeDiv.className = 'hidden';
      instructionsDiv.className = 'hidden';
    }

    if (data.status !== 'connected') {
      setTimeout(checkStatus, 5000);
    }
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    setTimeout(checkStatus, 5000);
  }
};

checkStatus();
