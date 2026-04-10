import client from './client.js';

export const humanizeText = async ({ text, tone }) => {
  // TODO: Replace with actual API call when backend is fully ready
  // try {
  //   const response = await client.post('/api/rewrite', { text, tone });
  //   return response.data.data;
  // } catch (error) {
  //   throw error;
  // }

  // Mock response for now
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        outputText: "This is the humanized version of your text. It sounds much more natural now.",
        aiScoreBefore: 94,
        aiScoreAfter: 11,
        creditsUsed: 1,
        creditsRemaining: 9
      });
    }, 1500);
  });
};
