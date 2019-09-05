import { createError } from '../../src/helpers/error'
import { AxiosRequestConfig, AxiosResponse } from '../../src/types'

describe('helpers::error', function() {
  test('should create an Error with message, config, code, ajaxRequest, response and isAxiosError', () => {
    const ajaxRequest = new XMLHttpRequest()
    const config: AxiosRequestConfig = { method: 'post' }
    const response: AxiosResponse = {
      status: 200,
      statusText: 'OK',
      headers: null,
      ajaxRequest,
      config,
      data: { foo: 'bar' }
    }
    const error = createError('Boom!', config, 'SOMETHING', ajaxRequest, response)
    expect(error instanceof Error).toBeTruthy()
    expect(error.message).toBe('Boom!')
    expect(error.config).toBe(config)
    expect(error.code).toBe('SOMETHING')
    expect(error.ajaxRequest).toBe(ajaxRequest)
    expect(error.response).toBe(response)
    expect(error.isAxiosError).toBeTruthy()
  })
})
