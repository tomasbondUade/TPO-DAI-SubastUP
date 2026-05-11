# SubastUp - Auction Mobile App

App móvil de subastas desarrollada con Expo (React Native).

## Estructura del proyecto

```
SubastUp/
├── app/
│   ├── _layout.tsx          # Layout raíz (QueryClient + navegación)
│   ├── index.tsx            # Redirección según autenticación
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── login.tsx        # Pantalla de Login / Registro
│   └── (tabs)/              # Pantallas principales (a completar)
├── components/              # Componentes reutilizables
├── constants/
│   └── theme.ts             # Colores, fuentes, espaciados
├── services/
│   ├── api.ts               # Instancia de Axios
│   └── authService.ts       # Servicios de autenticación
├── store/
│   └── authStore.ts         # Estado global con Zustand
├── types/
│   └── index.ts             # Interfaces TypeScript
└── hooks/                   # Custom hooks
```

## Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Correr el proyecto

```bash
npx expo start
```

Luego escaneás el QR con la app **Expo Go** en tu celular, o presionás `a` para Android / `i` para iOS en el simulador.

## Configuración

### API Base URL

Editá `services/api.ts` y cambiá la URL por la de tu backend:

```ts
const BASE_URL = 'https://tu-api.com/api';
```

### Logo

En `app/(auth)/login.tsx`, reemplazá el placeholder por tu logo real:

```tsx
<Image source={require('../../assets/logo.png')} style={styles.logoImage} />
```

## Stack tecnológico

| Librería | Uso |
|---|---|
| Expo Router | Navegación file-based |
| Zustand | Estado global (auth, carrito) |
| Axios | Llamadas REST a la API |
| React Query | Caché y fetching de datos |
| TypeScript | Tipado estático |

## Próximas pantallas a implementar

- [ ] Home / Catálogo de subastas
- [ ] Detalle de subasta
- [ ] Carrito / Checkout
- [ ] Perfil de usuario
- [ ] Órdenes / Historial
