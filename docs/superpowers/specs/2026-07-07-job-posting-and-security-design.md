# Spec: Job Posting Enhancements & User Security

**Date:** 2026-07-07

## 1. Remuneração da Vaga (Valor Fixo)
- **Database (Prisma):** Adicionar coluna `paymentAmountCents` do tipo `Int` no model `Job`. (Salvando em centavos como um número inteiro para evitar flutuação/perda de precisão e permitir ordenamento/soma no banco. Ex: 100 reais = `10000`).
- **Backend (API):**
  - O DTO de criação e atualização da vaga aceitará o valor já convertido, validando via Zod com `z.number().int().positive()`.
- **Frontend:**
  - O input da tela `NewJob.tsx` possuirá máscara de moeda (R$) visualmente. Antes do envio via `axios/fetch`, o valor será multiplicado por 100 e enviado inteiro.
  - A renderização nas listagens dividirá o valor por 100 e formatará como `BRL` usando `Intl.NumberFormat`.

## 2. Validação Matemática de CPF (Candidatos)
- **Database (Prisma):** Adicionar `cpf String @unique` no model `User`.
- **Backend (API):**
  - Implementar validação matemática do módulo 11 (2 dígitos verificadores) dentro da validação Zod de `create-account.dto.ts`.
  - O CPF será salvo limpo (somente os 11 dígitos, sem traços ou pontos).
- **Frontend:**
  - O componente de registro aplicará a máscara `000.000.000-00` dinamicamente no input. O valor enviado para a API será sanitizado (replace de não-numéricos).

## 3. Validação Real de CNPJ (Empresas)
- **Backend (Accounts):**
  - O fluxo síncrono de criação de conta interceptará requisições onde a role seja `Company`.
  - Será disparado um `GET` para a Brasil API: `https://brasilapi.com.br/api/cnpj/v1/{cnpj}`.
  - Se a resposta for um `400`, `404` ou se o serviço estiver inoperante (timeout/500), a API lançará uma `BadRequestException`, bloqueando imediatamente a criação da conta.

## 4. E-mails de Rejeição (Fechamento da Vaga)
- **Job Closure Worker:**
  - Após adquirir o lock em `job-lock:{jobId}` e mudar a vaga para `CLOSED_HIRED`, o worker fará um `updateMany` na tabela de `applications`.
  - Todas as aplicações da vaga, exceto a recém-aprovada, receberão o status `REJECTED`.
- **Event Driven Communication:**
  - O Worker iterará sobre as aplicações rejeitadas (buscando o usuário correspondente) e publicará o evento `application_rejected` no RabbitMQ, contendo e-mail do usuário, nome da empresa e título da vaga.
- **Notifications Consumer:**
  - Consumirá a fila e fará o disparo do e-mail com a mensagem amigável de recusa via `Nodemailer`.
