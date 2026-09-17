'use client';

import base64 from 'base-64';
import axios, { type AxiosResponse, type AxiosError } from 'axios';

// interfaces
export interface IResponse {
  data: {
    title?: string;
    results?: any;
    detail?: string;
  };
  status?: number;
}

export interface IRequest {
  url: string;
  method: string;
  postData?: any;
}

// variables
const auth = {
  username: 'username',
  password: 'password',
};

const createAuth = base64.encode(`${auth.username}:${auth.password}`);

/**
 * Generates the base URL for API requests.
 *
 * @return {string} The base URL for API requests.
 */
const buildUrl = (): string => {
  const fromBackend = process.env.NEXT_PUBLIC_BACKEND_URL;
  const fromApi = process.env.NEXT_PUBLIC_API_BASE_URL;
  const hardcodedFallback = 'https://backend-m5yd.onrender.com';
  let base: string = (fromBackend ?? fromApi ?? hardcodedFallback).trim();
  if (base.endsWith('/')) {
    base = base.slice(0, -1);
  }
  return base;
};

/**
 * Parses a JSON string into a JavaScript object.
 *
 * @param {string} value - The JSON string to be parsed.
 * @return {any} The parsed JavaScript object.
 */
const parseResults = (value: string): any => {
  const parse = JSON.parse(value);

  return parse;
};

/**
 * This function makes a request to the API and returns the response.
 *
 * @param {IRequest} parameters - The parameters for the request.
 * @return {Promise<IResponse>} The response from the API.
 */
const getResponse = async (parameters: IRequest): Promise<IResponse> => {
  let response: AxiosResponse<any, any>;

  const url = parameters.url.startsWith('http')
    ? parameters.url
    : `${buildUrl()}/${parameters.url.replace(/^\//, '')}`;

  const headers = { Authorization: `Basic ${createAuth}` };

  try {
    if (parameters.method === 'GET') {
      response = await axios.get(url, { headers, timeout: 90000 });
    } else if (parameters.method === 'POST') {
      response = await axios.post(url, parameters.postData, { headers, timeout: 90000 });
    } else {
      throw new Error('Invalid HTTP method. Please use GET or POST.');
    }

    const d: IResponse = {
      data: response.data,
      status: response.status,
    };

    return d;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const err = error as AxiosError;

      const responseText: string = (err.request as any)?.responseText ?? '';
      const serverData = (err.response as any)?.data ?? null;

      const parsedResults = serverData ?? (responseText ? parseResults(responseText) : {});
      const normalizedTitle =
        (parsedResults as any)?.title ?? (parsedResults as any)?.detail ?? err.message;

      const d: IResponse = {
        data: { ...(parsedResults as any), title: normalizedTitle },
        status: (err.response as any)?.status,
      };

      return d;
    }

    const err = error as Error;

    const d: IResponse = {
      data: {
        title: err.message,
      },
      status: 0,
    };

    return d;
  }
};

const Request = {
  getResponse,
};

export default Request;
