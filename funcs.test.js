import { functions } from './funcs.js'

function format(input) {
  return JSON.stringify(input, null, '  ');
}

function eq(input, mustEqual) {
  if (input == mustEqual) {
    return
  }

  throw new Error(`Expected ${format(input)} to equal ${format(mustEqual)}`)
  // throw err`Expected ${input} to equal ${mustEqual}`
}

const to = {
  eq: Object.assign((a, b) => a == b, { expectation: 'to equal' })
}

function expect(a, matcher, b) {
  if (matcher(a, b)) {
    return
  }

  throw new Error(`Expected ${format(a)} ${matcher.expectation} ${format(b)}`) 
}

function it(description, body) {
  try {
    body();
    console.error('✅ ', description)
  }
  catch (e) {
    console.error('❌ ', description)
    throw e;
  }
}

const request = {
  headers: {
    get(key) {
      if (key === 'CF-Connecting-IP') {
        return '1.2.3.4'
      }
    }
  }
};

const functionsForRequest = functions({ request });

it('returns the ip address from the request', () => {
  expect(
    functionsForRequest[0]('Viewer.ipAddress')(),
    to.eq,
    '1.2.3.4'
  )
});

it('returns a string', () => {
  expect(
    functionsForRequest[0]('"hello"')(),
    to.eq,
    'hello'
  )
});
