import { z } from 'zod';
    import { zendeskClient } from '../zendesk-client.js';
    import { READ_ONLY } from './annotations.js';

    export const talkTools = [
      {
        name: "get_talk_stats",
        description: "Get Zendesk Talk statistics",
        annotations: READ_ONLY,
        schema: {},
        handler: async () => {
          try {
            const result = await zendeskClient.getTalkStats();
            return {
              content: [{ 
                type: "text", 
                text: JSON.stringify(result, null, 2)
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Error getting Talk stats: ${error.message}` }],
              isError: true
            };
          }
        }
      }
    ];
