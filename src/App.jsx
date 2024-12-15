// App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { useTitle } from './hooks/useTitle';

function App() {
  useTitle((import.meta.env.VITE_APP_TITLE || 'Pedidos WhatsApp') + ' - ' + 'Home');
  const [pedido, setPedido] = useState({
    nome: '',
    telefone: '',
    itens: [],
    observacoes: ''
  });

  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pesquisa, setPesquisa] = useState('');
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);

  useEffect(() => {
    carregarProdutos();
  }, [pesquisa]);

  const carregarProdutos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/produtos');
      setProdutos(response.data);
      // filtrar produtos
      setProdutosFiltrados(response.data.filter(produto => produto.nome.toLowerCase().includes(pesquisa.toLowerCase())));
      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError('Erro ao carregar produtos');
      setLoading(false);
    }
  };

  const adicionarAoCarrinho = (produto, quantidade) => {
    const itemExistente = pedido.itens.find(item => item.produto === produto.id);

    if (itemExistente) {
      // Atualiza a quantidade se o item já existe
      setPedido({
        ...pedido,
        itens: pedido.itens.map(item =>
          item.produto === produto.id
            ? { ...item, quantidade: item.quantidade + quantidade }
            : item
        )
      });
    } else {
      // Adiciona novo item
      setPedido({
        ...pedido,
        itens: [...pedido.itens, { produto: produto.id, quantidade: quantidade }]
      });
    }
  };

  const removerDoCarrinho = (produtoId) => {
    setPedido({
      ...pedido,
      itens: pedido.itens.filter(item => item.produto !== produtoId)
    });
  };

  const atualizarQuantidade = (produtoId, novaQuantidade) => {
    if (novaQuantidade < 1) {
      removerDoCarrinho(produtoId);
      return;
    }
    
    setPedido({
      ...pedido,
      itens: pedido.itens.map(item =>
        item.produto === produtoId
          ? { ...item, quantidade: novaQuantidade }
          : item
      )
    });
  };

  const calcularTotal = () => {
    return pedido.itens.reduce((total, item) => {
      const produto = produtos.find(p => p.id === item.produto);
      return total + (produto?.preco || 0) * item.quantidade;
    }, 0);
  };

  const formatarPreco = (preco) => {
    return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const enviarPedidoWhatsApp = () => {
    const pedidoFormatado = `Pedido: ${pedido.nome}\nTelefone: ${pedido.telefone}\nObservações: ${pedido.observacoes}\n\nItens: ${pedido.itens.map(item => `${item.quantidade}x ${produtos.find(p => p.id === item.produto)?.nome || 'Produto não encontrado'}`).join('\n')}`;
    const url = `https://api.whatsapp.com/send?phone=${import.meta.env.VITE_WHATSAPP_NUMBER}&text=${encodeURIComponent(pedidoFormatado)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="container">
      <h1>Faça seu Pedido</h1>
      
      {loading && <p>Carregando produtos...</p>}
      {error && <p className="erro">{error}</p>}
      {/* search */}
      <input type="text" placeholder="Pesquisar" 
        value={pesquisa}
        onChange={(e) => setPesquisa(e.target.value)}
      />

      <div className="produtos-grid">
        {produtosFiltrados.map(produto => (
          <div key={produto.id} className="produto-card">
            <img 
              src={produto.imagem_url || '/placeholder.png'} 
              alt={produto.nome}
              className="produto-imagem"
            />
            <div className="produto-info">
              <h3>{produto.nome}</h3>
              <p className="produto-preco">{formatarPreco(produto.preco || 0)}</p>
              <p className="produto-descricao">{produto.descricao}</p>
              <div className="quantidade-controle">
                <button 
                  onClick={() => adicionarAoCarrinho(produto, 1)}
                  className="quantidade-btn"
                >
                  +
                </button>
                <span className="quantidade">
                  <input 
                    type="number"
                    value={pedido.itens.find(item => item.produto === produto.id)?.quantidade || 0}
                    onChange={(e) => atualizarQuantidade(produto.id, e.target.value)}
                    className="quantidade-input"
                  />
                </span>
                <button 
                  onClick={() => {
                    const item = pedido.itens.find(item => item.produto === produto.id);
                    if (item && item.quantidade > 0) {
                      atualizarQuantidade(produto.id, item.quantidade - 1);
                    }
                  }}
                  className="quantidade-btn"
                >
                  -
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="carrinho">
        <h2>Seu Pedido</h2>
        {pedido.itens.map(item => {
          const produto = produtos.find(p => p.id === item.produto);
          return produto ? (
            <div key={item.produto} className="carrinho-item">
              <span>{produto.nome}</span>
              <div className="quantidade-controle">
                <button 
                  onClick={() => atualizarQuantidade(item.produto, item.quantidade - 1)}
                  className="quantidade-btn"
                >
                  -
                </button>
                <input 
                  type="number"
                  value={item.quantidade}
                  onChange={(e) => atualizarQuantidade(item.produto, e.target.value)}
                  className="quantidade-input"
                />
                <button 
                  onClick={() => atualizarQuantidade(item.produto, item.quantidade + 1)}
                  className="quantidade-btn"
                >
                  +
                </button>
              </div>
              <span>{formatarPreco(produto.preco * item.quantidade)}</span>
              <button 
                onClick={() => removerDoCarrinho(item.produto)}
                className="remover-btn"
              >
                X
              </button>
            </div>
          ) : null;
        })}
        
        <div className="total">
          <strong>Total: {formatarPreco(calcularTotal())}</strong>
        </div>

        <div className="form-group">
          <input
            type="text"
            placeholder="Seu nome"
            value={pedido.nome}
            onChange={(e) => setPedido({...pedido, nome: e.target.value})}
          />
          <input
            type="tel"
            placeholder="Seu telefone"
            value={pedido.telefone}
            onChange={(e) => setPedido({...pedido, telefone: e.target.value})}
          />
          <textarea
            placeholder="Observações"
            value={pedido.observacoes}
            onChange={(e) => setPedido({...pedido, observacoes: e.target.value})}
          />
        </div>

        <button 
          className="finalizar-pedido"
          onClick={() => {
            enviarPedidoWhatsApp();
          }}
        >
          Finalizar Pedido
        </button>
      </div>
    </div>
  );
}

export default App;