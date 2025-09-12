/* eslint-disable no-undef */

/**
 * Window properties
 */

export const getHSUserId = () => window?.coscheduleHeadlineStudio?.hs_user_id;
export const getHSEmbedToken = () => window?.coscheduleHeadlineStudio?.hs_embed_token;

/**
 * Webpack environment variables
 */

export const hsAppEndpoint = HEADLINES_APP_URL;
export const hsApiEndpoint = HEADLINES_API_URL;
export const isDebug = DEBUG;
