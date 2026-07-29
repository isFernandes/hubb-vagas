# Design Spec: Item 12.11 - Busca por Geolocalização (Raio de Atuação)

## Goal
Permitir que candidatos localizem vagas dentro de um raio geográfico específico a partir de sua localização atual (via GPS) ou de um endereço de busca, otimizando o tempo de deslocamento para os bicos.

## Architecture
1. **Database Schema:**
   - Adicionar os campos `latitude Float?` e `longitude Float?` no modelo `Job` e `User` (Prisma).
   - Criar índices no banco de dados para aceleração de buscas geográficas.
2. **Backend Geocoding and Proximity logic:**
   - Criar um `GeocodingService` no backend com integração ao Nominatim API para resolver endereços de texto em latitude/longitude caso o frontend não envie as coordenadas.
   - Modificar `PrismaJobsRepository.findAll` para realizar busca por coordenadas via fórmula de Haversine em raw SQL, obtendo os IDs válidos e depois fazendo findMany para resgatar os relacionamentos corretos.
3. **Frontend Geocoding and Maps:**
   - Utilizar a API de Geolocalização do navegador (`navigator.geolocation`) e serviços de autocomplete de endereços no browser para geocodificar inputs na origem antes do envio.

## Proposed Changes
- [schema.prisma](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/infra/prisma/schema.prisma): Adicionar colunas de latitude/longitude para Job e User.
- [prismaJobs.repository.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/infra/prisma/prisma-repository/prismaJobs.repository.ts): Query Raw do PostgreSQL baseada em Haversine.
- [geocoding.service.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/infra/geocoding/geocoding.service.ts): [NEW] Serviço de geocodificação Nominatim de fallback.
- [NewJob.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/company/NewJob.tsx): Input com geocodificação na criação de vagas.
- [JobsList.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/candidate/JobsList.tsx): Filtros de distância e botão para ativar GPS do navegador.

## Verification
- Teste de integração do `GeocodingService` backend para resolver texto de endereços em coordenadas.
- Teste unitário de Haversine no repositório simulando proximidade de raio.
