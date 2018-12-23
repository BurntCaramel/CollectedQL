import { makeRunner } from './funcs'

let context = {
  log: [],
  success(reason) { this.log.push('✅  ' + reason) },
  failure(reason) { this.log.push('❌  ' + reason) },
  formatted() {
    return this.log; //.map(args => args.join(' ')); //.join('\n')
  }
}

function format(input) {
  return JSON.stringify(input, null, '  ');
}

const to = {
  eq: Object.assign((a, b) => a === b, { expectation: 'to equal' }),
  throwErrorMatchingMessage: Object.assign(async (a, regex) => {
    try {
      await a()
    }
    catch (e) {
      if (regex.test(e.message)) {
        return true
      }
    }
    return false
  }, { expectation: 'to throw' }),
}

function expect(a, matcher, b) {
  if (matcher(a, b)) {
    return
  }

  throw new Error(`Expected ${format(a)} ${matcher.expectation} ${format(b)}`) 
}

async function it(description, body) {
  try {
    await body();
    context.success(description)
  }
  catch (e) {
    context.failure(description + ' — ' + (!!e && e.message || ''))
    // throw e;
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

const run = makeRunner({ request });

export function suite() {
  it('returns the ip address from the current request', async () => {
    expect(
      await run('Viewer.ipAddress'),
      to.eq,
      '1.2.3.4'
    )
  });

  it('returns a string', async () => {
    expect(
      await run('"hello"'),
      to.eq,
      'hello'
    )
  });

  it('returns the SHA-256 in hex for "a"', async () => {
    expect(
      await run('sha256', ['a']),
      to.eq,
      'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
    )
  });

  it('throws an error', async () => {
    expect(
      async () => { await run('Not.Found') },
      to.throwErrorMatchingMessage,
      /No function found matching Not.Found \/ 0/
    )
  });

  it('returns a response when fetching a URL', async () => {
    // expect(
    //   await functionsForRequest[1]('sha256')('a'),
    //   to.eq,
    //   'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
    // )
    const res = await run('Fetch.get2', ['https://example.org/']);
    // expect(
    //   res, //.headers.get('Content-Type'),
    //   to.eq,
    //   'text/html'
    // )
  });

  return context.formatted(); 
}
