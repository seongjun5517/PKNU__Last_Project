const {createProxyMiddleware} = require("http-proxy-middleware");

module.exports = function(app){

    app.use(
        "/spring",

        createProxyMiddleware({
            target : "http://localhost:8080",
            changeOrigin : true,
            "secure" : true,

            pathRewrite : {
                "^/spring" : "",
            }
        })
    )

    app.use(
        "/flask",
        createProxyMiddleware({
            target : "http://localhost:5000", 
            changeOrigin : true,
            "secure" : true,
            pathRewrite : {
                "^/flask" : "",
            },
        })
    );
}
