# SkillScape

While developing SkillScape we used macOS and Ubuntu on AWS, but Windows should be similar too.

---

## Database Setup

1. **Open terminal**

2. **Install PostgreSQL**
        - **macOS (Homebrew):**
            ```bash
            brew update
            brew install postgresql
            ```
        - **Ubuntu (or any Debian-based Linux):**
            ```bash
            sudo apt update
            sudo apt install postgresql postgresql-contrib
            ```

3. **Start PostgreSQL**
        - **macOS:**
            ```bash
            brew services start postgresql
            ```
        - **Ubuntu:**
            ```bash
            sudo systemctl start postgresql
            ```

4. **Access PostgreSQL**
        - **macOS:**
            ```bash
            psql postgres
            ```
        - **Ubuntu:**
            ```bash
            sudo -i -u postgres
            psql
            ```

5. **Create database and user**
        ```sql
        CREATE USER skillscape_user WITH PASSWORD '';
        CREATE DATABASE skillscape_db OWNER skillscape_user;
        ```

6. **Set permissions**
        ```sql
        GRANT ALL PRIVILEGES ON DATABASE skillscape_db TO skillscape_user;
        ```

7. **Quit**
        ```sql
        \q
        ```

---

## Java Project - Maven

Run the following command in the `backend-new` folder:

```bash
mvn clean compile spring-boot:run
```

If it does not compile or run, check the database credentials in the `application.properties` file under the `resources` folder. Make sure the username and password are correct. You can find dependencies in the `pom.xml` file.

---

## Frontend

In another terminal, go to the `frontend` folder and run (Python required):

```bash
python3 -m http.server 8000
# or
python -m http.server 8000
```

Now go to [localhost:8000/landing.html](http://localhost:8000/landing.html) in your browser.

---

## AI Service

In another terminal, go to the SkillScape (project root) folder (Python required):

1. **Activate virtual python environment:**
        ```bash
        source venv/bin/activate
        ```
2. **Run the AI service:**
        ```bash
        uvicorn ai_service:app --reload --port 5001
        ```

---

## Things you can do

**Note:** You can buy your own gigs/listing for quick testing purposes.

### Auth
- Login
- Register
- Reset Password (link will be in maven console)
- Change Password

### Customer
- Create Listings
- View/Remove Listings
- Award Bids
- See Orders
- Browse Gigs
- Order Gigs
- AI while Ordering

### Freelancer
- Create Gigs
- View/Remove Gigs
- View Jobs
- Browse Listings
- Bid to Listings

### Other
- Upload Files
- Download Files
- Delete Account
- Landing Page

---

## Technologies Used

### Java
- Maven
    - Spring Boot
- PostgreSQL
- Lombok
- JWT
    - JWT API
    - JWT IMPL
    - JWT Jackson

### CSS & HTML & JS

### Python
- FastAPI
- CORS
- Uvicorn
- OpenAI SDK
- Pydantic

    
