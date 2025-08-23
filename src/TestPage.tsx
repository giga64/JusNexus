import React from 'react';

const TestPage = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#1a1a2e', 
      color: 'white', 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div>
        <h1>JusNexus - Teste de Carregamento</h1>
        <p>Se você está vendo esta mensagem, o React está funcionando!</p>
        <button onClick={() => alert('Botão funcionando!')}>
          Testar Interação
        </button>
      </div>
    </div>
  );
};

export default TestPage;
