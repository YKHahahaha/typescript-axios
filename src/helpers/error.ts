import { AxiosRequestConfig, AxiosResponse } from '../types'

export class AxiosError extends Error {
  isAxiosError: boolean
  config: AxiosRequestConfig
  code?: string | null
  ajaxRequest?: any
  response?: AxiosResponse

  constructor(
    message: string,
    config: AxiosRequestConfig,
    code?: string | null,
    ajaxRequest?: any,
    response?: AxiosResponse
  ) {
    super(message)

    this.isAxiosError = true
    this.config = config
    this.code = code
    this.ajaxRequest = ajaxRequest
    this.response = response

    Object.setPrototypeOf(this, AxiosError.prototype)
  }
}

export function createError(
  message: string,
  config: AxiosRequestConfig,
  code?: string | null,
  ajaxRequest?: any,
  response?: AxiosResponse
): AxiosError {
  const error = new AxiosError(message, config, code, ajaxRequest, response)
  return error
}
