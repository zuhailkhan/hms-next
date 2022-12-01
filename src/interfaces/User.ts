export default interface IUser {
    name: string,
    username: string,
    email: string,
    password: string,
    role: {
        id: Number,
        name: string
    },
    refreshToken: string
}