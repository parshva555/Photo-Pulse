const errorMiddleware = (err, req, res, next) => {
    const defaultError = {
        statusCode: 404,
        message: err,
        success: "failed"
    }

    if(err?.name === "ValidationError"){
        defaultError.statusCode = 404;

        defaultError.message = Object.values(err.errors).map((el) => el.message).join(",");
    }

    if(err?.code === 11000 && err.code){
        defaultError.statusCode = 404;
        defaultError.message = "Duplicate field value entered"
    }

    res.status(defaultError.statusCode).json({
        success: defaultError.success,
        message: defaultError.message
    })
};

export default errorMiddleware;
