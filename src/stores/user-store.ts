import { defineStore } from 'pinia';
import { IUser, IUserProfile } from 'components/models';
import { api } from 'src/boot/axios';

export const useUserStore = defineStore('user', {
  state: () => ({
    discordProfil: <IUser | null>null,
    user: <IUserProfile | null>null,
    hasRegister: false,
    hasSetupProfile: <boolean>false,
  }),
  getters: {
    isConnected(): boolean {
      return this.discordProfil !== null;
    },
    isAdmin(): boolean {
      return this.isConnected && this.discordProfil?.profile === 'admin';
    },
    isOldDiscordUser(): boolean {
      return this.discordProfil?.discriminator === '0';
    },
  },
  actions: {
    clear() {
      this.user = null;
      this.discordProfil = null;
      this.hasRegister = false;
    },
    login() {
      const OAuth2Params: URLSearchParams = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.DISCORD_OOTR_LADDER_ID ?? '',
        redirect_uri: `${process.env.DOMAIN}/${process.env.URL_SEGMENT_FOR_AUTH_CALLBACK}`,
        scope: 'identify',
      });
      window.location.href = `${process.env.DISCORD_API_ENDPOINT}/oauth2/authorize?${OAuth2Params}`;
    },
     async logout() {
      try {
        await api.post(`${process.env.DOMAIN}/${process.env.URL_SEGMENT_FOR_LOGOUT}`)
      } catch(error) {
        console.error(error)
      } finally {
        this.clear();
      }
    },
    async getProfiles() {
      try {
        const responseDiscordProfile = await api(
          `${process.env.DOMAIN}/${process.env.URL_SEGMENT_FOR_DISCORD_PROFILE}`,
          {
            withCredentials: true,
          }
        );
        if (responseDiscordProfile.data.username) {
          this.discordProfil = responseDiscordProfile.data;
          const username = this.isOldDiscordUser
            ? `${this.discordProfil?.username}#${this.discordProfil?.discriminator}`
            : `${this.discordProfil?.global_name}`;
          try {
            const responseUserProfile = await api.get(`player/${username}`);
            this.user = responseUserProfile.data;
            this.hasRegister = true;
          } catch (error: any) {
            if (error.response.status === 404) {
              this.hasRegister = false;
            }
            console.error(error);
          }
        }
      } catch (error: any) {
        console.error(error);
      } finally {
        this.hasSetupProfile = true;
      }
    },
  },
});
