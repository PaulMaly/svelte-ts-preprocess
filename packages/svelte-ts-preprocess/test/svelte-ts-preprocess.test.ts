import preprocess from '../src/svelte-ts-preprocess'

describe('preprocess test', () => {
  it('should be function', () => {
    expect(preprocess).toBeInstanceOf(Function)
  })

  it('returns object with "script" property', () => {
    expect(preprocess()).toHaveProperty('script')
  })

  it('run preprocess', () => {
    // const code = ``
    const content = ``
    const filename = 'Component.svelte'
    const attributes = {
      lang: 'ts'
    }
    expect(
      preprocess().script({
        content,
        filename,
        attributes
      })
    ).toHaveProperty('code')
  })
})
