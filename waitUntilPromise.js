let PromiseImplementation = Promise

function clearTimers (timeout, interval) {
  clearTimeout(timeout)
  clearInterval(interval)
}

export const setPromiseImplementation = (implementation) => {
  PromiseImplementation = implementation
}

export default function (escapeFunction, maxWait = 50, checkDelay = 1) {
  return new PromiseImplementation((resolve, reject) => {
    let maxWaitTimeout

    // Run the function once without setting up any listeners in case it's already true
    try {
      const escapeFunctionRes = escapeFunction()

      if (escapeFunctionRes) return resolve(escapeFunctionRes)
    } catch (e) {
      return reject(e)
    }

    const interval = setInterval(() => {
      try {
        const escapeFunctionRes = escapeFunction()

        if (escapeFunctionRes) {
          clearTimers(maxWaitTimeout, interval)

          resolve(escapeFunctionRes)
        }
      } catch (e) {
        clearTimers(maxWaitTimeout, interval)

        reject(e)
      }
    }, checkDelay)

    maxWaitTimeout = setTimeout(() => {
      clearTimers(maxWaitTimeout, interval)

      reject('Wait until promise timed out')
    }, maxWait)
  })
}
