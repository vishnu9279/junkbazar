"use strict";

app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader) {
        return res.status(401).json({
            error: "Authorization header is missing" 
        });
    }
  
    const tokenParts = authHeader.split(" ");

    if (tokenParts.length !== 2 || tokenParts[0].toLowerCase() !== "bearer") {
        return res.status(401).json({
            error: "Invalid Authorization header format" 
        });
    }
  
    const token = tokenParts[1];
  
    try {
        // Verify the token using the secret key (replace 'your_secret_key' with your actual secret key)
        const decoded = jwt.verify(token, "your_secret_key");
  
        // Attach the decoded payload to the request for later use in routes
        req.user = decoded;
  
        next();
    }
    catch (error) {
        return res.status(401).json({
            error: "Invalid token" 
        });
    }
});