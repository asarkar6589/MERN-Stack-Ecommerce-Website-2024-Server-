import { Document } from "mongoose"

interface MyDocument extends Document {
    createdAt: Date,
    discount?: number,
    total?: number
}
interface Props {
    length: number,
    today: Date,
    arr: MyDocument[],
    property?: "discount" | "total"
}

export const createArray = ({length, today, arr, property}: Props) => {
    const data:number[] = new Array(length).fill(0);

    arr.forEach((i) => {
        let creationDate = i.createdAt;

        /*
                
            There is a small bug in defining monthDifference. Lets understand this with an example.

            1 - Suppose creating date is 12 Nov 2023 and current date is 15 Jan 2024. Now we can see that there is a 1 month gap between the two dates but if we see according to this formula then the ans is different, that is (0 - 11) which is -11, but the ans should be 1. So what we can do is, we have to add 12 after all of this calculation.

            2 - Now we have added 12 in our formula, but it will not work for other cases. For eg if creation date is 12 Aug 2023 and today date is 1 nov 2023, then the month difference is of 3 months, but in the formula, we have added 12, so it will give the ans as 15 months which is not the correct ans. So to fix this, we have to take modulo of the whole thing with 12. Now 15 % 12 is 3

            So basically we have to do 2 mandetory things : 
            1 - Add 12
            2 - Take modulo with 12.    
                
        */
        let monthDifference = (today.getMonth() - i.createdAt.getMonth() + 12) % 12;

        if (monthDifference < length) {
            if (property) {
                data[length - monthDifference - 1] += i[property]!;
            }
            else {
                data[length - monthDifference - 1] += 1;
            }
        }
    });

    return data;
}

export const calculatePercentage = (thisMonth:number, lastMonth:number):number => {
    if (lastMonth === 0) {
        // means number of products created in last month = 0
        return thisMonth * 100;
    }
    const percentage:number = ((thisMonth - lastMonth) / lastMonth) * 100; // relative percentage change
    return Number(percentage.toFixed(0));
}