import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, OAuthAccount } from '../entities';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(OAuthAccount)
    private oauthAccountRepository: Repository<OAuthAccount>,
  ) {}

  /**
   * Валидация пользователя из Google OAuth
   * Создает нового пользователя или обновляет существующего
   */
  async validateGoogleUser(profile: any) {
    const email = profile.emails[0].value;
    const providerId = profile.id;

    // Проверяем, существует ли OAuth аккаунт
    let oauthAccount = await this.oauthAccountRepository.findOne({
      where: {
        provider: 'google',
        provider_user_id: providerId,
      },
      relations: ['user'],
    });

    if (oauthAccount) {
      // Обновляем существующий OAuth аккаунт
      oauthAccount.provider_email = email;
      oauthAccount.display_name = profile.displayName;
      oauthAccount.avatar_url = profile.photos?.[0]?.value;
      oauthAccount.raw_data = profile._json;
      oauthAccount.last_used_at = new Date();

      await this.oauthAccountRepository.save(oauthAccount);

      // Обновляем last_login_at пользователя
      await this.userRepository.update(oauthAccount.user.id, {
        last_login_at: new Date(),
      });

      return oauthAccount.user;
    }

    // Проверяем, существует ли пользователь с таким email
    let user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Создаем нового пользователя
      user = this.userRepository.create({
        email: email,
        username: email.split('@')[0], // Генерируем username из email
        display_name: profile.displayName,
        avatar_url: profile.photos?.[0]?.value,
        is_email_verified: true, // Email от Google уже подтвержден
        is_active: true,
        roles: ['user'],
        last_login_at: new Date(),
      });

      user = await this.userRepository.save(user);
    }

    // Создаем новый OAuth аккаунт для этого пользователя
    oauthAccount = this.oauthAccountRepository.create({
      user_id: user.id,
      provider: 'google',
      provider_user_id: providerId,
      provider_email: email,
      display_name: profile.displayName,
      avatar_url: profile.photos?.[0]?.value,
      raw_data: profile._json,
      last_used_at: new Date(),
    });

    await this.oauthAccountRepository.save(oauthAccount);

    return user;
  }

  /**
   * Генерация JWT токена для пользователя
   */
  async generateToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.display_name || user.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.display_name || user.username,
        avatar: user.avatar_url,
        roles: user.roles,
      },
    };
  }
}
