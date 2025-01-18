import { NextApiResponse } from 'next';

declare global {
  var calendarClients: Map<string, NextApiResponse>;
} 