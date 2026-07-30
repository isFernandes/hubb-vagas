# Design Spec: Improvement 4.2 - Funil de Contratação (Kanban) Board

## Goal
Implementar um quadro Kanban interativo (drag-and-drop) para visualização e transição simplificada das fases de contratação de candidatos por vaga pela empresa.

## Architecture
1. **Representação das Colunas (ApplicationStatus):**
   - **Triagem:** Candidatos em `APPLIED`.
   - **Entrevista:** Candidatos em `SCREENING`.
   - **Reserva (Standby):** Candidatos em `STANDBY`. *Coluna condicional, exibida apenas se a vaga possuir a propriedade `enableStandby` ativada.*
   - **Aprovados/Contratados:** Candidatos em `APPROVED`.
   - **Rejeitados:** Candidatos em `REJECTED`.
2. **Integração de Pagamento Mercado Pago:**
   - Ao arrastar um card para a coluna `APPROVED` (Aprovados), o card entra em estado de carregamento e dispara o modal de checkout.
   - Caso o pagamento seja aprovado no webhook, o card é consolidado na coluna. Se for cancelado ou falhar, o card retorna de forma automática para a coluna de origem.
3. **Métricas Visuais nos Cards:**
   - Cada card exibirá de forma compacta: nome do candidato, foto, reputação (estrelas), matching de afinidade e nota obtida no teste de triagem rápido (se houver).

## Proposed Changes
- [JobDetails.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/company/JobDetails.tsx): Implementar switch para alternar visualizações (Lista vs Kanban) e gerenciar estados do drag.
- [KanbanBoard.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/components/KanbanBoard.tsx): [NEW] Componente autônomo do quadro Kanban integrado a bibliotecas leve de drag-and-drop.
- [applications.controller.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/applications/applications.controller.ts): Garantir endpoints flexíveis para atualização de status rápidos.

## Verification
- Teste unitário verificando restrições de transição de status no backend.
- Teste de interface simulando o retorno de card à coluna original caso a etapa de checkout de contratação falhe ou seja cancelada.
