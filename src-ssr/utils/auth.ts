import axios from 'axios';
import { IUser } from 'src/components/models';

export async function getDiscordUser(cookie?: string) {
  if (!cookie) {
    return;
  }
  const cookieTokenType = cookie
    .split('token_type')
    ?.at(1)
    ?.split('access_token')
    ?.at(0)
    ?.split('%22')
    ?.at(2);
  const cookieAccessToken = cookie
    .split('access_token')
    ?.at(1)
    ?.split('expires_in')
    .at(0)
    ?.split('%22')
    .at(2);
  if (!cookieTokenType || !cookieAccessToken) {
    return;
  }
  const responseGetUserDiscord = await axios.get(
    `${process.env.DISCORD_API_ENDPOINT}/users/@me`,
    {
      headers: {
        Authorization: `${cookieTokenType} ${cookieAccessToken}`,
      },
    }
  );
  return responseGetUserDiscord.data as IUser;
}

export async function getUserProfile(userUsername: string) {
  const userProfile = await axios.get(
    `${process.env.LADDER_BOT_HOSTNAME}/player/${userUsername}`
  );
  return userProfile.data as IUser;
}

export async function isUserAdmin(cookie?: string) {
  const user = await getDiscordUser(cookie);
  if (!user) {
    return false;
  }
  const userUsername = user.discriminator === '0' ? user.global_name as string : `${user.username}#${user.discriminator}`
  const profileUser = await getUserProfile(userUsername);
  return profileUser.profile === 'admin';
}
