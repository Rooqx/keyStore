# Backend (Node.js with Bun) Assessment Project

### 🔗 Quick Endpoints Reference# Port number the server will run on

## ENVIRONMENT VARIABLES

PORT=4000

# Environment (development | production)

NODE_ENV=development

# MongoDB connection string

MONGO_URI="mongodb+srv://test:test@cluster0.xg8uuhh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# Access token secret (JWT)

ACCESS_TOKEN_SECRET=secret

# Access token expiration time

ACCESS_TOKEN_EXPIRES_IN=1h

# Refresh token secret (JWT)

REFRESH_TOKEN_SECRET=supersecret

# Refresh token expiration time

REFRESH_TOKEN_EXPIRES_IN=7d

# Refresh token expiration time in milliseconds

REFRESH_TOKEN_EXPIRES_MS=604800000

# Arcjet API key

ARCJET_KEY=ajkey_01k6jwge4pftfan5yj58p1qsw0

# Arcjet environment

ARCJET_ENV=development

- **POST /api/v1/auth/signup** → Create a new user account
- **POST /api/v1/auth/signin** → Sign in an existing user
- **POST /api/v1/integrations/getresponse** → Save a GetResponse API key
- **POST /api/v1/integrations/mailchimp** → Save a Mailchimp API key
- **GET /api/v1/integrations/mailchimp/:id/lists** → Get all lists (contacts) from a stored Mailchimp key
- **GET /api/v1/integrations/getresponse/:id/lists** → Get all lists (contacts) from a stored GetResponse key
- **GET /api/v1/integrations/esp/lists** → Get contacts from all stored Mailchimp/GetResponse keys
- **GET /api/v1/integrations** → View all stored keys

---

### How to Run Locally

This project uses **Bun** as the package manager (not npm).

#### 📦 Install Bun

##### 🪟 Windows

1. Go to [https://bun.sh](https://bun.sh) and download the installer (`.msi`).
2. Run the installer.
3. Open a new terminal (PowerShell or CMD) and check:
   ```bash
   bun -v
   ```

##### 🐧 Linux

```bash
curl -fsSL https://bun.sh/install | bash
```

Then restart your terminal (or run `source ~/.bashrc` / `source ~/.zshrc`).  
Check:

```bash
bun -v
```

##### 🍎 macOS

Same as Linux:

```bash
curl -fsSL https://bun.sh/install | bash
```

Restart your terminal and check:

```bash
bun -v
```

---

#### 📂 Project Setup

1. Install dependencies:
   ```bash
   bun install
   ```
2. Start the dev server:
   ```bash
   bun run dev
   ```

If everything works, you should see something like:

```
✅ Server running at http://localhost:4000
MongoDB connected
Environment: development
```

---

### 🔑 Routes & Usage (Detailed)

#### 1. **Signup**

- **POST** `http://localhost:4000/api/v1/auth/signup`
- Body:
  ```json
  {
    "email": "example@gmail.com",
    "password": "123456"
  }
  ```

#### 2. **Signin**

- **POST** `http://localhost:4000/api/v1/auth/signin`
- Body:
  ```json
  {
    "email": "example@gmail.com",
    "password": "123456"
  }
  ```

#### 3. **Add GetResponse API Key**

- **POST** `http://localhost:4000/api/v1/integrations/getresponse`
- Body:
  ```json
  {
    "name": "optional key name",
    "key": "your-api-key"
  }
  ```

#### 4. **Add Mailchimp API Key**

- **POST** `http://localhost:4000/api/v1/integrations/mailchimp`
- Body:
  ```json
  {
    "name": "optional key name",
    "key": "your-api-key"
  }
  ```
  👉 No need to manually add tokens to headers — cookies handle authentication.

#### 5. **Get Mailchimp Contacts (by key id) get keys id endpoint at the No. 8**

- **GET** `http://localhost:4000/api/v1/integrations/mailchimp/:id/lists`

#### 6. **Get GetResponse Contacts (by key id)**

- **GET** `http://localhost:4000/api/v1/integrations/getresponse/:id/lists`

#### 7. **Get All Contacts (Mailchimp + GetResponse)**

- **GET** `http://localhost:4000/api/v1/integrations/esp/lists`  
  👉 Loops through all stored keys and fetches contacts from each.

#### 8. **Get All Stored Keys**

- **GET** `http://localhost:4000/api/v1/integrations`

"NOTE: RATELIMTING; IF YOU SPAM THE ANY OF THE ENDPOINT FOR 5 TIMES STARIGHT YOU WILL GET 429 ERROR"
