import test from 'ava'
import sinon from 'sinon'
import 'babel-register'
import waitUntilPromise, { setPromiseImplementation } from './waitUntilPromise'

test.beforeEach('before', () => {
  setPromiseImplementation(Promise)
})

test('resolve if function returns true', () => {
  return waitUntilPromise(() => true)
})

test('resolve with the return value', async t => {
  t.truthy(
    await waitUntilPromise(() => 'this is a truthy value'),
    'this is a truthy value'
  )
})

test('reject if function returns false', t => {
  t.throws(waitUntilPromise(() => false), 'Wait until promise timed out')
})

test('should allow setting custom Promise implementation', t => {
  const resolve = sinon.spy()

  setPromiseImplementation({ resolve })

  waitUntilPromise(() => true)

  t.truthy(resolve.called)
})

test.serial('should allow setting custom maxWait', async t => {
  let count = 0
  sinon.spy(global, 'setTimeout')
  sinon.spy(global, 'setInterval')

  await waitUntilPromise(() => count++ > 0, 32)

  t.truthy(global.setTimeout.calledOnce)
  t.truthy(global.setInterval.calledOnce)

  t.truthy(global.setTimeout.getCall(0).args[1], 32)

  global.setTimeout.restore()
  global.setInterval.restore()
})

test.serial('should allow setting custom checkDelay', async t => {
  let count = 0
  sinon.spy(global, 'setTimeout')
  sinon.spy(global, 'setInterval')

  await waitUntilPromise(() => count++ > 0, undefined, 32)

  t.truthy(global.setTimeout.calledOnce)
  t.truthy(global.setInterval.calledOnce)

  t.truthy(global.setInterval.getCall(0).args[1], 32)

  global.setTimeout.restore()
  global.setInterval.restore()
})

test('should reject with the exception if the functions throws', t => {
  t.throws(waitUntilPromise(() => ({}).someFunction()), /is not a function/)
})

test.serial('should not call setTimeout or setInterval if function immediately returns truthy', async () => {
  sinon.spy(global, 'setTimeout')
  sinon.spy(global, 'setInterval')

  await waitUntilPromise(() => true)

  sinon.assert.notCalled(global.setTimeout)
  sinon.assert.notCalled(global.setInterval)

  global.setTimeout.restore()
  global.setInterval.restore()
})

test.serial('should call setTimeout or setInterval once if function returns truthy', async () => {
  let count = 0

  sinon.spy(global, 'setTimeout')
  sinon.spy(global, 'setInterval')

  await waitUntilPromise(() => count++ > 0)
  sinon.assert.callCount(global.setTimeout, 1)
  sinon.assert.callCount(global.setInterval, 1)

  global.setTimeout.restore()
  global.setInterval.restore()
})

test('should reject in timer if function throws', t => {
  let count = 0

  const prom = waitUntilPromise(() => {
    if (count++ === 0) {
      return false
    }

    ({}).someFunction()
  })

  t.throws(prom, /is not a function/)
})

test.serial('should throw if no Promise is available', t => {
  setPromiseImplementation(null)

  t.throws(() => waitUntilPromise(() => true), /Wait Until Promise: No global Promise available/)
})
