import Cookies from 'js-cookie';

export const COOKIE_KEYS = {
  PLAYER_POSITION: 'player_position',
  GAME_STATE: 'game_state',
  HIGH_SCORE: 'high_score'
} as const;

export const cookieManager = {
  // Sauvegarder la position du joueur
  savePlayerPosition: (position: { x: number; y: number }) => {
    Cookies.set(COOKIE_KEYS.PLAYER_POSITION, JSON.stringify(position), { expires: 7 }); // Expire dans 7 jours
  },

  // Récupérer la position du joueur
  getPlayerPosition: (): { x: number; y: number } | null => {
    const position = Cookies.get(COOKIE_KEYS.PLAYER_POSITION);
    return position ? JSON.parse(position) : null;
  },

  // Sauvegarder l'état du jeu
  saveGameState: (state: any) => {
    Cookies.set(COOKIE_KEYS.GAME_STATE, JSON.stringify(state), { expires: 7 });
  },

  // Récupérer l'état du jeu
  getGameState: (): any => {
    const state = Cookies.get(COOKIE_KEYS.GAME_STATE);
    return state ? JSON.parse(state) : null;
  },

  // Sauvegarder le meilleur score
  saveHighScore: (score: number) => {
    const currentHighScore = cookieManager.getHighScore();
    if (!currentHighScore || score > currentHighScore) {
      Cookies.set(COOKIE_KEYS.HIGH_SCORE, score.toString(), { expires: 365 }); // Expire dans 1 an
    }
  },

  // Récupérer le meilleur score
  getHighScore: (): number | null => {
    const score = Cookies.get(COOKIE_KEYS.HIGH_SCORE);
    return score ? parseInt(score) : null;
  },

  // Supprimer tous les cookies du jeu
  clearAllGameCookies: () => {
    Object.values(COOKIE_KEYS).forEach(key => {
      Cookies.remove(key);
    });
  }
}; 