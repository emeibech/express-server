import axios, { type AxiosError } from 'axios';
import jwt from 'jsonwebtoken';
import OpenAI from 'openai';

/* These functions just return error messages instead of handling them.
  That way I don't have to inject res and I can handle errors 
  the way I want from the routes. */

export function getOpenAiError(error: unknown) {
  function formatError(errorMessage: string) {
    if (errorMessage.includes('Connection error.')) {
      return `${errorMessage} Please check your internet connection.`;
    } else {
      return errorMessage;
    }
  }

  if (error instanceof OpenAI.APIError) {
    return `${error.status ?? ''} ${formatError(error.message)}`;
  } else {
    return `${error}`;
  }
}

export function getAxiosError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return {
        status: axiosError.response.status,
        data: axiosError.response.data,
      };
    } else if (axiosError.request) {
      return {
        request: axiosError.request,
      };
    } else {
      return {
        message: axiosError.message,
      };
    }
  } else {
    return error;
  }
}

export function getJwtError(error: unknown) {
  const jwtError = error as jwt.JsonWebTokenError;
  return `${jwtError.name}: ${jwtError.message}`;
}
