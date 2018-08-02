'use strict';

export default class Response {
    static returnSuccess = (res, data) => {
        return res.status(200).json({
            success: true,
            data: data
        })
    };

    static returnError = (res, data) => {
        console.log(data);
        return res.status(400).json({
            success: false,
            error: data.message
        })
    }
}
