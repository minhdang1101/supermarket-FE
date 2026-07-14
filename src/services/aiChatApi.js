import apiClient from './api';

const aiChatApi = {
  sendMessage: ({ message, history = [], pagePath = '' }) =>
    apiClient.post('/ai/chat', { message, history, pagePath }),
};

export default aiChatApi;
