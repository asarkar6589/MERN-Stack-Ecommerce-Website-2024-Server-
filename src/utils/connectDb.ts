import mongoose from "mongoose";

export const connectDataBase = ({url} : {url: string}) => {
    mongoose.connect(url, {
        dbName: "ECommerce"
    }).then(() => {
        console.log("Database Connection established");
    }).catch((e) => {
        console.log(e.message);
    });
}