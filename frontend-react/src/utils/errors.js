export function parseError(err, t) {
  if (!navigator.onLine) {
    return t('errors.noInternet')
  }

  if (err?.message === 'Failed to fetch') {
    return t('errors.serverDown')
  }

  switch (err?.status) {
    case 429:
      return t('errors.rateLimit')
    case 403:
      return t('errors.noCredits')
    case 502:
    case 503:
    case 504:
      return t('errors.serverDown')
    case 500:
      return t('errors.serverError')
    default:
      return err?.message || t('errors.unknown')
  }
}
