const timeoutMiddleware = (timeout) => (req, res, next) => {
    // Define o tempo limite da resposta do servidor para este pedido
    res.setTimeout(timeout, () => {
        const err = new Error('O pedido demorou muito tempo a responder (Request Timeout).');
        err.status = 408;
        next(err);
    });

    // Define o tempo limite do pedido do servidor para este pedido
    req.setTimeout(timeout);

    next();
};

module.exports = timeoutMiddleware;