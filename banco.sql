CREATE DATABASE IF NOT EXISTS pedidos_db;
USE pedidos_db;

CREATE TABLE produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  categoria VARCHAR(50),
  imagem_url VARCHAR(255),
  ativo BOOLEAN DEFAULT true
);

INSERT INTO produtos (nome, descricao, preco, categoria) VALUES
('X-Burger', 'Hambúrguer com queijo', 15.90, 'Lanches'),
('X-Salada', 'Hambúrguer com queijo e salada', 17.90, 'Lanches'),
('X-Bacon', 'Hambúrguer com queijo e bacon', 19.90, 'Lanches');
