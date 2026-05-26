# 💳 Como Integrar sua Conta do Mercado Pago ao Nosso Sistema

Olá! Para que possamos configurar a geração automática de links de pagamento para os seus orçamentos, precisamos conectar o sistema à sua conta do Mercado Pago. 

Dessa forma, todo dinheiro pago pelos seus clientes **irá diretamente para a sua conta**, sem passar por nós.

Para fazer isso, precisamos de uma credencial chamada **Access Token de Produção**. Não se preocupe, é bem simples de gerar. Siga o passo a passo abaixo:

---

## 🛠️ Passo a Passo para Gerar o Access Token

### 1. Acesse o Painel de Desenvolvedores
1. Entre na sua conta do Mercado Pago (a mesma conta onde você quer receber o dinheiro).
2. Acesse o portal de desenvolvedores através deste link:
   👉 **[https://www.mercadopago.com.br/developers/panel/app](https://www.mercadopago.com.br/developers/panel/app)**

### 2. Crie uma Aplicação (se ainda não tiver)
*Se você já ver uma tela com suas aplicações, pode pular para o Passo 3.*
1. Clique no botão **"Criar aplicação"** (ou "Create application").
2. Preencha os dados básicos que o Mercado Pago pedir (como nome da aplicação: pode colocar "Sistema de Orçamentos", por exemplo).
3. Salve e crie a aplicação.

### 3. Encontre as Credenciais de Produção
1. Com a sua aplicação aberta no painel, olhe no menu lateral esquerdo.
2. Clique na opção **"Credenciais de produção"** (Production credentials).

### 4. Copie o Access Token
1. Na tela de Credenciais de Produção, você verá vários códigos embaralhados.
2. Procure pelo código que se chama **"Access Token"**. 
   *Ele geralmente começa com as letras `APP_USR-...` e é bem longo.*
3. Clique no botão de copiar ao lado dele.

---

## 📩 O que você precisa nos enviar?

Pronto! Agora é só nos enviar o código que você copiou:

* **Access Token:** `Cole o código aqui (APP_USR-...)`

> 🔒 **Segurança:** Pode ficar tranquilo. Esse token permite apenas que nosso sistema gere links de pagamento em seu nome. Nós **não** teremos acesso à sua conta bancária, saldo ou senhas. Todo o dinheiro pago através dos links vai direto para você.

Assim que nos enviar, configuraremos o sistema e seus orçamentos passarão a ter links de pagamento gerados automaticamente!
