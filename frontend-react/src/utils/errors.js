export function parseError(err, status) {
  if (!navigator.onLine) {
    return 'Нет подключения к интернету'
  }
  if (err.message === 'Failed to fetch') {
    return 'Не удалось подключиться к серверу — убедись что бекенд запущен'
  }
  if (status === 429) {
    return 'Лимит переводов на сегодня исчерпан — возвращайся завтра!'
  }
  if (status === 500) {
    return 'Ошибка на сервере — попробуй ещё раз'
  }
  if (status === 403) {
    return 'Закончились кредиты API — проверь баланс'
  }
  return 'Что-то пошло не так — попробуй ещё раз'
}