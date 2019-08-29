import { isDate, isPlainObject } from './util'

function encode(val: string): string {
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
}

export default function buildURL(url: string, params?: any): string {
  if (!params) {
    return url
  }

  const parts: Array<string> = []

  Object.keys(params).forEach(key => {
    let value = params[key]
    if (value === null || typeof value === undefined) {
      return
    }
    let values: Array<string>
    if (Array.isArray(value)) {
      values = value
      key += '[]'
    } else {
      values = [value]
    }
    values.forEach(ele => {
      if (isDate(ele)) {
        ele = ele.toISOString()
      } else if (isPlainObject(ele)) {
        ele = JSON.stringify(ele)
      }
      parts.push(`${encode(key)}=${encode(ele)}`)
    })
  })

  let serializedParams = parts.join('&')

  if (serializedParams) {
    const markIndex = url.indexOf('#')
    if (markIndex !== -1) {
      url = url.slice(0, markIndex)
    }
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
  }
  return url
}
