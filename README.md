# Blockchain Dashboard Frontend

React 기반 블록체인 대시보드 프론트엔드입니다.

## 실행

```bash
npm install
npm run dev
```

## API 연결

- 기본적으로 Vite 프록시를 통해 `/api` 요청을 `http://localhost:8090`으로 전달합니다.
- 다른 백엔드 주소를 직접 사용하려면 `.env` 파일을 만들고 아래처럼 설정합니다.

```env
VITE_API_BASE_URL=http://localhost:8090
```

## 현재 구현 페이지

- `/` : 전체 트랜잭션 목록 + 검색 + 페이징
- `/wallets/:walletAddress` : 지갑 상세 + 관련 트랜잭션 목록 + 페이징
- `/transactions/:txHash` : 트랜잭션 상세

## 프론트가 기대하는 API 예시

- `GET /api/blockchain/transactions?page=1&keyword=...`
- `GET /api/blockchain/wallets/{walletAddress}?page=1`
- `GET /api/blockchain/transactions/{txHash}`
