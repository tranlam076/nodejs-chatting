'use strict';

export default class ResponseHelper {
    responseSuccess = (res, data) => {
        return res.status(200).json({
            success: true,
            data: data
        })
    };

    responseError = (res, data) => {
        console.log(data);
        return res.status(400).json({
            success: false,
            error: data.message
        })
    }
}
