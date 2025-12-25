# Initialize environment

```bash
npm init -y 
```

Your structure should now be:

```
backend/
├── node_modules/
├──package.json
└── src/
    ├──config/
    ├── jobs/
    ├── monitor/
    ├── alerts/
    ├── db/
    └── index.js

```

### In `package.json`

- "main": "index.js"
To:
    
    "main": "src/index.js"
    
- Add a script:
    
    "scripts":{
    "start":"node src/index.js"
    }
    

So now `npm start` will work

---

## Setup Docker

create Docker file .dockerignore 

build by  `docker build -t server-uptime-monitor .`

run by `docker run --rm server-uptime-backend`
created docker compose file 

run `docker compose up —build`