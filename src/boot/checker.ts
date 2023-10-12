import { boot } from 'quasar/wrappers'

export default boot(({}) => {
    Object.values(process.env).forEach((value) => {
        if (value === '') {
            throw new Error('Missing values in the .env 👺')
        }
    })
})
