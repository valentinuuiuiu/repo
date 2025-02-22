// Mock empty module for browser environments
export const pipeline = () => {
  throw new Error('chromadb embedding is not supported in browser environment');
};

export const env = {
  defaults: {
    home: '/mock-home',
  },
};

export default {
  pipeline,
  env,
};