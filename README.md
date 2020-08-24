# amqp-sample

Implementação básica da lib _amqplib_ em uma API Node com Typescript.

A ideia deste repositório é implementar uma conexão com amqp de forma simples para ser utilizada por diversos projetos. Encapsulando toda implementação do amqp dentro de um único módulo, para ser utilizada de maneira similar ao _Express_.

Ainda estou trabalhando neste código, mas quero refatorá-lo para colocar isso em um pacote npm e utilizar em outros projetos.

## Executando o projeto

Após clonar e instalar as dependências do projeto, suba um contâiner com uma imagem do rabbit.

```
docker run -itd --rm --name amqp -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

Depois execute a api com o comando `yarn start:dev` e tente acessar esta url `http://localhost:3000/`, o resultado deve ser algo assim:

```
{
  message: "Hello World!"
}
```

Para postar uma mensagem no Rabbit utilize o Insomnia/Postman para executar um `/POST` na rota `http://localhost:3000/message` passando um JSON. Você verá uma mensagem no terminal da API e terá um retorno assim:

```
{
  "message": "Message published!",
  "data": {
    "teste": "Seu JSON",
  }
}
```
