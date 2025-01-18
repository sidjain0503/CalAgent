import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CALENDAR_CONFIG } from '../../config/calendar';

export class GoogleAuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(
      GOOGLE_CALENDAR_CONFIG.clientId,
      GOOGLE_CALENDAR_CONFIG.clientSecret,
      GOOGLE_CALENDAR_CONFIG.redirectUri
    );
  }

  getAuthUrl(): string {
    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: GOOGLE_CALENDAR_CONFIG.scopes,
    });
  }

  async getTokens(code: string) {
    const { tokens } = await this.client.getToken(code);
    return tokens;
  }
}
