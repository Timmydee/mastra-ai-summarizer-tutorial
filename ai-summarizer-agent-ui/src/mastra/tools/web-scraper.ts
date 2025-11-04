import { createTool } from '@mastra/core';
import { z } from 'zod';
import axios from 'axios';
import * as cheerio from 'cheerio';

export const fetchWebContent = createTool({
  id: 'fetch-web-content',
  description:
    'Fetches and extracts the main content from a web page URL. Use this when you need to get the text content of an article or web page.',
  inputSchema: z.object({
    url: z.string().url().describe('The URL of the web page to fetch'),
  }),
  outputSchema: z.object({
    content: z.string().describe('The extracted text content'),
    title: z.string().describe('The page title'),
    success: z.boolean().describe('Whether the fetch was successful'),
    error: z.string().optional().describe('Error message if fetch failed'),
  }),
  execute: async ({ context }) => {
    try {
      const { url } = context;

      // Fetch the HTML
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SummarizerBot/1.0)',
        },
      });

      // Parse HTML with Cheerio
      const $ = cheerio.load(response.data);

      // Remove unwanted elements
      $('script, style, nav, footer, iframe, aside').remove();

      // Extract title
      const title =
        $('title').text().trim() || $('h1').first().text().trim() || 'Untitled';

      // Extract main content
      // Try to find main content area first
      let content =
        $('article').text() ||
        $('main').text() ||
        $('.content').text() ||
        $('body').text();

      // Clean up the content
      content = content
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
        .trim();

      // Limit content length to avoid token limits
      const maxLength = 10000;
      if (content.length > maxLength) {
        content = content.substring(0, maxLength) + '...';
      }

      return {
        content,
        title,
        success: true,
      };
    } catch (error) {
      return {
        content: '',
        title: '',
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
});
