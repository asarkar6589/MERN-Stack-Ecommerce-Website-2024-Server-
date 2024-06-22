export interface RequestUserBody {
    name: string,
    number: string,
    dob: Date,
    email: string,
    password: string,
    photo: string,
    gender: "Male" | "Female"
}

export interface RequestUserLoginBody {
    email: string,
    password: string,
}