{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://your-api-url.com",
    "ANOTHER_ENV_VAR": "value"
  }
}