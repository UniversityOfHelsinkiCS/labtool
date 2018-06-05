let address
const hostname = window && window.location && window.location.hostname

console.log('hostname', hostname)

if (hostname.startsWith('localhost')) {
  address = 'favicon.ico'
} else {
  address = '/labtool/favicon.ico'
}
export const LOGO = address
