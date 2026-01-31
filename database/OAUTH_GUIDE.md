# OAuth Authentication Guide

## Структура

```sql
users
  ├─ oauth_accounts (Google, GitHub, etc.)
  └─ sessions (JWT refresh tokens)
```

## Таблицы

### oauth_accounts
```sql
CREATE TABLE oauth_accounts (
    user_id UUID,
    provider VARCHAR(50),          -- google, github
    provider_user_id VARCHAR(255), -- Google sub
    provider_email VARCHAR(255),
    access_token TEXT,             -- Зашифрован
    refresh_token TEXT,            -- Зашифрован
    scopes TEXT[],
    raw_data JSONB
);
```

### sessions
```sql
CREATE TABLE sessions (
    user_id UUID,
    refresh_token VARCHAR(500),    -- JWT
    device_info JSONB,
    expires_at TIMESTAMP
);
```

## OAuth Flow

1. User → "Sign in with Google"
2. Redirect to Google OAuth
3. Google → Authorization code
4. Backend → Exchange code for tokens
5. Backend → Get user info
6. Backend → Create/update user + oauth_account
7. Backend → Generate JWT tokens
8. Backend → Create session
9. Return tokens to client

## Примеры

### Создать OAuth пользователя
```sql
-- 1. User
INSERT INTO users (email, username, display_name, is_email_verified)
VALUES ('user@gmail.com', 'username', 'User Name', true)
RETURNING id;

-- 2. OAuth account
INSERT INTO oauth_accounts (
    user_id, provider, provider_user_id,
    provider_email, scopes, raw_data
)
VALUES (
    'user-id', 'google', 'google-sub-123',
    'user@gmail.com',
    ARRAY['openid', 'email', 'profile'],
    '{"sub": "...", "email": "...", "name": "..."}'::jsonb
);
```

### Найти пользователя по OAuth
```sql
SELECT u.* FROM users u
JOIN oauth_accounts oa ON u.id = oa.user_id
WHERE oa.provider = 'google'
  AND oa.provider_user_id = 'google-sub-123';
```

### Активные сессии
```sql
SELECT device_info, expires_at
FROM sessions
WHERE user_id = 'user-id' AND expires_at > NOW();
```

## Frontend (NestJS)

### Passport Strategy
```typescript
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile']
    });
  }

  async validate(accessToken, refreshToken, profile) {
    return this.authService.validateOAuthUser('google', profile);
  }
}
```

### Шифрование токенов
```typescript
import * as crypto from 'crypto';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', secretKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}
```

## .env настройки

```env
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
ENCRYPTION_KEY=your-32-byte-encryption-key
```

## Ссылки

- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [NestJS Passport](https://docs.nestjs.com/security/authentication)