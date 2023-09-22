import axios, { AxiosError } from 'axios';
import OpenAI from 'openai';

/* I feel like returning error objects is better than handling them here. 
  That way I don't have to inject res and I can handle errors the way I want 
  from the route function.
*/

export function getOpenAiError(error: unknown) {
  if (error instanceof OpenAI.APIError) {
    return {
      status: error.status,
      message: error.message,
    };
  } else {
    return error;
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
