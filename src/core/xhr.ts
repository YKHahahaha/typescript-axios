import { AxiosRequestConfig, AxiosResponse, AxiosPromise } from '../types'
import { parseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error'
import { isURLSameOrigin } from '../helpers/url'
import cookie from '../helpers/cookie'
import { isFormData } from '../helpers/util'

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const {
      url,
      method = 'get',
      data = null,
      headers,
      responseType,
      timeout,
      cancelToken,
      withCredentials,
      xsrfCookieName,
      xsrfHeaderName,
      onDownloadProgress,
      onUploadProgress,
      auth,
      validateStatus
    } = config

    const ajaxRequest = new XMLHttpRequest()

    ajaxRequest.open(method.toUpperCase(), url!, true)

    configureRequest()

    addEvents()

    processHeaders()

    processCancel()

    ajaxRequest.send(data)

    function configureRequest(): void {
      if (responseType) {
        ajaxRequest.responseType = responseType
      }

      if (timeout) {
        ajaxRequest.timeout = timeout
      }

      if (withCredentials) {
        ajaxRequest.withCredentials = withCredentials
      }
    }

    function addEvents(): void {
      ajaxRequest.onreadystatechange = function() {
        if (ajaxRequest.status === 0) {
          return
        }
        if (ajaxRequest.readyState === 4) {
          const responseHeaders = parseHeaders(ajaxRequest.getAllResponseHeaders())
          const responseData =
            responseType && responseType !== 'text'
              ? ajaxRequest.response
              : ajaxRequest.responseText
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
      }

      ajaxRequest.onerror = function() {
        reject(createError('Network Error', config, null, ajaxRequest))
      }

      ajaxRequest.ontimeout = function() {
        reject(
          createError(`Timeout of ${timeout} ms exceeded`, config, 'ECONNABORTED', ajaxRequest)
        )
      }

      if (onDownloadProgress) {
        ajaxRequest.onprogress = onDownloadProgress
      }

      if (onUploadProgress) {
        ajaxRequest.upload.onprogress = onUploadProgress
      }
    }

    function processHeaders(): void {
      if (isFormData(data)) {
        delete headers['Content-Type']
      }

      if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
        const xsrfValue = cookie.read(xsrfCookieName)
        if (xsrfValue && xsrfHeaderName) {
          headers[xsrfHeaderName] = xsrfValue
        }
      }

      if (auth) {
        headers['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password)
      }

      Object.keys(headers).forEach(name => {
        if (data === null && name.toLowerCase() === 'content-type') {
          delete headers[name]
        } else {
          ajaxRequest.setRequestHeader(name, headers[name])
        }
      })
    }

    function processCancel(): void {
      if (cancelToken) {
        cancelToken.promise.then(reason => {
          ajaxRequest.abort()
          reject(reason)
        })
      }
    }

    function handleResponse(response: AxiosResponse) {
      if (!validateStatus || validateStatus(response.status)) {
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
  })
}
