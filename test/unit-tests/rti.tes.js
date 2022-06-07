const {rti} = require('../../index');

describe('rti middleware', () => {
    it('should throw missing apiKey error', () => {
        const options = {
            tagHash: 'abc'
        }

        expect(() => rti(options)).toThrow('missing apiKey')
    })

    it('should throw missing tagHash error', () => {
        const options = {
            apiKey: 'abc'
        }
        expect(() => rti(options)).toThrow('missing tagHash')
    })

    it('should express handler function', () => {
        const options = {
            apiKey: 'abc',
            tagHash: 'abc'
        }
        expect(() => rti(options)).toBeInstanceOf(Function)
    })
})