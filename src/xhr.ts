import { AxiosRequestConfig, AxiosResponse, AxiosPromise } from './types'
import { parseHeaders } from './helpers/headers'
import { createError } from './helpers/error'

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const { url, method = 'get', data = null, headers, responseType, timeout } = config

    const ajaxRequest = new XMLHttpRequest()
    ajaxRequest.open(method.toUpperCase(), url, true)

    if (responseType) {
      ajaxRequest.responseType = responseType
    }

    if (timeout) {
      ajaxRequest.timeout = timeout
    }

    ajaxRequest.onreadystatechange = function() {
      if (ajaxRequest.status === 0) {
        return
      }
      if (ajaxRequest.readyState === 4) {
        const responseHeaders = parseHeaders(ajaxRequest.getAllResponseHeaders())
        const responseData =
          responseType && responseType !== 'text' ? ajaxRequest.response : ajaxRequest.responseText
        const response: AxiosResponse = {
          data: responseData,
          status: ajaxRequest.status,
          statusText: ajaxRequest.statusText,
          headers: responseHeaders,
          config,
          ajaxRequest
        }
        handleResponse(response)
      }
      function handleResponse(response: AxiosResponse) {
        if (ajaxRequest.status >= 200 && ajaxRequest.status < 300) {
          resolve(response)
        } else {
          reject(
            createError(
              `Request failed with status code ${ajaxRequest.status}`,
              config,
              null,
              ajaxRequest,
              response
            )
          )
        }
      }
    }
    ajaxRequest.onerror = function() {
      reject(createError('Network Error', config, null, ajaxRequest))
    }
    ajaxRequest.ontimeout = function() {
      reject(createError(`Timeout of ${timeout} ms exceeded`, config, 'ECONNABORTED', ajaxRequest))
    }

    Object.keys(headers).forEach(name => {
      if (data === null && name.toLowerCase() === 'content-type') {
        delete headers[name]
      } else {
        ajaxRequest.setRequestHeader(name, headers[name])
      }
    })

    ajaxRequest.send(data)
  })
}
